const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://jokermokoena:${process.env.DATABASE_PASS}@maincluster.6py6fg3.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("MainCluster").command({ ping: 1 });  // Test the connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = { client, connectDB };
