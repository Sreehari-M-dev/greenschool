# 🌱 Green School Digital Monitoring System

This is a brand new project scaffolding for the Green School Digital Monitoring System.

## Architecture & Tech Stack

1. **Frontend (GitHub Pages target)**
   - Pure HTML, CSS (Tailwind via CDN for fast styling), Vanilla JavaScript.
   - **Authentication**: Uses Firebase Authentication via standard SDK v10 inline imports.

2. **Backend (Render target)**
   - Node.js & Express API server.
   - Connects to an external MongoDB database (MongoDB Atlas).
   - Validates Firebase ID Tokens via the Firebase Admin SDK.

3. **Database**
   - MongoDB (using Mongoose).

## Configuration Steps

### 1. Firebase Setup (Frontend & Backend Authentication)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project called **"Green School Auth"**.
3. Enable **Authentication** and select **Google** as the Sign-In method.
4. Add a Web App to retrieve your Firebase Config block.
5. Open `app.js` and paste your credentials into the `firebaseConfig` object at the top.
6. In Firebase, go to **Project Settings > Service Accounts** and click "Generate New Private Key".
7. Save the raw JSON of that key securely to your Render Environment Variables as `FIREBASE_SERVICE_ACCOUNT`.
8. In `server.js`, uncomment the `admin.initializeApp` block and remove the mock token middleware blocks.

### 2. MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free tier cluster.
2. In Database Access, create a user & password.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`).
4. Copy the Connect URI string (`mongodb+srv://...`).
5. Create a `.env` file for the backend and add: `MONGODB_URI="your-uri-here"`.

### 3. Running Locally using CMD
1. Open `cmd.exe`.
2. Navigate to this directory: `cd "f:\Program Files\Geany\Coding\HTML\xampp\htdocs\GreenSchool"`
3. Install dependencies: `npm install`
4. Start the backend: `npm run dev`
5. Open `index.html` in your browser. (Because we use JS imports, you must serve the frontend with a local server like Live Server or Python `python -m http.server`, not just double-click the HTML file).

## Deployment

* **Backend:** Push the directory to GitHub and connect it to a new Render "Web Service". Add `MONGODB_URI` and `FIREBASE_SERVICE_ACCOUNT` as Environment Variables in the Render dashboard. Update `app.js` API URL to point to Render.
* **Frontend:** Push the frontend files (`index.html`, `app.js`) to a separate repository (or branch) and use GitHub Pages.
