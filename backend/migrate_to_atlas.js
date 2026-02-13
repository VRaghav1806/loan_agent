const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://localhost:27017';
const LOCAL_DB = 'loan-advisor';
const ATLAS_URI = 'mongodb+srv://raghavv2024aids_db_user:s8SJqfaijrmwuVDp@cluster0.r2jpdrk.mongodb.net/loan';
const ATLAS_DB = 'loan';

const collections = [
    'users',
    'loans',
    'loanapplications',
    'agentprofiles',
    'conversations'
];

async function migrate() {
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        await localClient.connect();
        await atlasClient.connect();

        console.log('Connected to local and Atlas MongoDB');

        const localDb = localClient.db(LOCAL_DB);
        const atlasDb = atlasClient.db(ATLAS_DB);

        for (const colName of collections) {
            console.log(`Migrating collection: ${colName}...`);

            const docs = await localDb.collection(colName).find({}).toArray();

            if (docs.length > 0) {
                // Remove _id from docs or keep them? Usually Atlas handles them, but if we want same IDs, keep them.
                // We'll use upsert or just insertMany. To avoid duplicates if run twice, we delete first or use a smarter way.
                // For a one-time migration, deleting and re-inserting is safest if the user wants an exact copy.

                await atlasDb.collection(colName).deleteMany({});
                await atlasDb.collection(colName).insertMany(docs);
                console.log(`Successfully migrated ${docs.length} documents for ${colName}`);
            } else {
                console.log(`No documents found in ${colName}, skipping.`);
            }
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
