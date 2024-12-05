# Orbit Crash Test

This project is a test setup for using OrbitDB with custom storage backends, integrated with a mock blockchain scanning process. It utilizes Helia, Libp2p, and various other libraries to simulate a decentralized database environment.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/orbit-crash-test.git
   cd orbit-crash-test
   ```

2. **Install dependencies:**

   Make sure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

3. **Environment Setup:**

   Create a `.env` file in the root directory and add your private key:

   ```plaintext
   RELAY_PRIVATE_KEY=your_private_key_here
   ```

   If you don't have a private key, the application will generate one for you on the first run.

## Usage

To start the application, run:

```npm start```


This will initiate the blockchain scanning process and update the OrbitDB with mock name operations.

## Configuration

- **Custom Storage Paths:**

  The application uses custom storage paths for OrbitDB:

  ```javascript
  const path = "./orbitdb-storage/"
  const entryStorage = await LevelStorage({ path: `${path}/entries` })
  const headsStorage = await LevelStorage({ path: `${path}/heads` })
  const indexStorage = await LevelStorage({ path: `${path}/index` })
  ```

- **Libp2p Configuration:**

  The Libp2p node is configured with custom peer discovery and transport options. Modify `libp2p-config.js` to adjust these settings.

## Scripts

- **`start`**: Runs the main application (`src/index.js`).

## Dependencies

The project relies on the following key dependencies:

- `@orbitdb/core`: OrbitDB core library.
- `libp2p`: Modular networking stack.
- `helia`: IPFS implementation.
- `blockstore-level` and `datastore-level`: LevelDB storage backends.
- `dotenv`: Environment variable management.

For a complete list, see the `package.json` file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.