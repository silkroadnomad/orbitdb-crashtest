# Orbit Crash Test

This repository was created to investigate and address a critical issue with OrbitDB, where the database crashes when attempting to read data before inserting new data. The problem manifests after approximately 15 minutes of operation, particularly when handling a large number of records. The crash results in the inability to read or write data, and the process becomes difficult to terminate without using forceful methods like `kill -s9`.

The project aims to replicate the crash scenario without using IPFS storage, as observed in various environments, including Linux and macOS. The issue is exacerbated by frequent write operations (every 500 milliseconds).

An assumption of a similar issue was observed in another project, where a `del` operation executed right before a `put` operation resulted in an inaccessible OrbitDB. This behavior was noted in the [deContact project](https://github.com/silkroadnomad/deContact/blob/14bf22110e348eac16ae7407f258c6e4b5d76bd3/src/lib/network/p2p-operations.js#L476), suggesting potential timing issues that could lead to database instability.

The repository includes a version of the code that operates without IPFS storage, as seen in the [nameOpsFileManager.js](https://github.com/silkroadnomad/orbitdb-crashtest/blob/without-ipfs-storage/nameOpsFileManager.js#L23). The goal is to identify the root cause of the crash and explore potential solutions to improve the stability and reliability of OrbitDB in high-load scenarios.

For more details on the issue and ongoing experiments, refer to the [GitHub repository](https://github.com/silkroadnomad/orbitdb-crashtest).

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
   RELAY_PRIVATE_KEY=your-test-libp2p-private-key
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