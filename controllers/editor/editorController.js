const { connectToDatabase } = require("../../config/dbConn.js");
const bcrypt = require("bcrypt");

const createEditor = async (req, res) => {
  const db = await connectToDatabase();
  const collection = db.collection("User");
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username and password must be provided" });
  }
  const duplicate = await collection.findOne({ email });
  if (duplicate) {
    return res.status(401).json({ message: "Duplicated user" });
  }
  const hashedPwd = await bcrypt.hash(password, 10);

  try {
    const result = await db.collection("User").insertOne({
      username,
      role: [1984],
      password: hashedPwd,
      email,
    });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error creating seed admin user: ${error}` });
  }
};

const getEditors = async (req, res) => {
  const db = await connectToDatabase();
  const collection = db.collection("User");
  const editor = await collection
    .find({ role: 1984 }, { projection: { _id: 0, username: 1, email: 1 } })
    .toArray();
  if (!editor) return res.status(404).json({ message: "No editors found" });
  res.json(editor);
};

module.exports = { createEditor, getEditors };