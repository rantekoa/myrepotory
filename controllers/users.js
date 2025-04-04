const bcrypt = require("bcrypt");
const { client } = require("./connect");

const db = client.db("MainCluster");
const usersCollection = db.collection("Users");

// Register User
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists! Try a different one." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { email, password: hashedPassword };
        await usersCollection.insertOne(newUser);

        res.status(201).json({ message: "Registration successful! Welcome aboard!" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Something went wrong. Internal Server Error" });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Wrong Password Provided!" });
        }

        res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Oops! Server Problems" });
    }
};
