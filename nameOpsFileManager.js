import { IPFSAccessController } from '@orbitdb/core'

let db = null

/**
 * Initialize or get the single OrbitDB instance
 */
export async function getOrCreateDB(orbitdb) {
    console.log("getOrCreateDB", orbitdb.id)
    if (db) {
        return db
    }

    // Open new DB with documents type and access control
    const dbName = 'nameops'
    db = await orbitdb.open(dbName, {
        type: 'documents',
        create: true,
        overwrite: false,
        directory: './orbitdb/nameops',
        AccessController: IPFSAccessController({ write: [orbitdb.identity.id] })
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

        const docId = `nameops-${blockDate}`;
        console.log(`Document ID: ${docId}`);

        const existingDoc = await db.get(docId);
        console.log("Existing document retrieved", existingDoc);

        const existingNameOps = existingDoc?.value?.nameOps || [];
        console.log(`Existing name operations count: ${existingNameOps.length}`);

        const allNameOps = [...existingNameOps, ...nameOpUtxos];
        console.log(`Total name operations count after merge: ${allNameOps.length}`);

        // Create a map using a composite key of relevant fields
        const uniqueMap = new Map();
        allNameOps.forEach(nameOp => {
            const key = `${nameOp.nameId}-${nameOp.nameValue}`;
            if (!uniqueMap.has(key) || uniqueMap.get(key).blocktime < nameOp.blocktime) {
                uniqueMap.set(key, nameOp);
            }
        });

        const uniqueNameOps = Array.from(uniqueMap.values());
        console.log(`Unique name operations count: ${uniqueNameOps.length}`);

        await db.put({
            _id: docId,
            nameOps: uniqueNameOps,
            blockHeight,
            blockDate
        });

        console.log(`Document updated in OrbitDB: ${docId}`, {
            totalOps: uniqueNameOps.length,
            newOps: nameOpUtxos.length,
            existingOps: existingNameOps.length
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
