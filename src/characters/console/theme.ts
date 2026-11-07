export type ConsoleAccessory = "none" | "card" | "remote" | "thumbsUp";

export interface ConsoleTheme {
  id: string;
  name: string;
  palette: Record<string, string>;
  accessory: ConsoleAccessory;
  cheeks: boolean;
}
