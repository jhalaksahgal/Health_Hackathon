const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://healthHack:healthHack@1234@healthhack.5noaz.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("mydatabase");
    const collection = db.collection("mycollection");

    // Example: Add an entry
    await collection.insertOne({ name: "John Doe", loginTime: new Date() });
    console.log("Entry added!");
  } finally {
    await client.close();
  }
}

run().catch(console.error);
