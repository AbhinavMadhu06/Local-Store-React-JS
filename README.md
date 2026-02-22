# Local Store - Frontend

This is the React + Vite frontend for the Local Store job board platform. 

It provides a stunning, glassmorphic UI for Job Seekers to find local jobs and Shop Owners to post vacancies and manage applicants.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Lucide React (Icons)
- Axios

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `frontend` directory:
   ```env
   VITE_API_BASE_URL_LOCAL=http://localhost:8000/api/
   VITE_API_BASE_URL_DEPLOY=https://your-deployed-backend-url.com/api/
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Deployment

This Vite project is fully ready to be deployed on platforms like **Vercel**, **Netlify**, or **Render**.
Make sure your Build Command is `npm run build` and your Publish Directory is `dist`.

Ensure you securely inject the `VITE_API_BASE_URL_DEPLOY` environment variable inside your hosting provider's dashboard so the frontend can successfully communicate with the Django REST API in production.
