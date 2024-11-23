/**
 * ADB (Android Debug Bridge) implementation in TypeScript
 *
 * This class provides a modern, type-safe interface to interact with Android devices
 * through the Android Debug Bridge (ADB) command-line tool. It supports device management,
 * app installation, file transfer, and various device control operations.
 *
 * Features:
 * - Automatic ADB path detection across platforms
 * - Promise-based async operations
 * - Strong type safety
 * - Comprehensive error handling
 * - Built-in timeout support
 *
 * @example
 * ```typescript
 * // Initialize ADB
 * const adb = new ADB();
 *
 * // Get connected devices
 * const devices = await adb.getDevices();
 *
 * // Install an APK
 * await adb.installAPK(devices[0].serialNumber, './app.apk');
 * ```
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { DeviceInfo, PackageInfo, ADBOptions } from './types.js';
import { ADBError, DeviceNotFoundError } from './errors.js';
import { executeCommand, isWindows, sanitizePath } from './utils.js';

export class ADB {
  private readonly adbPath: string;
  private readonly timeout: number;

  /**
   * Creates a new ADB instance
   *
   * @param options - Configuration options for ADB
   * @param options.customPath - Custom path to ADB executable (optional)
   * @param options.timeout - Timeout for ADB commands in milliseconds (default: 30000)
   * @throws {ADBError} When ADB executable cannot be found
   *
   * @example
   * ```typescript
   * // Use automatic ADB detection
   * const adb = new ADB();
   *
   * // Use custom ADB path
   * const customAdb = new ADB({
   *   customPath: '/custom/path/to/adb',
   *   timeout: 5000
   * });
   * ```
   */
  constructor(options: ADBOptions = {}) {
    this.timeout = options.timeout ?? 30000;
    this.adbPath = options.customPath ?? this.findADBPath();
  }

  /**
   * Locates the ADB executable on the system
   *
   * Searches common installation locations based on the operating system
   * and environment variables (ANDROID_HOME, ANDROID_SDK_ROOT)
   *
   * @private
   * @returns The path to ADB executable
   * @throws {ADBError} When ADB cannot be found in any common location
   */
  private findADBPath(): string {
    const paths = this.getPotentialADBPaths();
    const validPath = paths.find(path => existsSync(path));

    if (!validPath) {
      throw new ADBError(
          'ADB not found. Please ensure Android SDK is installed and properly configured.'
      );
    }

    return validPath;
  }

  /**
   * Gets list of potential ADB installation paths
   *
   * Checks system-specific locations and environment variables:
   * - Windows: Local AppData, Program Files
   * - macOS/Linux: /usr/local/bin, ~/Library/Android/sdk
   * - Environment: ANDROID_HOME, ANDROID_SDK_ROOT
   *
   * @private
   * @returns Array of potential ADB paths
   */
  private getPotentialADBPaths(): string[] {
    const home = homedir();
    const paths: string[] = [];

    if (isWindows) {
      paths.push(
          join(process.env.LOCALAPPDATA ?? '', 'Android/Sdk/platform-tools/adb.exe'),
          'C:\\Android\\sdk\\platform-tools\\adb.exe',
          join(home, 'AppData/Local/Android/Sdk/platform-tools/adb.exe')
      );
    } else {
      paths.push(
          '/usr/local/bin/adb',
          '/usr/bin/adb',
          join(home, 'Library/Android/sdk/platform-tools/adb'),
          join(home, 'Android/Sdk/platform-tools/adb')
      );
    }

    if (process.env.ANDROID_HOME) {
      paths.push(join(process.env.ANDROID_HOME, 'platform-tools', isWindows ? 'adb.exe' : 'adb'));
    }

    return paths;
  }

  /**
   * Executes an ADB command with timeout
   *
   * @private
   * @param command - ADB command to execute
   * @returns Promise with command output
   * @throws {CommandError} When command execution fails
   */
  private async execute(command: string): Promise<string> {
    const fullCommand = `"${this.adbPath}" ${command}`;
    return executeCommand(fullCommand, this.timeout);
  }

  /**
   * Gets list of connected Android devices
   *
   * Retrieves information about all connected devices including:
   * - Serial number
   * - Connection state
   * - Device model (if available)
   * - Product name (if available)
   *
   * @returns Promise with array of connected devices
   * @throws {ADBError} When unable to get device list
   *
   * @example
   * ```typescript
   * const devices = await adb.getDevices();
   * devices.forEach(device => {
   *   console.log(`Found device: ${device.model} (${device.serialNumber})`);
   * });
   * ```
   */
  async getDevices(): Promise<DeviceInfo[]> {
    const output = await this.execute('devices -l');
    const lines = output.split('\n').slice(1);

    return lines
        .filter(line => line.trim())
        .map(line => {
          const [serialNumber, ...rest] = line.split(/\s+/).filter(Boolean);
          const info: DeviceInfo = {
            serialNumber,
            state: rest[0] as DeviceInfo['state'],
            model: undefined,
            product: undefined
          };

          rest.forEach(item => {
            const [key, value] = item.split(':');
            if (key === 'model') info.model = value;
            else if (key === 'product') info.product = value;
          });

          return info;
        });
  }

  /**
   * Installs an APK file on a device
   *
   * @param serialNumber - Target device serial number
   * @param apkPath - Path to the APK file
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When installation fails
   *
   * @example
   * ```typescript
   * await adb.installAPK('device123', './path/to/app.apk');
   * ```
   */
  async installAPK(serialNumber: string, apkPath: string): Promise<void> {
    await this.execute(`-s ${serialNumber} install "${sanitizePath(apkPath)}"`);
  }

  /**
   * Uninstalls an app from a device
   *
   * @param serialNumber - Target device serial number
   * @param packageName - Package name to uninstall
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When uninstallation fails
   *
   * @example
   * ```typescript
   * await adb.uninstallApp('device123', 'com.example.app');
   * ```
   */
  async uninstallApp(serialNumber: string, packageName: string): Promise<void> {
    await this.execute(`-s ${serialNumber} uninstall ${packageName}`);
  }

  /**
   * Starts an Android app on a device
   *
   * @param serialNumber - Target device serial number
   * @param packageName - Package name to launch
   * @param activity - Activity name to start
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When app launch fails
   *
   * @example
   * ```typescript
   * await adb.startApp('device123', 'com.example.app', '.MainActivity');
   * ```
   */
  async startApp(serialNumber: string, packageName: string, activity: string): Promise<void> {
    await this.execute(
        `-s ${serialNumber} shell am start -n ${packageName}/${activity}`
    );
  }

  /**
   * Force stops an app on a device
   *
   * @param serialNumber - Target device serial number
   * @param packageName - Package name to stop
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When app termination fails
   *
   * @example
   * ```typescript
   * await adb.stopApp('device123', 'com.example.app');
   * ```
   */
  async stopApp(serialNumber: string, packageName: string): Promise<void> {
    await this.execute(`-s ${serialNumber} shell am force-stop ${packageName}`);
  }

  /**
   * Gets installed package information
   *
   * Retrieves version information about an installed app:
   * - Package name
   * - Version name (user-friendly version)
   * - Version code (internal version number)
   *
   * @param serialNumber - Target device serial number
   * @param packageName - Package name to query
   * @returns Package information
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When package info cannot be retrieved
   *
   * @example
   * ```typescript
   * const info = await adb.getPackageInfo('device123', 'com.example.app');
   * console.log(`Version: ${info.versionName} (${info.versionCode})`);
   * ```
   */
  async getPackageInfo(serialNumber: string, packageName: string): Promise<PackageInfo> {
    const output = await this.execute(
        `-s ${serialNumber} shell dumpsys package ${packageName}`
    );

    const versionName = output.match(/versionName=([^\s]+)/)?.[1] ?? '';
    const versionCode = output.match(/versionCode=([^\s]+)/)?.[1] ?? '';

    return {
      packageName,
      versionName,
      versionCode
    };
  }

  /**
   * Takes a screenshot of device display
   *
   * Captures the current screen content and saves it to a file.
   * Supports PNG format.
   *
   * @param serialNumber - Target device serial number
   * @param outputPath - Path where to save the screenshot
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When screenshot capture fails
   *
   * @example
   * ```typescript
   * await adb.takeScreenshot('device123', './screenshot.png');
   * ```
   */
  async takeScreenshot(serialNumber: string, outputPath: string): Promise<void> {
    const tempPath = '/sdcard/screenshot.png';
    await this.execute(`-s ${serialNumber} shell screencap -p ${tempPath}`);
    await this.execute(`-s ${serialNumber} pull ${tempPath} "${sanitizePath(outputPath)}"`);
    await this.execute(`-s ${serialNumber} shell rm ${tempPath}`);
  }

  /**
   * Executes a shell command on device
   *
   * Runs any shell command on the target device.
   * Use with caution as this provides direct shell access.
   *
   * @param serialNumber - Target device serial number
   * @param command - Shell command to execute
   * @returns Command output
   * @throws {DeviceNotFoundError} When device is not found
   * @throws {CommandError} When command execution fails
   *
   * @example
   * ```typescript
   * // List files in /sdcard
   * const files = await adb.shell('device123', 'ls /sdcard');
   *
   * // Get device properties
   * const props = await adb.shell('device123', 'getprop');
   * ```
   */
  async shell(serialNumber: string, command: string): Promise<string> {
    return this.execute(`-s ${serialNumber} shell ${command}`);
  }

  /**
   * Restarts the ADB server
   *
   * Useful when ADB server is unresponsive or having connection issues.
   * Kills the current server and starts a new one.
   *
   * @throws {CommandError} When server restart fails
   *
   * @example
   * ```typescript
   * await adb.restartServer();
   * ```
   */
  async restartServer(): Promise<void> {
    await this.execute('kill-server');
    await this.execute('start-server');
  }

  /**
   * Gets battery information from device
   *
   * Returns detailed battery status including:
   * - Level (percentage)
   * - Temperature
   * - Charging state
   * - Power source
   *
   * @param serialNumber - Target device serial number
   * @returns Battery information object
   *
   * @example
   * ```typescript
   * const battery = await adb.getBatteryInfo('device123');
   * console.log(`Battery level: ${battery.level}%, Temperature: ${battery.temperature}°C`);
   * ```
   */
  async getBatteryInfo(serialNumber: string): Promise<{
    level: number;
    temperature: number;
    isCharging: boolean;
    powerSource: 'ac' | 'usb' | 'wireless' | 'none';
  }> {
    const output = await this.execute(`-s ${serialNumber} shell dumpsys battery`);

    const level = Number(output.match(/level: (\d+)/)?.[1] ?? 0);
    const temp = Number(output.match(/temperature: (\d+)/)?.[1] ?? 0) / 10;
    const charging = output.includes('status: 2') || output.includes('status: 5');

    let powerSource: 'ac' | 'usb' | 'wireless' | 'none' = 'none';
    if (output.includes('AC powered: true')) powerSource = 'ac';
    else if (output.includes('USB powered: true')) powerSource = 'usb';
    else if (output.includes('Wireless powered: true')) powerSource = 'wireless';

    return {
      level,
      temperature: temp,
      isCharging: charging,
      powerSource
    };
  }

  /**
   * Records device screen
   *
   * Captures video of device screen for specified duration.
   * Supports common video formats (mp4).
   *
   * @param serialNumber - Target device serial number
   * @param outputPath - Path to save the video file
   * @param timeLimit - Recording time limit in seconds (optional)
   * @param options - Additional recording options
   * @throws {CommandError} When screen recording fails
   *
   * @example
   * ```typescript
   * // Record for 10 seconds
   * await adb.recordScreen('device123', './video.mp4', 10);
   *
   * // Record with options
   * await adb.recordScreen('device123', './video.mp4', 30, {
   *   size: '720x1280',
   *   bitRate: '4M'
   * });
   * ```
   */
  async recordScreen(
      serialNumber: string,
      outputPath: string,
      timeLimit?: number,
      options?: {
        size?: string;
        bitRate?: string;
      }
  ): Promise<void> {
    const sizeOpt = options?.size ? `--size ${options.size}` : '';
    const bitRateOpt = options?.bitRate ? `--bit-rate ${options.bitRate}` : '';
    const timeLimitOpt = timeLimit ? `--time-limit ${timeLimit}` : '';

    const tempPath = '/sdcard/recording.mp4';
    await this.execute(
        `-s ${serialNumber} shell screenrecord ${sizeOpt} ${bitRateOpt} ${timeLimitOpt} ${tempPath}`
    );
    await this.execute(`-s ${serialNumber} pull ${tempPath} "${sanitizePath(outputPath)}"`);
    await this.execute(`-s ${serialNumber} shell rm ${tempPath}`);
  }

  /**
   * Simulates key events on device
   *
   * Sends keycode events to device for input simulation.
   * Supports standard Android keycodes.
   *
   * @param serialNumber - Target device serial number
   * @param keycode - Android keycode to send
   * @throws {CommandError} When key event fails
   *
   * @example
   * ```typescript
   * // Press home button
   * await adb.sendKeyEvent('device123', 'KEYCODE_HOME');
   *
   * // Press back button
   * await adb.sendKeyEvent('device123', 'KEYCODE_BACK');
   * ```
   */
  async sendKeyEvent(serialNumber: string, keycode: string): Promise<void> {
    await this.execute(`-s ${serialNumber} shell input keyevent ${keycode}`);
  }

  /**
   * Clears app data
   *
   * Removes all data associated with an app including:
   * - Shared preferences
   * - Databases
   * - Cache files
   *
   * @param serialNumber - Target device serial number
   * @param packageName - Package name to clear
   * @throws {CommandError} When clear operation fails
   *
   * @example
   * ```typescript
   * await adb.clearAppData('device123', 'com.example.app');
   * ```
   */
  async clearAppData(serialNumber: string, packageName: string): Promise<void> {
    await this.execute(`-s ${serialNumber} shell pm clear ${packageName}`);
  }

  /**
   * Gets device properties
   *
   * Retrieves system properties from device including:
   * - Android version
   * - Device model
   * - Screen resolution
   * - CPU info
   * - And other system properties
   *
   * @param serialNumber - Target device serial number
   * @returns Device properties object
   *
   * @example
   * ```typescript
   * const props = await adb.getDeviceProperties('device123');
   * console.log(`Android version: ${props.androidVersion}`);
   * console.log(`Screen density: ${props.screenDensity}`);
   * ```
   */
  async getDeviceProperties(serialNumber: string): Promise<{
    androidVersion: string;
    sdkVersion: string;
    model: string;
    manufacturer: string;
    brand: string;
    screenDensity: string;
    screenResolution: string;
    cpuAbi: string;
    [key: string]: string;
  }> {
    const output = await this.execute(`-s ${serialNumber} shell getprop`);
    const props: Record<string, string> = {};

    const matches = output.matchAll(/\[([^\]]+)\]: \[([^\]]*)\]/g);
    for (const [, key, value] of matches) {
      props[key] = value;
    }

    return {
      androidVersion: props['ro.build.version.release'] ?? '',
      sdkVersion: props['ro.build.version.sdk'] ?? '',
      model: props['ro.product.model'] ?? '',
      manufacturer: props['ro.product.manufacturer'] ?? '',
      brand: props['ro.product.brand'] ?? '',
      screenDensity: props['ro.sf.lcd_density'] ?? '',
      screenResolution: props['ro.product.screen.resolution'] ?? '',
      cpuAbi: props['ro.product.cpu.abi'] ?? '',
      ...props
    };
  }

  /**
   * Gets network information
   *
   * Retrieves network-related information from device:
   * - IP addresses
   * - Network interfaces
   * - Wi-Fi status
   *
   * @param serialNumber - Target device serial number
   * @returns Network information object
   *
   * @example
   * ```typescript
   * const network = await adb.getNetworkInfo('device123');
   * console.log(`IP Address: ${network.ipAddress}`);
   * console.log(`Wi-Fi enabled: ${network.wifiEnabled}`);
   * ```
   */
  async getNetworkInfo(serialNumber: string): Promise<{
    ipAddress: string;
    wifiEnabled: boolean;
    wifiSignalLevel?: number;
    interfaces: Record<string, string>;
  }> {
    const ipOutput = await this.execute(`-s ${serialNumber} shell ip addr show`);
    const wifiOutput = await this.execute(`-s ${serialNumber} shell dumpsys wifi`);

    const wlan0Match = ipOutput.match(/inet ([\d.]+).*wlan0/);
    const ipAddress = wlan0Match?.[1] ?? '';

    const interfaces: Record<string, string> = {};
    const interfaceMatches = ipOutput.matchAll(/\d+: ([^:]+):.*inet ([\d.]+)/g);
    for (const [, iface, ip] of interfaceMatches) {
      interfaces[iface] = ip;
    }

    return {
      ipAddress,
      wifiEnabled: wifiOutput.includes('Wi-Fi is enabled'),
      wifiSignalLevel: parseInt(wifiOutput.match(/SignalLevel: (-?\d+)/)?.[1] ?? '0'),
      interfaces
    };
  }

  /**
   * Enables/disables Wi-Fi
   *
   * Controls device Wi-Fi state.
   * Note: Requires root access on some devices.
   *
   * @param serialNumber - Target device serial number
   * @param enable - Whether to enable or disable Wi-Fi
   * @throws {CommandError} When Wi-Fi state change fails
   *
   * @example
   * ```typescript
   * await adb.setWifiEnabled('device123', true);  // Enable Wi-Fi
   * await adb.setWifiEnabled('device123', false); // Disable Wi-Fi
   * ```
   */
  async setWifiEnabled(serialNumber: string, enable: boolean): Promise<void> {
    await this.execute(
        `-s ${serialNumber} shell svc wifi ${enable ? 'enable' : 'disable'}`
    );
  }

  /**
   * Takes a bug report
   *
   * Generates a comprehensive bug report including:
   * - System logs
   * - Stack traces
   * - System state
   * - Various diagnostics
   *
   * @param serialNumber - Target device serial number
   * @param outputPath - Path to save the bug report
   * @throws {CommandError} When bug report generation fails
   *
   * @example
   * ```typescript
   * await adb.takeBugReport('device123', './bugreport.zip');
   * ```
   */
  async takeBugReport(serialNumber: string, outputPath: string): Promise<void> {
    await this.execute(
        `-s ${serialNumber} bugreport "${sanitizePath(outputPath)}"`
    );
  }
}