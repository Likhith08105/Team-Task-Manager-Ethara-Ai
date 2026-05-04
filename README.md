# Team Task Manager

Team Task Manager is a MERN app for creating projects, adding team members, assigning tasks, and tracking task status.

## Tech Stack

- MongoDB
- Express.js
- React
- Node.js
- Vite
- Tailwind CSS

## Project Structure

```text
Team Task manager/
  backend/
    server.js
    config/
    controllers/
    middleware/
    models/
    routes/
  frontend/
    src/
    index.html
    vite.config.js
```

## Requirements

Install these before running the project:

- Node.js
- npm
- MongoDB database, either local MongoDB or MongoDB Atlas

## Backend Setup

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

If you do not want to use nodemon, run:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000/api
```

## Frontend Setup

Open another terminal in the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend should run at:

```text
http://localhost:3000
```

If Vite starts on a different port, open the URL shown in the terminal.

## Running the App Locally

Start both servers:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Then open the frontend URL in your browser.

Typical local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api
```

## Build Frontend for Production

From the frontend folder:

```bash
npm run build
```

This creates a production build in:

```text
frontend/dist
```

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### Backend Deployment

You can deploy the backend to services like Render, Railway, or any Node.js hosting provider.

Use these settings:

```text
Root directory: backend
Build command: npm install
Start command: npm start
```

Add these environment variables in the hosting dashboard:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
```

After deployment, copy the backend API URL. It will look like:

```text
https://your-backend-url.com/api
```

### Frontend Deployment

You can deploy the frontend to services like Vercel, Netlify, or Render Static Sites.

Use these settings:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Add this environment variable in the frontend hosting dashboard:

```env
VITE_API_URL=https://your-backend-url.com/api
```

Redeploy the frontend after changing environment variables.

## Important Notes

- Do not commit real `.env` values to GitHub.
- Restart the backend after changing backend environment variables.
- Rebuild or redeploy the frontend after changing `VITE_API_URL`.
- Make sure the backend is running before using the frontend.
- If API calls fail in production, check that `VITE_API_URL` points to the deployed backend URL.

## Common Commands

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```
