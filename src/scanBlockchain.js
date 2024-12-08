import { updateDailyNameOpsFile } from './nameOpsFileManager.js'

function generateMockNameOp(index, date) {
    const prefixes = ['', 'e/', 'pe/', 'poe/', 'nft/', 'bp/']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    
    return {
        nameId: `${prefix}test${index}`,
        nameValue: Math.random() > 0.3 ? `value${index}` : '',  // 30% chance of empty value
        blocktime: new Date(date).getTime() + (index * 1000),  // Spread throughout the day
        txid: `tx${Date.now()}${index}`,
        address: `addr${index}`,
        vout: index % 3,
        type: 'name_op'
    }
}

export async function scanBlockchainForNameOps(electrumClient, helia, orbitdb) {
    try {
        const height = await electrumClient.blockchainHeaders_subscribe()
        const date = new Date().toISOString().split('T')[0]
        
        // Generate between 50-150 name operations per scan
        const numOps = 50 + Math.floor(Math.random() * 100)
        const mockNameOps = Array.from(
            { length: numOps }, 
            (_, i) => generateMockNameOp(i, date)
        )

        console.log(`Generated ${mockNameOps.length} mock name operations`)
        
        // Add the update operation to the queue
        // await queue.add(() => updateDailyNameOpsFile(orbitdb, mockNameOps, date, height));
        updateDailyNameOpsFile(orbitdb, mockNameOps, date, height)
        
        // Log some stats
        console.log('Scan completed:', {
            height,
            date,
            nameOpsCount: mockNameOps.length
        })
        
    } catch (error) {
        console.error('Scan error:', error)
        throw error
    }
}
