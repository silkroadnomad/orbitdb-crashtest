import { IPFSAccessController,LevelStorage } from '@orbitdb/core'

let db = null

/**
 * Initialize or get the single OrbitDB instance
 */
export async function getOrCreateDB(orbitdb, dbName) {
    if(!dbName) {
        dbName = 'nameops'
    }
    console.log("getOrCreateDB", orbitdb.id)
    if (db) {
        return db
    }
    console.log("creating a new db", orbitdb.id)

    // Custom storage paths
    // const path = "./orbitdb-storage/"
    // const entryStorage = await LevelStorage({ path: `${path}/entries` })
    // const headsStorage = await LevelStorage({ path: `${path}/heads` })
    // const indexStorage = await LevelStorage({ path: `${path}/index` })
    console.log("opening db", orbitdb.id)
    db = await orbitdb.open(dbName, {
        type: 'documents',
        create: true,
        overwrite: true,
        directory: './orbitdb/nameops',
        AccessController: IPFSAccessController({ write: [orbitdb.identity.id] }),
        // storage: {
            // entryStorage,
            // headsStorage,
            // indexStorage
        // }
    })

    console.log(`Opened OrbitDB: ${dbName}`)
    return db
}

/**
 * Updates the name operations in OrbitDB.
 */
export async function updateDailyNameOpsFile(orbitdb, nameOpUtxos, blockDate, blockHeight) {
    try {
        console.log("Starting updateDailyNameOpsFile", { blockDate, blockHeight, nameOpUtxosCount: nameOpUtxos.length });

        const db = await getOrCreateDB(orbitdb);
        console.log("Database instance retrieved");

        const docId = `nameops-${blockDate}-${blockHeight}`;
        console.log(`Document ID: ${docId}`);

        // Calculate total nameOps count before update
        const allDocsBefore = await db.all();
        const totalNameOpsBefore = allDocsBefore.reduce((acc, doc) => acc + (doc.value.nameOps ? doc.value.nameOps.length : 0), 0);
        console.log(`Total nameOps count before update: ${totalNameOpsBefore}`);

        await db.put({
            _id: docId,
            nameOps: nameOpUtxos,
            blockHeight,
            blockDate
        });

        // Calculate total nameOps count after update
        const allDocsAfter = await db.all();
        const totalNameOpsAfter = allDocsAfter.reduce((acc, doc) => acc + (doc.value.nameOps ? doc.value.nameOps.length : 0), 0);
        console.log(`Total nameOps count after update: ${totalNameOpsAfter}`);

        console.log(`Document updated in OrbitDB: ${docId}`, {
            newOps: nameOpUtxos.length,
        });
        return docId;

    } catch (error) {
        console.error(`Error updating OrbitDB: ${error.message}`);
        throw error;
    }
}

/**
 * Get the last name operations with pagination and filtering
 */
export async function getLastNameOps(orbitdb, pageSize, from=10, filter) {
    try {
        const db = await getOrCreateDB(orbitdb)
        const allDocs = await db.all()
        
        let nameOps = []
        for (const doc of allDocs) {
            nameOps = nameOps.concat(doc.value.nameOps)
        }
        
        // Sort nameOps by blocktime in descending order
        nameOps.sort((a, b) => b.blocktime - a.blocktime)
        
        const paginatedNameOps = nameOps.slice(from, from + pageSize)
        return paginatedNameOps

    } catch (error) {
        console.error(`Error getting nameOps from OrbitDB: ${error.message}`)
        throw error
    }
}
