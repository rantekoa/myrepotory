const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

app.use(bodyParser.json());

const url = `mongodb+srv://jokermokoena:${process.env.DATABASE_PASS}@maincluster.6py6fg3.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster`;
let db;

async function connectToDB() {
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db('MainCluster');
    console.log('Ticket Cluster Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}

connectToDB();

exports.insertTicket = async (req, res) => {
  if (!db) {
    return res.status(500).send({ error: 'Database connection not established' });
  }

  try {
    const  ticket  = req.body;
    if (!ticket) {
      return res.status(400).send({ error: 'Ticket data is required' });
    }
    const result = await db.collection('Tickets').insertOne(ticket);
    res.status(200).send({ message: 'Ticket submitted successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error inserting ticket:', error);
    res.status(500).send({ error: 'Failed to submit ticket' });
  }
};

