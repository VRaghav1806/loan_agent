const { MongoClient } = require('mongodb');
const ATLAS_URI = 'mongodb+srv://raghavv2024aids_db_user:s8SJqfaijrmwuVDp@cluster0.r2jpdrk.mongodb.net/loan';
const ATLAS_DB = 'loan';

async function verify() {
    const client = new MongoClient(ATLAS_URI);
    try {
        await client.connect();
        const db = client.db(ATLAS_DB);
        const collections = await db.listCollections().toArray();
        console.log('Collections in Atlas:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} docs`);
        }
    } finally {
        await client.close();
    }
}
verify();
