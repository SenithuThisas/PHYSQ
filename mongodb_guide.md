# How to Connect Backend to MongoDB

This guide explains how to connect your PHYSQ Node.js backend to a MongoDB database. You can use a **Local MongoDB** (installed on your computer) or **MongoDB Atlas** (Cloud).

## Prerequisites
- **Node.js** installed.
- **Mongoose** installed in your backend:
  ```bash
  cd backend
  npm install mongoose dotenv
  ```

---

## Step 1: Get Your Connection String

### Option A: Local MongoDB (Recommended for Dev)
If you have MongoDB Compass or MongoDB Community Server installed locally, your connection string is usually:
```
mongodb://localhost:27017/physq
```
*Note: `physq` is the name of the database. It will be created automatically when you save data.*

### Option B: MongoDB Atlas (Cloud)
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a Cluster (Free Tier).
3.  Click **Connect** > **Drivers**.
4.  Copy the connection string. It looks like:
    ```
    mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/physq?retryWrites=true&w=majority
    ```
5.  Replace `<username>` and `<password>` with your actual database user credentials (NOT your Atlas login).

---

## Step 2: Configure Environment Variables

1.  Open (or create) the file `backend/.env`.
2.  Add a `MONGO_URI` variable with your connection string.

**Example `backend/.env`:**
```env
PORT=5000
# Uncomment the one you want to use:

# Local:
MONGO_URI=mongodb://localhost:27017/physq

# Cloud (Atlas):
# MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.example.mongodb.net/physq
```

---

## Step 3: Connect in Code

Ensure your `backend/index.js` contains the connection logic.

**`backend/index.js`:**
```javascript
require('dotenv').config(); // Load variables from .env
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// ... other middleware ...

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ... start server ...
```

---

## Step 4: Verify Connection

1.  Start your backend:
    ```bash
    cd backend
    node index.js
    ```
2.  Look at the terminal output. You should see:
    ```
    Server running on port 5000
    ✅ MongoDB Connected
    ```

## Troubleshooting
- **Connection Refused (127.0.0.1:27017)**: Ensure your local MongoDB service is running. On Windows, check "Services" -> "MongoDB Server".
- **Bad Auth (Atlas)**: Double-check your username and password in the connection string. Special characters in passwords might need to be URL encoded.
- **Whitelist (Atlas)**: Go to Atlas > Network Access and allow your IP address (or `0.0.0.0/0` for everywhere).
