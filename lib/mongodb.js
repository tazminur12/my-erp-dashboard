import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'my-erp-dashboard';

// Connection options with timeouts
const options = {
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 10000, // 10 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  retryReads: true,
};

let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env');
}

// Helper function to connect to MongoDB
async function connectToMongoDB() {
  try {
    const mongoClient = new MongoClient(uri, options);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB successfully');
    return mongoClient;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToMongoDB();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = connectToMongoDB();
}

// Helper function to get database
export async function getDb() {
  try {
    const client = await clientPromise;
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    return client.db(dbName);
  } catch (error) {
    console.error('Error getting database:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      throw new Error(
        'MongoDB connection timeout. Please check:\n' +
        '1. Your internet connection\n' +
        '2. MongoDB Atlas IP whitelist settings\n' +
        '3. Connection string is correct\n' +
        `Original error: ${error.message}`
      );
    }
    
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Test connection function
export async function testConnection() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { success: true, message: 'MongoDB connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default clientPromise;
