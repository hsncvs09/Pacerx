export interface VectorConsoleTheme {
  id: string;
  name: string;
  bodyTop: string;
  bodyMid: string;
  bodyBottom: string;
  bodyStroke: string;
  bezelFill: string;
  screenTop: string;
  screenBottom: string;
  screenSleepTop: string;
  screenSleepBottom: string;
  featureColor: string;
  eyeGlow: string;
  cheekColor: string;
  dpadFill: string;
  buttonA: string;
  buttonB: string;
  limbStart: string;
  limbEnd: string;
  handFill: string;
  shoeFill: string;
  shoeSole: string;
}

export const mintVectorTheme: VectorConsoleTheme = {
  id: "mint",
  name: "Mint",
  bodyTop: "#7ef3e1",
  bodyMid: "#42c6b4",
  bodyBottom: "#258c7e",
  bodyStroke: "#12292d",
  bezelFill: "#1a383d",
  screenTop: "#dffbe9",
  screenBottom: "#b6f0cd",
  screenSleepTop: "#4f776c",
  screenSleepBottom: "#35544c",
  featureColor: "#123035",
  eyeGlow: "#2dd4bf",
  cheekColor: "#ff8da1",
  dpadFill: "#20464c",
  buttonA: "#fb7185",
  buttonB: "#fbbf24",
  limbStart: "#2c7a73",
  limbEnd: "#194a47",
  handFill: "#64e8d5",
  shoeFill: "#fb7185",
  shoeSole: "#ffffff",
};
