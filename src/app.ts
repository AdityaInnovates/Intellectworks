import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { UserRequest, NoteRequest, Note, UserData } from './types';

dotenv.config();

const app = express();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
});

const auth = admin.auth();
const firestore = admin.firestore();

app.use(express.json());

// Signup route
app.post('/signup', async (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const user = await auth.createUser({
      email: email!,
      password: password!,
    });

    const userData: UserData = {
      name: name!,
      email: email!,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection('Users').doc(user.uid).set(userData);
    
    res.status(201).send({
      message: 'User created successfully',
      userId: user.uid,
    });
  } catch (error) {
    res.status(400).send({
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update user route
app.put('/update-user', async (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { userId, name, email } = req.body;
  
  

  try {
    const userRef = firestore.collection('Users').doc(userId!);
    const updatedData: Partial<UserData> = {};
    
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updatedData);
    
    res.status(200).send({
      message: 'User information updated successfully.',
      updatedData: {
        ...updatedData,
        updatedAt: new Date().toLocaleString(),
      },
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error updating user information.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Save note route
app.post('/save-note', async (req: Request<{}, {}, NoteRequest>, res: Response) => {
  const { userId, title, content } = req.body;

  

  try {
    const noteData = {
      title,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const noteRef = await firestore
      .collection('Users')
      .doc(userId)
      .collection('Notes')
      .add(noteData);

    res.status(201).send({
      message: 'Note saved successfully.',
      noteId: noteRef.id,
      noteData,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error saving note.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get notes route
app.get('/get-notes', async (req: Request<{}, {}, {}, { userId: string }>, res: Response) => {
  const { userId } = req.query;

  

  try {
    const notesRef = firestore
      .collection('Users')
      .doc(userId)
      .collection('Notes');
      
    const snapshot = await notesRef.orderBy('timestamp', 'desc').get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'No notes found for this user.' });
    }

    const notes: Note[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Note));

    res.status(200).send({
      message: 'Notes retrieved successfully.',
      notes,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error retrieving notes.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete user route
app.delete('/delete-user', async (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { userId } = req.body;
  
  try {
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required.' });
    }

    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).send({ message: 'Invalid User ID format.' });
    }

    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);

    // Delete user document from Firestore
    const userRef = firestore.collection('Users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.delete();
    }

    res.status(200).send({
      message: 'User deleted successfully from Firebase Authentication and Firestore.',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error deleting user.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 