import 'dotenv/config'
import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level"
import { createOrbitDB } from '@orbitdb/core'
import { generateKeyPair, privateKeyFromProtobuf } from '@libp2p/crypto/keys'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createLibp2pConfig } from './libp2p-config.js'
import { scanBlockchainForNameOps } from './scanBlockchain.js'

const blockstore = new LevelBlockstore("./helia-blocks")
const datastore = new LevelDatastore("./helia-data")

// Use your existing private key or generate a new one
const privKeyHex = process.env.RELAY_PRIVATE_KEY

async function createNode() {
    // Setup the private key
    const privKeyBuffer = uint8ArrayFromString(privKeyHex, 'hex')
    const keyPair = await privateKeyFromProtobuf(privKeyBuffer)

    const libp2pConfig = createLibp2pConfig({
        keyPair,
        datastore,
        listenAddresses: ['/ip4/0.0.0.0/tcp/9090'],
        announceAddresses: [],
        pubsubPeerDiscoveryTopics: ['doichain._peer-discovery._p2p._pubsub'],
        scoreThresholds: {
            gossipThreshold: -Infinity,
            publishThreshold: -Infinity,
            graylistThreshold: -Infinity,
        }
    })

    const libp2p = await createLibp2p(libp2pConfig)
    console.log('Libp2p peerId:', libp2p.peerId.toString())
    
    const helia = await createHelia({
        libp2p,
        datastore,
        blockstore
    })

    const orbitdb = await createOrbitDB({ 
        ipfs: helia,
        directory: './orbitdb',
        id: 'crash-test'
    })

    return { helia, orbitdb }
}

async function main() {
    const { helia, orbitdb } = await createNode()

    // Mock electrum client for testing
    const mockElectrumClient = {
        blockchainHeaders_subscribe: async () => Math.floor(Date.now() / 1000)
    }

    async function scan() {
        while (true) {
            try {
                const startTime = Date.now();

                await scanBlockchainForNameOps(mockElectrumClient, helia, orbitdb);

                const endTime = Date.now();
                const executionTime = endTime - startTime;

                // Log execution time
                console.log(`Scan execution time: ${executionTime}ms`);

                // Optional: Introduce a delay if needed
                const delay = Math.max(0, 500 - executionTime); // Ensure non-negative delay
                if (delay > 0) {
                    console.log(`Waiting for ${delay}ms before next scan.`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

            } catch (error) {
                console.error('Scan error:', error);
                // If OrbitDB error, log additional details
                if (error.message.includes('OrbitDB')) {
                    console.error('OrbitDB state:', {
                        identity: orbitdb.identity.id,
                        databases: Array.from(orbitdb.databases.keys())
                    });
                }
            }
        }
    }

    // Start the initial scan
    scan();

    // Cleanup handlers
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    async function cleanup() {
        console.log('Shutting down...')
        try {
            await orbitdb.stop()
            console.log('OrbitDB stopped')

            await helia.stop()
            console.log('Helia stopped')

            await helia.libp2p.stop()
            console.log('Libp2p stopped')

            await blockstore.close()
            console.log('Blockstore closed')

            await datastore.close()
            console.log('Datastore closed')

            console.log('Cleanup completed')
        } catch (error) {
            console.error('Cleanup error:', error)
        }
        process.exit(0)
    }
}

// Generate key if needed
if (!process.env.RELAY_PRIVATE_KEY) {
    const keyPair = await generateKeyPair('Ed25519')
    console.log('Generated new private key. Add this to your .env:')
    console.log(`RELAY_PRIVATE_KEY=${keyPair.bytes}`)
    process.exit(0)
}

main().catch(console.error)
