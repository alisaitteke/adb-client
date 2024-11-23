# 🤖 ADB Client - Your Android's New Best Friend

A modern, powerful TypeScript library for Android Debug Bridge (ADB) operations. This library provides a robust interface to interact with Android devices, offering comprehensive device management, app control, and system monitoring capabilities.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## 🚀 What's This All About?

Imagine controlling your Android device with code that's actually readable. No more cryptic ADB commands or shell script nightmares. This library is like having a universal remote for your Android device, but cooler because... well, it's code!

### ✨ The Cool Stuff You Get

- 🔍 **Sherlock-Level ADB Detection**: Finds your ADB binary faster than you can say "where's my SDK?"
- 🎯 **TypeScript Superpowers**: Because any's are scary and we like our types strict
- 🛠 **Swiss Army Knife API**: Everything you need, nothing you don't
- 📱 **Device Whisperer**: Talk to your device like never before
- ⚡ **Promise-based**: Because callbacks are so 2010
- 🔒 **Type-Safe**: Let the compiler catch your "oops" moments

## 🎯 Installation

```bash
npm install adb-client
# or if you're a yarn person
yarn add adb-client
# or if you're one of those cool pnpm folks
pnpm add adb-client
```

## 🎮 Quick Start

```typescript
import { ADB } from 'adb-client';

// Let's do some magic! ✨
async function main() {
  try {
    const adb = new ADB();
    
    // Find all your Android friends
    const devices = await adb.getDevices();
    
    if (devices.length === 0) {
      console.log('😢 No devices found. Did you forget to plug it in?');
      return;
    }

    // Pick your favorite device (or the only one you have 😅)
    const device = devices[0];
    console.log(`🎯 Found device: ${device.model || 'Mystery Phone'}`);
    
    // Let's take a selfie (screenshot)!
    await adb.takeScreenshot(device.serialNumber, './awesome-screenshot.png');
    console.log('📸 Say cheese!');
    
  } catch (error) {
    console.error('💥 Oops!', error.message);
  }
}
```

## 🎨 Cool Things You Can Do

### 📱 Device Management (a.k.a. Phone Whispering)

```typescript
const adb = new ADB();

// Let's see what devices we've got
const devices = await adb.getDevices();
devices.forEach(device => {
  console.log(`📱 Found: ${device.model || 'Mystery Device'} (${device.serialNumber})`);
});

// Get all the juicy details
const props = await adb.getDeviceProperties(devices[0].serialNumber);
console.log(`
  🤖 Android Version: ${props.androidVersion}
  📦 SDK: ${props.sdkVersion}
  ⭐ Brand: ${props.brand}
`);
```

### 📦 App Management (Like a Boss)

```typescript
// Install that awesome app you built
await adb.installAPK('device123', './my-awesome-app.apk');

// Launch it to the moon! 🚀
await adb.startApp('device123', 'com.your.awesome.app', '.MainActivity');

// Check how awesome your app is
const info = await adb.getPackageInfo('device123', 'com.your.awesome.app');
console.log(`📊 App Version: ${info.versionName} (${info.versionCode})`);

// Marie Kondo your app data
await adb.clearAppData('device123', 'com.your.awesome.app');
```

### 📸 Screen Capture (Say Cheese!)

```typescript
// Take a screenshot (perfect for those "it works on my machine" moments)
await adb.takeScreenshot('device123', './proof-it-works.png');

// Record a video (great for catching those elusive bugs)
await adb.recordScreen('device123', './bug-in-action.mp4', 10, {
  size: '720x1280',  // For those who care about quality
  bitRate: '4M'      // For those who care about file size
});
```

### 🔋 System Monitoring (The Spy Game)

```typescript
// Check the battery (is it coffee break time?)
const battery = await adb.getBatteryInfo('device123');
console.log(`
  🔋 Battery: ${battery.level}%
  🌡️ Temperature: ${battery.temperature}°C
  ⚡ Charging: ${battery.isCharging ? 'Yep!' : 'Nope!'}
`);

// Network status (for when Wi-Fi is being sneaky)
const network = await adb.getNetworkInfo('device123');
console.log(`
  🌐 IP: ${network.ipAddress}
  📶 Wi-Fi: ${network.wifiEnabled ? 'Connected' : 'Looking for signal...'}
`);
```

### 🎮 Device Control (Power User Stuff)

```typescript
// Press buttons like a pro gamer
await adb.sendKeyEvent('device123', 'KEYCODE_HOME');  // Go home!
await adb.sendKeyEvent('device123', 'KEYCODE_BACK');  // Retreat!

// Toggle Wi-Fi (because why not?)
await adb.setWifiEnabled('device123', true);  // 📶 ON
await adb.setWifiEnabled('device123', false); // 📴 OFF
```

## 🎯 Error Handling (Because Stuff Happens)

```typescript
import { ADB, ADBError, DeviceNotFoundError, CommandError } from 'adb-client';

try {
  const adb = new ADB();
  await adb.getDevices();
} catch (error) {
  if (error instanceof DeviceNotFoundError) {
    console.error('😢 Device went on vacation:', error.message);
  } else if (error instanceof CommandError) {
    console.error('🤔 ADB is being difficult:', error.message);
  } else {
    console.error('💥 Something went boom:', error);
  }
}
```

## ⚙️ Configuration (For the Perfectionists)

```typescript
const adb = new ADB({
  customPath: '/path/to/your/special/adb',  // For the special snowflakes
  timeout: 5000  // For the impatient developers
});
```

## 📚 Requirements

- Node.js ≥ 18 (Because we're modern like that)
- ADB installed (You knew this was coming, right?)
- An Android device (Or emulator, we don't judge)

## 🤝 Contributing

1. Fork it (Yes, that button up there ☝️)
2. Create your feature branch: `git checkout -b feature/something-awesome`
3. Commit your changes: `git commit -m 'Add something awesome'`
4. Push to the branch: `git push origin feature/something-awesome`
5. Submit a PR (and make our day!)

## 🛠️ Development

```bash
# Get the party started
npm install

# Build something amazing
npm run build

# Make sure it works
npm test

# Make it pretty
npm run format
```

## 📝 License

MIT License - Go wild! (Just don't blame us if something breaks 😉)

## 💡 Support

Found a bug? Got a cool idea? Need a virtual hug?
- Open an issue
- Submit a PR
- Send a carrier pigeon

## 🎉 Coming Soon™

- [ ] Telepathic device control
- [ ] Time travel debugging
- [ ] Coffee maker integration
- [ ] More realistic features we're actually working on...

---

Made with ☕ and TypeScript. Happy coding! 🚀