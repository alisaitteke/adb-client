/*
 *
 *  * Copyright (c) 2024 Ali Sait Teke
 *  * "Code bridges the gap between human thought and machine execution."
 *
 */

export class ADBError extends Error {
  constructor(
      message: string,
      public readonly code?: string,
      public readonly command?: string
  ) {
    super(message);
    this.name = 'ADBError';
  }
}

export class DeviceNotFoundError extends ADBError {
  constructor(serialNumber: string) {
    super(`Device not found: ${serialNumber}`);
    this.name = 'DeviceNotFoundError';
  }
}

export class CommandError extends ADBError {
  constructor(message: string, command: string) {
    super(message, 'COMMAND_FAILED', command);
    this.name = 'CommandError';
  }
}