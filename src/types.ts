export type DeviceState = 'device' | 'offline' | 'unauthorized' | 'connecting';

export interface DeviceInfo {
  serialNumber: string;
  state: DeviceState;
  model?: string;
  product?: string;
}

export interface PackageInfo {
  readonly packageName: string;
  readonly versionName: string;
  readonly versionCode: string;
}

export interface ADBOptions {
  customPath?: string;
  timeout?: number;
}