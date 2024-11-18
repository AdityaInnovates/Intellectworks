const express = require("express");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const firestore = admin.firestore();

// Middleware to parse JSON
app.use(express.json());

// Signup route
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  // Basic presence validation
  if (!email || !password || !name) {
    return res.status(400).send({
      message: "Email, Name, and Password are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send({
      message: "Invalid email format",
    });
  }

  if (password.length < 6) {
    return res.status(400).send({
      message: "Password must be at least 6 characters long",
    });
  }

  if (name.length < 2 || name.length > 50) {
    return res.status(400).send({
      message: "Name must be between 2 and 50 characters",
    });
  }

  try {
    // Create user in Firebase
    const user = await auth.createUser({
      email: email,
      password: password,
    });
    await firestore.collection("Users").doc(user.uid).set({
      name: name,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).send({
      message: "User created successfully",
      userId: user.uid,
    });
  } catch (error) {
    res.status(400).send({
      message: "Error creating user",
      error: error.message,
    });
  }
});

app.put("/update-user", async (req, res) => {
  const { userId, name, email } = req.body;
  try {
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    // Enhanced validations
    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).send({ message: "Invalid User ID format." });
    }

    if (!name && !email) {
      return res.status(400).send({ message: "Name or Email is required." });
    }

    if (name && (name.length < 2 || name.length > 50)) {
      return res
        .status(400)
        .send({ message: "Name must be between 2 and 50 characters." });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send({ message: "Invalid email format." });
      }
    }
    const userRef = firestore.collection("Users").doc(userId);

    // Check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).send({ message: "User not found." });
    }

    // Update user data
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;

    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updatedData);
    updatedData["updatedAt"] = new Date().toLocaleString();
    res.status(200).send({
      message: "User information updated successfully.",
      updatedData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating user information.",
      error: error.message,
    });
  }
});

app.delete("/delete-user", async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).send({ message: "Invalid User ID format." });
    }
    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);

    // Delete user document from Firestore
    const userRef = firestore.collection("Users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.delete();
    }

    res.status(200).send({
      message:
        "User deleted successfully from Firebase Authentication and Firestore.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error deleting user.",
      error: error.message,
    });
  }
});

app.post("/save-note", async (req, res) => {
  const { userId, title, content } = req.body;
  try {
    if (!userId || !title || !content) {
      return res.status(400).send({
        message: "User ID, title, and content are required.",
      });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).send({ message: "Invalid User ID format." });
    }

    if (title.length < 1 || title.length > 100) {
      return res.status(400).send({
        message: "Title must be between 1 and 100 characters.",
      });
    }

    if (content.length < 1 || content.length > 10000) {
      return res.status(400).send({
        message: "Content must be between 1 and 10000 characters.",
      });
    }
    const noteData = {
      title,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save the note in Firestore under the user's notes collection
    const noteRef = await firestore
      .collection("Users")
      .doc(userId)
      .collection("Notes")
      .add(noteData);

    res.status(201).send({
      message: "Note saved successfully.",
      noteId: noteRef.id,
      noteData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error saving note.",
      error: error.message,
    });
  }
});

app.get("/get-notes", async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).send({ message: "Invalid User ID format." });
    }
    const notesRef = firestore
      .collection("Users")
      .doc(userId)
      .collection("Notes");
    const snapshot = await notesRef.orderBy("timestamp", "desc").get();

    if (snapshot.empty) {
      return res.status(404).send({ message: "No notes found for this user." });
    }

    // Format the notes into an array
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: "Notes retrieved successfully.",
      notes,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving notes.",
      error: error.message,
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
