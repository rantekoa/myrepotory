const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const os = require("os");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
let db, chatsCollection;

// MongoDB Connection
const mongoURI = `mongodb+srv://jokermokoena:${process.env.DATABASE_PASS}@maincluster.6py6fg3.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster`;

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function connectDB() {
  try {
    await client.connect();
    db = client.db("MainCluster");
    chatsCollection = db.collection("Chats");
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

const fetchAndStoreChats = async () => {

  if (!chatsCollection) {
    console.error("No data has been stored yet.....");
    return;
  }

  try {
    const response = await axios.get("https://karabo.pythonanywhere.com/get");
    let chats = response.data;

    if (!Array.isArray(chats) || chats.length === 0) {
      console.log("No new data available.");
      return;
    }

    // Add "code": null for records with "tag": "success"
    chats = chats.map(chat => ({
      code: chat.tag === "success" && !chat.code ? null : chat.code,
      message: chat.message,
      prompt: chat.prompt,
      status: chat.status || "unresolved",
      tags: chat.tag ? [chat.tag] : [],
      user_id: chat.user_id,
      chat_date: chat.chat_date || new Date().toISOString().split("T")[0],
      chat_time: chat.chat_time || new Date().toLocaleTimeString("en-GB"),
    }));

    for (const chat of chats) {
      const exists = await chatsCollection.findOne({
        message: chat.message,
        prompt: chat.prompt,
        status: chat.status,
        tags: chat.tags,
        user_id: chat.user_id,
        chat_date: chat.chat_date,
        chat_time: chat.chat_time,
      });

      if (!exists) {
        await chatsCollection.insertOne(chat);
        console.log("New chat inserted successfully.");
      } else {
        console.log(`Message from user with ID: "${chat.user_id}" already exists.`);
      }
    }
  } catch (error) {
    console.error("Error fetching chats:", error);
  }
};

setInterval(fetchAndStoreChats, 60000);
fetchAndStoreChats();

const serverIP = () => {
  const interfaces = os.networkInterfaces();
  let hostIP;

  Object.keys(interfaces).forEach((interfaceName) => {
    const networkInterface = interfaces[interfaceName];
    networkInterface.forEach((address) => {
      if (address.family === "IPv4" && !address.internal) {
        hostIP = address.address;
      }
    });
  });

  return hostIP;
};

const usersRouter = require('./routes/users');
const chatsRouter = require('./routes/chats');
const ticketsRouter = require('./routes/tickets');

app.use("/api/users", usersRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/tickets", ticketsRouter);

const PORT = process.env.PORT || 80;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`${process.env.DATABASE_PASS}`)
    console.log(`Server Started on Socket =::= ${serverIP()}:${PORT}`);
  });
});
