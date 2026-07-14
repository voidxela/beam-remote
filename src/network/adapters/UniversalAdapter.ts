export enum UniversalKey {
  HOME = "HOME",
  PLAY = "PLAY",
  REWIND = "REWIND",
  FORWARD = "FORWARD",
  SELECT = "SELECT",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN",
  BACK = "BACK",
  POWER = "POWER",
  BACKSPACE = "BACKSPACE",
  VOL_UP = "VOL_UP",
  VOL_DOWN = "VOL_DOWN",
  MUTE = "MUTE",
}

export interface TVApp {
  id: string;
  name: string;
  iconUrl: string;
}

export interface UniversalDevice {
  ip: string;
  name: string;
  model: string;
  platform: "roku" | "webos" | "androidtv";
  supportedKeys?: UniversalKey[];
}

export interface UniversalAdapter {
  platform: string;
  sendKey(ip: string, key: UniversalKey): Promise<boolean>;
  sendText(ip: string, text: string): Promise<boolean>;
  getDeviceInfo(ip: string): Promise<UniversalDevice | null>;
  getApps(ip: string): Promise<TVApp[]>;
  launchApp(ip: string, appId: string): Promise<boolean>;
}
