# GitHub Installation Guide

This SDK is designed to be installed directly from GitHub, providing the latest features and updates.

## 📦 Installation Methods

### Method 1: Latest Version (Recommended)
```bash
npm install git+https://github.com/yourusername/drips-raffle-sdk.git
```

### Method 2: Specific Tag/Version
```bash
npm install git+https://github.com/yourusername/drips-raffle-sdk.git#v1.0.0
```

### Method 3: Specific Branch
```bash
npm install git+https://github.com/yourusername/drips-raffle-sdk.git#main
```

### Method 4: With Yarn
```bash
yarn add git+https://github.com/yourusername/drips-raffle-sdk.git
```

## 🔄 Package.json Configuration

Add to your `package.json` dependencies:

```json
{
  "dependencies": {
    "@drips/raffle-sdk": "git+https://github.com/yourusername/drips-raffle-sdk.git",
    "@mysten/sui": "^1.0.0",
    "@mysten/wallet-adapter-react": "^0.15.0"
  }
}
```

## 🚀 Usage After Installation

Once installed, use exactly as shown in the main README:

```typescript
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet');
// ... rest of your code
```

## 🔧 Development Installation

For development or contributing:

```bash
# Clone the repository
git clone https://github.com/yourusername/drips-raffle-sdk.git
cd drips-raffle-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link
```

Then in your project:
```bash
npm link @drips/raffle-sdk
```

## 📋 Requirements

- **Node.js**: 16.0.0 or higher
- **Git**: For installation from GitHub
- **TypeScript**: 5.0.0+ (for TypeScript projects)

## ⚡ Benefits of GitHub Installation

- ✅ **Always Latest**: Get the newest features immediately
- ✅ **No Registry Dependencies**: Direct from source
- ✅ **Version Control**: Pin to specific commits or tags
- ✅ **Development Friendly**: Easy to contribute and modify
- ✅ **Transparent**: Full source code visibility

## 🔄 Updating

To update to the latest version:

```bash
npm update @drips/raffle-sdk
```

Or reinstall:
```bash
npm uninstall @drips/raffle-sdk
npm install git+https://github.com/yourusername/drips-raffle-sdk.git
```

## 🤝 Contributing

Since you're installing from GitHub, contributing is easy:

1. Fork the repository
2. Make your changes
3. Test locally with `npm link`
4. Submit a pull request

## 📞 Support

If you encounter issues with GitHub installation:

1. Ensure you have Git installed
2. Check your SSH keys or use HTTPS URLs
3. Verify Node.js version compatibility
4. Open an issue on the repository

---

**Happy coding with Drips Raffle SDK!** 🎉
