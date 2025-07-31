# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-31

### Added - Major Feature: Raffle Discovery 🆕
- **queryRaffles()** - Discover all raffles without needing specific IDs
- **getRafflesByCreator()** - Find raffles created by specific addresses
- **searchRaffles()** - Search raffles by NFT name, description, or collection
- **Pagination support** - Cursor-based pagination for large result sets
- **Status filtering** - Filter by active, ended, or all raffles
- **RaffleQueryOptions** and **RaffleQueryResult** types for query parameters

### Changed
- **SDKConfig** now requires `houseId` parameter for raffle discovery
- Updated examples to demonstrate new discovery features
- Enhanced documentation with raffle discovery examples

### Breaking Changes
- `createDripsSDK()` now requires valid `houseId` for the network
- Added new required parameter to SDKConfig interface

## [1.0.0] - 2025-07-31

### Added
- Initial release of Drips Raffle SDK
- Core DripsSDK class for raffle management
- Support for creating, joining, and managing raffles
- NFT metadata fetching capabilities
- Comprehensive TypeScript type definitions
- RaffleBuilder for easy raffle creation
- DripsUtils for common operations
- Support for testnet, mainnet, and devnet
- Error handling with specific error types
- Examples and documentation
- Frontend wallet adapter integration
- Direct GitHub installation support

### Features
- ✅ Create NFT raffles with customizable parameters
- ✅ Join existing raffles
- ✅ Select winners for completed raffles
- ✅ Fetch comprehensive raffle details
- ✅ Get NFT metadata (name, description, image, etc.)
- ✅ Utility functions for common operations
- ✅ Builder pattern for raffle creation
- ✅ Type-safe operations with full TypeScript support
- ✅ Multi-network support
- ✅ Comprehensive error handling
- ✅ Frontend wallet adapter compatibility
- ✅ React/Vue/Angular integration ready
- ✅ Server-side and client-side usage patterns
- ✅ Install directly from GitHub repository
