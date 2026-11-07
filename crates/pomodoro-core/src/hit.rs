use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

#[derive(Clone, Debug, Default, PartialEq)]
pub struct HitRegions(Vec<Rect>);

impl HitRegions {
    pub fn new(rects: Vec<Rect>) -> Self {
        Self(rects)
    }

    pub fn full(w: f64, h: f64) -> Self {
        Self(vec![Rect {
            x: 0.0,
            y: 0.0,
            w,
            h,
        }])
    }

    pub fn contains(&self, x: f64, y: f64) -> bool {
        self.0.iter().any(|r| {
            r.w > 0.0
                && r.h > 0.0
                && x >= r.x
                && x <= r.x + r.w
                && y >= r.y
                && y <= r.y + r.h
        })
    }

    pub fn rects(&self) -> &[Rect] {
        &self.0
    }
}

/// Returns a fast polling interval (33ms ≈ 30 Hz) when the cursor is within `margin` logical px
/// of the window rectangle, or a slow interval (250ms = 4 Hz) when far away.
pub fn poll_interval(cursor_rel: (f64, f64), win: (f64, f64), margin: f64) -> Duration {
    let (cx, cy) = cursor_rel;
    let (ww, wh) = win;
    let near_x = cx >= -margin && cx <= ww + margin;
    let near_y = cy >= -margin && cy <= wh + margin;
    if near_x && near_y {
        Duration::from_millis(33)
    } else {
        Duration::from_millis(250)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contains_edges_corners_and_empty() {
        let empty = HitRegions::new(vec![]);
        assert!(!empty.contains(0.0, 0.0));

        let regions = HitRegions::new(vec![
            Rect {
                x: 10.0,
                y: 20.0,
                w: 30.0,
                h: 40.0,
            },
            Rect {
                x: 100.0,
                y: 100.0,
                w: 0.0,
                h: 10.0,
            },
        ]);

        // Inside and corners/edges
        assert!(regions.contains(10.0, 20.0));
        assert!(regions.contains(40.0, 60.0));
        assert!(regions.contains(25.0, 35.0));

        // Outside
        assert!(!regions.contains(9.9, 20.0));
        assert!(!regions.contains(40.1, 60.0));
        assert!(!regions.contains(100.0, 105.0)); // zero-width rect ignored
    }

    #[test]
    fn poll_interval_boundaries() {
        let win = (200.0, 270.0);
        let margin = 48.0;

        assert_eq!(poll_interval((100.0, 100.0), win, margin), Duration::from_millis(33));
        assert_eq!(poll_interval((-48.0, 0.0), win, margin), Duration::from_millis(33));
        assert_eq!(poll_interval((248.0, 270.0), win, margin), Duration::from_millis(33));
        assert_eq!(poll_interval((-48.1, 0.0), win, margin), Duration::from_millis(250));
        assert_eq!(poll_interval((100.0, 318.1), win, margin), Duration::from_millis(250));
    }
}
