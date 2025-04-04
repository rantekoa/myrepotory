const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const { Schema, model } = mongoose;
require("dotenv").config();

// MongoDB Connection
const mongoURI = `mongodb+srv://jokermokoena:${process.env.DATABASE_PASS}@maincluster.6py6fg3.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster`;
const client = new MongoClient(mongoURI);

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.error("MongoDB connection error:", err));

// Define Chat Schema
const chatSchema = new Schema({
    code: String,
    message: String,
    prompt: String,
    status: { type: String, enum: ["resolved", "unresolved"], default: "unresolved" },
    tags: [String],
    chat_date: { type: String, default: new Date().toISOString().split("T")[0] },
    chat_time: { type: String, default: new Date().toLocaleTimeString("en-GB") }
});

const Chat = model("Chat", chatSchema);

// Insert Chat
exports.insertChat = async (req, res) => {
    try {
        const chats = req.body.chats;
        if (!Array.isArray(chats) || chats.length === 0) {
            return res.status(400).json({ message: "No data to insert" });
        }
        
        const insertedChats = await Chat.insertMany(chats);
        res.json({ message: `${insertedChats.length} new records inserted.` });
    } catch (error) {
        console.error("Error inserting records:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Unsolved Chats
exports.getUnsolvedChats = async (req, res) => {
    try {
        const unsolvedChats = await Chat.find({ status: "unresolved" });
        res.json({ unsolvedChats });
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ error: "Failed to retrieve records" });
    }
};

// Get All Chats
exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find().sort({ _id: -1 });
        res.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Failed to retrieve chats" });
    }
};

// Resolve Chat
exports.resolveChat = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Code is required" });

        const result = await Chat.updateOne({ code }, { status: "resolved" });
        if (result.modifiedCount > 0) {
            res.json({ message: "Chat status updated to resolved" });
        } else {
            res.status(404).json({ message: "No record found with the given code" });
        }
    } catch (error) {
        console.error("Error updating record:", error);
        res.status(500).json({ error: "Failed to update record" });
    }
};

// Get Chat Stats
exports.getChatStats = async (req, res) => {
    try {
        const resolvedCount = await Chat.countDocuments({ status: "resolved" });
        const unresolvedCount = await Chat.countDocuments({ status: "unresolved" });
        res.json({ resolved: resolvedCount, unresolved: unresolvedCount });
    } catch (error) {
        console.error("Error fetching chat stats:", error);
        res.status(500).json({ error: "Failed to fetch chat statistics" });
    }
};

exports.getDistinctUserCount = async (req, res) => {
    try {
        await client.connect();
        const db = client.db("MainCluster");
        const collection = db.collection("Chats");

        const userCount = await collection.distinct("user_id");
        return userCount.length;
    } catch (error) {
        console.error("Error fetching distinct user count:", error);
        throw error;
    } finally {
        await client.close();
    }
}

exports.getChatsByDate = async (req, res) => {
    const { date } = req.query; 
    try {
        await client.connect();
        const db = client.db("ChatOpsDatabase");
        const collection = db.collection("chats");

        const chats = await collection.find({ chat_date: date }).toArray();
        return chats;
    } catch (error) {
        console.error("Error fetching chats by date:", error);
        throw error;
    } finally {
        await client.close();
    }
}

exports.getChatsByTime = async (req, res) => {
    try {
        const { time, range } = req.query;

        if (!time && !range) {
            return res.status(400).json({ error: "Either time or range is required" });
        }

        await client.connect();
        const db = client.db("ChatOpsDatabase");
        const collection = db.collection("chats");

        let query = {};

        if (time) {
            query.chat_time = time;
        } else if (range === "last_hour") {
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            query.chat_time = { $gte: oneHourAgo.toLocaleTimeString("en-GB") };
        }

        const chats = await collection.find(query).sort({ chat_date: -1, chat_time: -1 }).toArray();

        res.json(chats);
    } catch (error) {
        console.error("Error fetching chats by time:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
};

exports. getInteractionTrends = async (req, res) => {
    try {
        await client.connect();
        const db = client.db("ChatOpsDatabase");
        const collection = db.collection("chats");

        const trends = await collection.aggregate([
            { 
                $group: { 
                    _id: "$chat_date", 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        return trends;
    } catch (error) {
        console.error("Error fetching interaction trends:", error);
        throw error;
    } finally {
        await client.close();
    }
}
