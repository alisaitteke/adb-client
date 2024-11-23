import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ADB } from '../adb.js';
import { ADBError } from '../errors.js';

describe('ADB', () => {
  let adb: ADB;

  beforeEach(() => {
    adb = new ADB({ customPath: 'mock-adb' });
  });

  it('should throw ADBError when ADB is not found', () => {
    expect(() => new ADB()).toThrow(ADBError);
  });
});