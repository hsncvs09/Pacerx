use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Phase {
    Idle,
    Focus,
    Break,
    Nag,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Command {
    Start,
    TogglePause,
    SkipBreak,
    AcceptBreak,
    ContinueAnyway,
    Reset,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum DomainEvent {
    PhaseChanged { from: Phase, to: Phase },
    FocusCompleted,
    BreakCompleted,
    BreakSkipped,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Config {
    pub focus: Duration,
    pub brk: Duration,
    pub nag_timeout: Duration,
}

impl Config {
    pub fn standard() -> Self {
        Self {
            focus: Duration::from_secs(25 * 60),
            brk: Duration::from_secs(5 * 60),
            nag_timeout: Duration::from_secs(5 * 60),
        }
    }

    pub fn fast() -> Self {
        Self {
            focus: Duration::from_secs(25),
            brk: Duration::from_secs(15),
            nag_timeout: Duration::from_secs(15),
        }
    }

    pub fn from_env() -> Self {
        match std::env::var("POMODORO_FAST").as_deref() {
            Ok("1") | Ok("true") | Ok("TRUE") => Self::fast(),
            _ => Self::standard(),
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self::standard()
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Snapshot {
    pub phase: Phase,
    pub remaining_secs: u64,
    pub total_secs: u64,
    pub paused: bool,
    pub sad: bool,
    pub input_recent: bool,
}

#[derive(Clone, Debug)]
pub struct Session {
    cfg: Config,
    phase: Phase,
    paused: bool,
    sad: bool,
    input_recent: bool,
    last_update: Instant,
    focus_elapsed: Duration,
    walk_elapsed: Duration,
    violation_elapsed: Duration,
    skip_emitted: bool,
}

impl Session {
    pub fn new(cfg: Config) -> Self {
        Self {
            cfg,
            phase: Phase::Idle,
            paused: false,
            sad: false,
            input_recent: false,
            last_update: Instant::now(),
            focus_elapsed: Duration::ZERO,
            walk_elapsed: Duration::ZERO,
            violation_elapsed: Duration::ZERO,
            skip_emitted: false,
        }
    }

    pub fn phase(&self) -> Phase {
        self.phase
    }

    pub fn is_break_overtime(&self, now: Instant) -> bool {
        if self.phase != Phase::Break {
            return false;
        }
        let (_, walk, _) = self.elapsed_at(now);
        walk >= self.cfg.brk
    }

    fn elapsed_at(&self, now: Instant) -> (Duration, Duration, Duration) {
        let dt = if self.paused || self.phase == Phase::Idle {
            Duration::ZERO
        } else {
            now.saturating_duration_since(self.last_update)
        };

        let mut focus = self.focus_elapsed;
        let mut walk = self.walk_elapsed;
        let mut violation = self.violation_elapsed;

        match self.phase {
            Phase::Idle => {}
            Phase::Focus => {
                focus += dt;
            }
            Phase::Break => {
                if self.input_recent && walk < self.cfg.brk {
                    violation += dt;
                } else {
                    walk += dt;
                }
            }
            Phase::Nag => {
                violation += dt;
            }
        }
        (focus, walk, violation)
    }

    fn advance_to(&mut self, now: Instant) {
        let (focus, walk, violation) = self.elapsed_at(now);
        self.focus_elapsed = focus;
        self.walk_elapsed = walk;
        self.violation_elapsed = violation;
        self.last_update = now;
    }

    pub fn set_input_recent(&mut self, recent: bool, now: Instant) {
        self.advance_to(now);
        if self.phase == Phase::Break {
            self.input_recent = recent;
        } else {
            self.input_recent = false;
        }
    }

    fn start_focus_cycle(&mut self, now: Instant) -> Vec<DomainEvent> {
        let from = self.phase;
        self.phase = Phase::Focus;
        self.paused = false;
        self.input_recent = false;
        self.last_update = now;
        self.focus_elapsed = Duration::ZERO;
        self.walk_elapsed = Duration::ZERO;
        self.violation_elapsed = Duration::ZERO;
        self.skip_emitted = false;
        vec![DomainEvent::PhaseChanged {
            from,
            to: Phase::Focus,
        }]
    }

    fn start_break_cycle(&mut self, now: Instant) -> Vec<DomainEvent> {
        let from = self.phase;
        self.phase = Phase::Break;
        self.paused = false;
        self.input_recent = false;
        self.last_update = now;
        self.focus_elapsed = Duration::ZERO;
        self.walk_elapsed = Duration::ZERO;
        self.violation_elapsed = Duration::ZERO;
        self.skip_emitted = false;
        vec![DomainEvent::PhaseChanged {
            from,
            to: Phase::Break,
        }]
    }

    pub fn handle(&mut self, cmd: Command, now: Instant) -> Vec<DomainEvent> {
        self.advance_to(now);
        match (self.phase, cmd) {
            (Phase::Idle, Command::Start) => self.start_focus_cycle(now),
            (Phase::Focus | Phase::Break, Command::TogglePause) => {
                self.paused = !self.paused;
                self.last_update = now;
                Vec::new()
            }
            (Phase::Break, Command::SkipBreak) => {
                let mut events = Vec::new();
                if !self.skip_emitted {
                    events.push(DomainEvent::BreakSkipped);
                    self.skip_emitted = true;
                }
                let from = self.phase;
                self.phase = Phase::Nag;
                self.paused = false;
                self.input_recent = false;
                self.last_update = now;
                events.push(DomainEvent::PhaseChanged {
                    from,
                    to: Phase::Nag,
                });
                events
            }
            (Phase::Nag, Command::AcceptBreak) => {
                // Resume break cycle without resetting walk_elapsed or violation_elapsed
                let from = self.phase;
                self.phase = Phase::Break;
                self.paused = false;
                self.input_recent = false;
                self.last_update = now;
                vec![DomainEvent::PhaseChanged {
                    from,
                    to: Phase::Break,
                }]
            }
            (Phase::Nag, Command::ContinueAnyway) => {
                self.sad = true;
                let mut events = Vec::new();
                if !self.skip_emitted {
                    events.push(DomainEvent::BreakSkipped);
                    self.skip_emitted = true;
                }
                events.extend(self.start_focus_cycle(now));
                events
            }
            (Phase::Focus | Phase::Break | Phase::Nag, Command::Reset) => {
                let from = self.phase;
                self.phase = Phase::Idle;
                self.paused = false;
                self.sad = false;
                self.input_recent = false;
                self.last_update = now;
                self.focus_elapsed = Duration::ZERO;
                self.walk_elapsed = Duration::ZERO;
                self.violation_elapsed = Duration::ZERO;
                self.skip_emitted = false;
                vec![DomainEvent::PhaseChanged {
                    from,
                    to: Phase::Idle,
                }]
            }
            _ => Vec::new(),
        }
    }

    pub fn tick(&mut self, now: Instant) -> Vec<DomainEvent> {
        if self.paused || self.phase == Phase::Idle {
            return Vec::new();
        }
        self.advance_to(now);

        match self.phase {
            Phase::Idle => Vec::new(),
            Phase::Focus => {
                if self.focus_elapsed >= self.cfg.focus {
                    let mut events = vec![DomainEvent::FocusCompleted];
                    events.extend(self.start_break_cycle(now));
                    events
                } else {
                    Vec::new()
                }
            }
            Phase::Break => {
                // 1. If shared warning + nag budget (5m) is exhausted during warning -> burn break & start sad focus
                if self.input_recent
                    && self.walk_elapsed < self.cfg.brk
                    && self.violation_elapsed >= self.cfg.nag_timeout
                {
                    self.sad = true;
                    let mut events = Vec::new();
                    if !self.skip_emitted {
                        events.push(DomainEvent::BreakSkipped);
                        self.skip_emitted = true;
                    }
                    events.extend(self.start_focus_cycle(now));
                    return events;
                }

                // 2. If 5m walking target is completed: keep counting up until user moves mouse/keyboard, then start normal focus
                if self.walk_elapsed >= self.cfg.brk && self.input_recent {
                    self.sad = false;
                    let mut events = vec![DomainEvent::BreakCompleted];
                    events.extend(self.start_focus_cycle(now));
                    return events;
                }

                Vec::new()
            }
            Phase::Nag => {
                if self.violation_elapsed >= self.cfg.nag_timeout {
                    self.sad = true;
                    let mut events = Vec::new();
                    if !self.skip_emitted {
                        events.push(DomainEvent::BreakSkipped);
                        self.skip_emitted = true;
                    }
                    events.extend(self.start_focus_cycle(now));
                    events
                } else {
                    Vec::new()
                }
            }
        }
    }

    pub fn snapshot(&self, now: Instant) -> Snapshot {
        let (focus, walk, violation) = self.elapsed_at(now);

        let (remaining_secs, total_secs) = match self.phase {
            Phase::Idle => (self.cfg.focus.as_secs(), self.cfg.focus.as_secs()),
            Phase::Focus => {
                let total = self.cfg.focus.as_secs();
                let rem = self.cfg.focus.saturating_sub(focus).as_secs();
                (rem, total)
            }
            Phase::Break => {
                if !self.paused && self.input_recent && walk < self.cfg.brk {
                    // Warning mode: show remaining time from shared 5m warning + nag budget
                    let total = self.cfg.nag_timeout.as_secs();
                    let rem = self.cfg.nag_timeout.saturating_sub(violation).as_secs();
                    (rem, total)
                } else {
                    // Walking mode: show remaining walk time (05:00 -> 00:00) or overtime elapsed (05:00, 05:01...)
                    let total = self.cfg.brk.as_secs();
                    if walk >= self.cfg.brk {
                        (walk.as_secs(), total)
                    } else {
                        let rem = self.cfg.brk.saturating_sub(walk).as_secs();
                        (rem, total)
                    }
                }
            }
            Phase::Nag => {
                let total = self.cfg.nag_timeout.as_secs();
                let rem = self.cfg.nag_timeout.saturating_sub(violation).as_secs();
                (rem, total)
            }
        };

        Snapshot {
            phase: self.phase,
            remaining_secs,
            total_secs,
            paused: self.paused,
            sad: self.sad,
            input_recent: self.phase == Phase::Break
                && !self.paused
                && self.input_recent
                && walk < self.cfg.brk,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn full_focus_break_cycle() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);

        assert_eq!(s.snapshot(t0).phase, Phase::Idle);
        assert_eq!(s.snapshot(t0).remaining_secs, 25);

        let ev = s.handle(Command::Start, t0);
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Idle,
                to: Phase::Focus
            }]
        );
        assert_eq!(s.snapshot(t0 + Duration::from_secs(10)).remaining_secs, 15);

        // Before deadline: no transition
        assert!(s.tick(t0 + Duration::from_secs(24)).is_empty());

        // At focus deadline -> Break
        let t1 = t0 + Duration::from_secs(25);
        let ev = s.tick(t1);
        assert_eq!(
            ev,
            vec![
                DomainEvent::FocusCompleted,
                DomainEvent::PhaseChanged {
                    from: Phase::Focus,
                    to: Phase::Break
                }
            ]
        );
        assert_eq!(s.snapshot(t1).phase, Phase::Break);
        assert_eq!(s.snapshot(t1).remaining_secs, 15);

        // At break deadline without mouse/keyboard input -> stays in Break and counts past 15s
        let t2 = t1 + Duration::from_secs(15);
        assert!(s.tick(t2).is_empty());
        assert_eq!(s.snapshot(t2).phase, Phase::Break);
        assert_eq!(s.snapshot(t2).remaining_secs, 15);

        let t_overtime = t1 + Duration::from_secs(22);
        assert!(s.tick(t_overtime).is_empty());
        assert_eq!(s.snapshot(t_overtime).phase, Phase::Break);
        assert_eq!(s.snapshot(t_overtime).remaining_secs, 22);

        // User moves mouse/keyboard -> immediately transitions to normal Focus
        s.set_input_recent(true, t_overtime);
        let ev = s.tick(t_overtime);
        assert_eq!(
            ev,
            vec![
                DomainEvent::BreakCompleted,
                DomainEvent::PhaseChanged {
                    from: Phase::Break,
                    to: Phase::Focus
                }
            ]
        );
        assert_eq!(s.snapshot(t_overtime).phase, Phase::Focus);
        assert!(!s.snapshot(t_overtime).sad);
        assert_eq!(s.snapshot(t_overtime).remaining_secs, 25);
    }

    #[test]
    fn pause_and_resume_preserves_remaining_time() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);

        // Pause after 10s (15s left)
        let t_pause = t0 + Duration::from_secs(10);
        assert!(s.handle(Command::TogglePause, t_pause).is_empty());
        let snap = s.snapshot(t_pause + Duration::from_secs(100));
        assert!(snap.paused);
        assert_eq!(snap.remaining_secs, 15);

        // Ticking while paused does nothing even long after original deadline
        assert!(s.tick(t_pause + Duration::from_secs(100)).is_empty());

        // Resume at t_pause + 100s -> deadline is +15s from resume
        let t_resume = t_pause + Duration::from_secs(100);
        s.handle(Command::TogglePause, t_resume);
        assert!(!s.snapshot(t_resume).paused);
        assert!(s.tick(t_resume + Duration::from_secs(14)).is_empty());
        let ev = s.tick(t_resume + Duration::from_secs(15));
        assert_eq!(ev[0], DomainEvent::FocusCompleted);
    }

    #[test]
    fn wake_from_sleep_advances_only_one_phase() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);

        // System sleeps for 1 hour during focus
        let t_wake = t0 + Duration::from_secs(3600);
        let ev = s.tick(t_wake);
        assert_eq!(
            ev,
            vec![
                DomainEvent::FocusCompleted,
                DomainEvent::PhaseChanged {
                    from: Phase::Focus,
                    to: Phase::Break
                }
            ]
        );
        assert_eq!(s.snapshot(t_wake).phase, Phase::Break);
        assert_eq!(s.snapshot(t_wake).remaining_secs, 15);
    }

    #[test]
    fn nag_branches_and_sad_flag_lifecycle() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);

        let t1 = t0 + Duration::from_secs(25);
        s.tick(t1); // -> Break

        // Skip break -> Nag
        let ev = s.handle(Command::SkipBreak, t1);
        assert_eq!(
            ev,
            vec![
                DomainEvent::BreakSkipped,
                DomainEvent::PhaseChanged {
                    from: Phase::Break,
                    to: Phase::Nag
                }
            ]
        );
        assert_eq!(s.snapshot(t1).phase, Phase::Nag);

        // Branch 1: AcceptBreak -> returns to Break without sad
        let ev = s.handle(Command::AcceptBreak, t1 + Duration::from_secs(2));
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Nag,
                to: Phase::Break
            }]
        );
        assert!(!s.snapshot(t1 + Duration::from_secs(2)).sad);

        // Skip again and ContinueAnyway -> Focus with sad = true
        let t2 = t1 + Duration::from_secs(3);
        s.handle(Command::SkipBreak, t2);
        let ev = s.handle(Command::ContinueAnyway, t2 + Duration::from_secs(1));
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Nag,
                to: Phase::Focus
            }]
        );
        assert!(s.snapshot(t2 + Duration::from_secs(1)).sad);

        // Completing next break clears sad once user returns and moves mouse
        let t3 = t2 + Duration::from_secs(1) + Duration::from_secs(25);
        s.tick(t3); // -> Break
        let t4 = t3 + Duration::from_secs(15);
        s.set_input_recent(true, t4);
        s.tick(t4); // -> Focus (BreakCompleted)
        assert!(!s.snapshot(t4).sad);
    }

    #[test]
    fn nag_timeout_transitions_to_sad_focus() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);
        let t1 = t0 + Duration::from_secs(25);
        s.tick(t1); // -> Break
        s.handle(Command::SkipBreak, t1); // -> Nag (15s timeout in fast mode)

        assert!(s.tick(t1 + Duration::from_secs(14)).is_empty());
        let ev = s.tick(t1 + Duration::from_secs(15));
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Nag,
                to: Phase::Focus
            }]
        );
        assert!(s.snapshot(t1 + Duration::from_secs(15)).sad);
    }

    #[test]
    fn invalid_commands_are_ignored_and_reset_works() {
        let cfg = Config::fast();
        let t0 = Instant::now();
        let mut s = Session::new(cfg);

        // Invalid in Idle
        assert!(s.handle(Command::TogglePause, t0).is_empty());
        assert!(s.handle(Command::SkipBreak, t0).is_empty());
        assert!(s.handle(Command::AcceptBreak, t0).is_empty());
        assert!(s.handle(Command::ContinueAnyway, t0).is_empty());
        assert!(s.handle(Command::Reset, t0).is_empty());

        s.handle(Command::Start, t0);
        // Invalid in Focus
        assert!(s.handle(Command::Start, t0).is_empty());
        assert!(s.handle(Command::SkipBreak, t0).is_empty());

        // Reset from Focus -> Idle
        let ev = s.handle(Command::Reset, t0 + Duration::from_secs(5));
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Focus,
                to: Phase::Idle
            }]
        );
        assert_eq!(s.snapshot(t0 + Duration::from_secs(5)).phase, Phase::Idle);
    }

    #[test]
    fn walking_pauses_during_warning_and_shared_violation_budget_works() {
        let cfg = Config::fast(); // focus=25s, brk=15s, nag_timeout=15s
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);

        let t1 = t0 + Duration::from_secs(25);
        s.tick(t1); // -> Break (walk_remaining=15s, violation_remaining=15s)

        // 1. User walks for 6s -> walk remaining is 9s
        let t_walk1 = t1 + Duration::from_secs(6);
        assert_eq!(s.snapshot(t_walk1).remaining_secs, 9);

        // 2. User touches mouse -> enters warning; HUD shows shared violation budget (15s)
        s.set_input_recent(true, t_walk1);
        assert!(s.snapshot(t_walk1).input_recent);
        assert_eq!(s.snapshot(t_walk1).remaining_secs, 15);

        // 3. User stays in warning for 4s -> violation budget erodes to 11s
        let t_warn1 = t_walk1 + Duration::from_secs(4);
        assert_eq!(s.snapshot(t_warn1).remaining_secs, 11);

        // 4. User stops touching mouse -> resumes walking from 9s!
        s.set_input_recent(false, t_warn1);
        assert!(!s.snapshot(t_warn1).input_recent);
        assert_eq!(s.snapshot(t_warn1).remaining_secs, 9);

        // 5. User walks 9 more seconds (total 15s walk completed!) even though violation had 4s used
        let t_walk_done = t_warn1 + Duration::from_secs(9);
        assert!(s.tick(t_walk_done).is_empty()); // waiting for user return input
        s.set_input_recent(true, t_walk_done);
        let ev = s.tick(t_walk_done);
        assert_eq!(
            ev,
            vec![
                DomainEvent::BreakCompleted,
                DomainEvent::PhaseChanged {
                    from: Phase::Break,
                    to: Phase::Focus
                }
            ]
        );
        assert!(!s.snapshot(t_walk_done).sad); // Normal focus!
    }

    #[test]
    fn shared_warning_and_nag_budget_exhaustion_triggers_sad_focus() {
        let cfg = Config::fast(); // brk=15s, nag_timeout=15s
        let t0 = Instant::now();
        let mut s = Session::new(cfg);
        s.handle(Command::Start, t0);

        let t1 = t0 + Duration::from_secs(25);
        s.tick(t1); // -> Break

        // User triggers warning for 10s (5s violation budget left)
        s.set_input_recent(true, t1);
        let t2 = t1 + Duration::from_secs(10);
        assert_eq!(s.snapshot(t2).remaining_secs, 5);

        // User clicks SkipBreak -> enters Nag with 5s violation budget left
        s.handle(Command::SkipBreak, t2);
        assert_eq!(s.snapshot(t2).phase, Phase::Nag);
        assert_eq!(s.snapshot(t2).remaining_secs, 5);

        // User clicks AcceptBreak after 2s in Nag (3s violation budget left) -> back to walking
        let t3 = t2 + Duration::from_secs(2);
        s.handle(Command::AcceptBreak, t3);
        assert_eq!(s.snapshot(t3).phase, Phase::Break);
        assert_eq!(s.snapshot(t3).remaining_secs, 15); // walk was still at 0s

        // User walks 4s, then triggers warning for 3s -> exhausts remaining 3s violation budget!
        let t4 = t3 + Duration::from_secs(4);
        s.set_input_recent(true, t4);
        assert_eq!(s.snapshot(t4).remaining_secs, 3);

        let t5 = t4 + Duration::from_secs(3);
        let ev = s.tick(t5);
        assert_eq!(
            ev,
            vec![DomainEvent::PhaseChanged {
                from: Phase::Break,
                to: Phase::Focus
            }]
        );
        let snap = s.snapshot(t5);
        assert_eq!(snap.phase, Phase::Focus);
        assert!(snap.sad); // focus_sad!
    }
}
