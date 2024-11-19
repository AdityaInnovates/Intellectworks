# Firebase User Management and Notes API

> A robust REST API service hosted at [@intellectworks.onrender.com](https://intellectworks.onrender.com/) that provides seamless user management and note-taking capabilities powered by Firebase. Built with Node.js and Firebase Admin SDK, it offers secure authentication, user CRUD operations, and personal note management with a clean, well-documented API interface.

## Overview

This project provides a simple API built using Node.js and Firebase Admin SDK for user management and note storage. It allows users to sign up, update their information, delete their accounts, and manage personal notes. The application is designed with robust validation and error handling for seamless functionality.

---

## Features

1. **User Management:**

   - **Sign Up:** Create a new user and store user information in Firebase Authentication and Firestore.
   - **Update User:** Modify user details like name and email.
   - **Delete User:** Remove a user from Firebase Authentication and delete their data from Firestore.

2. **Notes Management:**
   - **Save Notes:** Save personal notes with a title, content, and timestamp.
   - **Retrieve Notes:** Fetch all notes for a user in descending order of creation.

---

## Prerequisites

- Node.js installed (version 14 or higher recommended).
- Environment variables configured with Firebase Admin SDK credentials.
- Firebase project configured with Authentication and Firestore.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repository-name.git
   cd your-repository-name
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:

   ```
   FIREBASE_CONFIG={"type":"service_account","project_id":"..."}
   ```

4. **Build the server:**

   ```bash
   npm run build
   ```

5. **Start the server:**

   ```bash
   npm run start
   ```

   The server runs on `http://localhost:3000`.

---

## API Endpoints

### 1. **Sign Up User**

- **Endpoint:** `/signup`
- **Method:** `POST`
- **Description:** Registers a new user and saves user details in Firestore.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User created successfully",
    "userId": "firebase-user-id"
  }
  ```

---

### 2. **Update User**

- **Endpoint:** `/update-user`
- **Method:** `PUT`
- **Description:** Updates user details in Firestore.
- **Request Body:**
  ```json
  {
    "userId": "firebase-user-id",
    "name": "New Name",
    "email": "newemail@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User information updated successfully.",
    "updatedData": {
      "name": "New Name",
      "email": "newemail@example.com",
      "updatedAt": "2024-11-18 12:00:00"
    }
  }
  ```

---

### 3. **Delete User**

- **Endpoint:** `/delete-user`
- **Method:** `DELETE`
- **Description:** Deletes a user and their data from Firebase Authentication and Firestore.
- **Request Body:**
  ```json
  {
    "userId": "firebase-user-id"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User deleted successfully from Firebase Authentication and Firestore."
  }
  ```

---

### 4. **Save Notes**

- **Endpoint:** `/save-note`
- **Method:** `POST`
- **Description:** Saves a new personal note under the user's notes collection.
- **Request Body:**
  ```json
  {
    "userId": "firebase-user-id",
    "title": "Note Title",
    "content": "Note Content"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Note saved successfully.",
    "noteId": "note-document-id",
    "noteData": {
      "title": "Note Title",
      "content": "Note Content",
      "timestamp": "2024-11-18T12:00:00.000Z"
    }
  }
  ```

---

### 5. **Get Notes**

- **Endpoint:** `/get-notes`
- **Method:** `GET`
- **Description:** Retrieves all notes for a user.
- **Query Parameters:**
  ```
  userId: firebase-user-id
  ```
- **Response:**
  ```json
  {
    "message": "Notes retrieved successfully.",
    "notes": [
      {
        "id": "note-document-id",
        "title": "Note Title",
        "content": "Note Content",
        "timestamp": "2024-11-18T12:00:00.000Z"
      }
    ]
  }
  ```

---

## Firestore Structure

The application uses the following structure in Firestore:

```
Users
  └── userId
       ├── name: "User Name"
       ├── email: "user@example.com"
       ├── createdAt: <Timestamp>
       └── Notes
            └── noteId
                 ├── title: "Note Title"
                 ├── content: "Note Content"
                 └── timestamp: <Timestamp>
```

---

## Error Handling

- Proper validation for user inputs like email format, password strength, and field presence.
- Error responses include descriptive messages for debugging.

---

## Technologies Used

- **Backend Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Admin SDK
- **Language:** Typescript

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software in compliance with the license terms.

---

## Author

Created by **Aditya Kumar**. Feel free to reach out for any questions or contributions! 😊
