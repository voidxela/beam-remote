// src/network/adapters/TVAdapter.ts

export enum UniversalKey {
  HOME = "HOME",
  PLAY = "PLAY",
  SELECT = "SELECT",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN",
  BACK = "BACK",
  POWER = "POWER",
  BACKSPACE = "BACKSPACE",
}

export interface UniversalDevice {
  ip: string;
  name: string;
  model: string;
  platform: "roku" | "webos" | "androidtv";
}

export interface TVAdapter {
  platform: string;
  sendKey(ip: string, key: UniversalKey): Promise<boolean>;
  sendText(ip: string, text: string): Promise<boolean>;
  getDeviceInfo(ip: string): Promise<UniversalDevice | null>;
}
