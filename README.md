# TypeScript ADB Library

A modern, powerful TypeScript library for Android Debug Bridge (ADB) operations. This library provides a robust interface to interact with Android devices, offering comprehensive device management, app control, and system monitoring capabilities.

![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## Features

- 🔍 **Automatic ADB Detection**: Works across Windows, macOS, and Linux
- 🚀 **Modern TypeScript**: Full type safety and modern ES2022 features
- 🛠 **Comprehensive API**: Complete device and app management
- 📱 **Device Control**: Screen capture, recording, and input simulation
- 📊 **System Monitoring**: Battery, network, and performance tracking
- ⚡ **Promise-based**: Modern async/await interface
- 🔒 **Type-Safe**: Complete TypeScript definitions
- 📝 **Extensive Documentation**: Detailed JSDoc comments and examples

## Installation

```bash
npm install adb-typescript
```

## Quick Start

```typescript
import { ADB } from 'adb-typescript';

async function main() {
  try {
    // Initialize ADB (automatically finds ADB in system)
    const adb = new ADB();
    
    // Get connected devices
    const devices = await adb.getDevices();
    console.log('Connected devices:', devices);
    
    if (devices.length > 0) {
      const device = devices[0];
      console.log(`Working with device: ${device.model} (${device.serialNumber})`);
      
      // Install an app
      await adb.installAPK(device.serialNumber, './myapp.apk');
      
      // Take a screenshot
      await adb.takeScreenshot(device.serialNumber, './screen.png');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Detailed Examples

### Device Management

```typescript
const adb = new ADB();

// List all connected devices with details
const devices = await adb.getDevices();
for (const device of devices) {
  console.log(`
    Serial: ${device.serialNumber}
    Model: ${device.model}
    State: ${device.state}
  `);
}

// Get device properties
const props = await adb.getDeviceProperties(devices[0].serialNumber);
console.log(`
  Android Version: ${props.androidVersion}
  SDK Version: ${props.sdkVersion}
  Brand: ${props.brand}
  Model: ${props.model}
`);
```

### App Management

```typescript
// Install application
await adb.installAPK('device123', './app.apk');

// Start application
await adb.startApp('device123', 'com.example.app', '.MainActivity');

// Get package information
const packageInfo = await adb.getPackageInfo('device123', 'com.example.app');
console.log(`
  Package: ${packageInfo.packageName}
  Version: ${packageInfo.versionName}
  Version Code: ${packageInfo.versionCode}
`);

// Clear app data
await adb.clearAppData('device123', 'com.example.app');

// Stop application
await adb.stopApp('device123', 'com.example.app');

// Uninstall application
await adb.uninstallApp('device123', 'com.example.app');
```

### Screen Capture & Recording

```typescript
// Take screenshot
await adb.takeScreenshot('device123', './screenshot.png');

// Record screen (10 seconds with options)
await adb.recordScreen('device123', './video.mp4', 10, {
  size: '720x1280',
  bitRate: '4M'
});
```

### System Monitoring

```typescript
// Get battery information
const battery = await adb.getBatteryInfo('device123');
console.log(`
  Battery Level: ${battery.level}%
  Temperature: ${battery.temperature}°C
  Charging: ${battery.isCharging}
  Power Source: ${battery.powerSource}
`);

// Get network information
const network = await adb.getNetworkInfo('device123');
console.log(`
  IP Address: ${network.ipAddress}
  WiFi Enabled: ${network.wifiEnabled}
  Signal Level: ${network.wifiSignalLevel}
`);
```

### Device Control

```typescript
// Send key events
await adb.sendKeyEvent('device123', 'KEYCODE_HOME');
await adb.sendKeyEvent('device123', 'KEYCODE_BACK');

// Control WiFi
await adb.setWifiEnabled('device123', true);  // Enable WiFi
await adb.setWifiEnabled('device123', false); // Disable WiFi

// Execute shell commands
const result = await adb.shell('device123', 'ls /sdcard');
console.log('Files in sdcard:', result);
```

### Debugging & Diagnostics

```typescript
// Restart ADB server if needed
await adb.restartServer();

// Generate bug report
await adb.takeBugReport('device123', './bugreport.zip');
```

## Error Handling

The library provides specific error types for better error handling:

```typescript
import { ADB, ADBError, DeviceNotFoundError, CommandError } from 'adb-typescript';

try {
  const adb = new ADB();
  await adb.getDevices();
} catch (error) {
  if (error instanceof DeviceNotFoundError) {
    console.error('Device not found:', error.message);
  } else if (error instanceof CommandError) {
    console.error('Command failed:', error.message);
  } else if (error instanceof ADBError) {
    console.error('ADB error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Configuration Options

```typescript
const adb = new ADB({
  // Custom ADB path (optional)
  customPath: '/custom/path/to/adb',
  
  // Command timeout in milliseconds (default: 30000)
  timeout: 5000
});
```

## API Reference

### Core Classes

- `ADB`: Main class for ADB operations
- `ADBError`: Base error class
- `DeviceNotFoundError`: Device-specific errors
- `CommandError`: Command execution errors

### Interfaces

- `DeviceInfo`: Connected device information
- `PackageInfo`: Application package information
- `ADBOptions`: Configuration options

Full API documentation is available in the source code JSDoc comments.

## Requirements

- Node.js ≥ 18
- ADB installed and accessible in system PATH
- Android SDK Platform Tools

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Format code
npm run format

# Type check
npm run typecheck
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Open an issue
- Submit a pull request
- Contact the maintainers

## Changelog

### 1.0.0
- Initial release
- Basic ADB functionality
- Device management
- App control
- Screen capture
- System monitoring

## Roadmap

- [ ] WebSocket-based device monitoring
- [ ] Real-time logcat streaming
- [ ] Multiple device parallel operations
- [ ] Custom plugin system
- [ ] Web interface for device management
- [ ] Performance profiling tools
- [ ] Integration with Android Studio