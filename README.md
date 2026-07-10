# Latest Chat 💬

A modern, full-stack, production-ready real-time messaging application built with **React 19**, **Express 5**, **Tailwind CSS v4**, and **Socket.io**. It features secure authentication via **Clerk**, real-time notifications, theme customizations, media attachments via **ImageKit**, and a multi-stage **Docker** setup for easy deployment.

---

## 🚀 Key Features

*   ⚡ **Real-Time Messaging**: Instant message delivery and receipt powered by Socket.io.
*   🟢 **Online Status Indicators**: Real-time tracking of online users.
*   🔐 **Secure Authentication**: Authentication at the edge using Clerk (for both React frontend and Express backend middleware).
*   🎨 **Rich Interactive UI**: Responsive, modern layout styled with Tailwind CSS v4 and the HeroUI component library.
*   🌗 **Theme Customization**: Light/dark mode toggle and a custom theme preset picker.
*   🖼️ **Chat Wallpaper Picker**: Personalize your conversation space with custom backgrounds.
*   📁 **Media & File Attachments**: Seamlessly send images and videos, uploaded and optimized via ImageKit.
*   🔄 **Multi-Tab Sync & Self-Chat**: Smart Socket.io room management ensures multi-tab synchronization and supports private messaging/notes to self.
*   ⚙️ **Keep-Alive Cron**: Integrated server cron job to ping the app health endpoint, preventing cold-start spin-downs on hosting platforms like Render.
*   🐳 **Containerized Setup**: Ready for production with a multi-stage Docker build.

---

## 🛠️ Tech Stack

### Frontend
*   **React 19** & **Vite** (Next-generation frontend tooling)
*   **Tailwind CSS v4** (Advanced layout & modern styling)
*   **HeroUI** (Accessible and interactive UI components)
*   **Zustand** (Ultra-lightweight state management)
*   **Socket.io Client** (Real-time network events)
*   **React Router v7 / v8** (Declarative routing)
*   **Lucide React** (Clean, SVG-based icon suite)

### Backend
*   **Node.js** & **Express 5** (Fast, unopinionated routing using the latest Express release)
*   **MongoDB** & **Mongoose** (Scalable document storage and ODM schema modeling)
*   **Socket.io** (Bidirectional real-time communication server)
*   **@clerk/express** (Secure middleware token verification)
*   **Multer** (File upload parsing)
*   **@imagekit/nodejs** (Media optimization and CDN storage)
*   **Cron** (Automated ping cycles)

---

## 📂 Project Structure

```
latest_chat/
├── backend/                  # Express 5 backend server
│   ├── src/
│   │   ├── controllers/      # Route request handlers
│   │   ├── lib/              # Shared utilities (db, socket, cron, imagekit)
│   │   ├── middleware/       # Express middlewares (auth, upload)
│   │   ├── models/           # Mongoose ODM schemas
│   │   ├── routes/           # REST endpoints
│   │   ├── seeds/            # Database seeding scripts
│   │   └── index.js          # Server entry point
│   └── package.json
├── frontend/                 # Vite + React 19 frontend
│   ├── src/
│   │   ├── components/       # UI & chat elements (sidebar, composer, themes)
│   │   ├── hooks/            # Reusable custom hooks
│   │   ├── store/            # Zustand global state stores
│   │   ├── pages/            # Page routing components (Chat, Auth)
│   │   └── main.jsx          # Frontend entry point
│   └── package.json
├── Dockerfile                # Production multi-stage Docker build
└── README.md                 # Project documentation
```

---

## ⚙️ Local Setup and Configuration

To run this application locally, you will need to set up backend and frontend environment variables.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v22+ recommended)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local MongoDB instance
*   A [Clerk](https://clerk.com/) account for user authentication
*   An [ImageKit](https://imagekit.io/) account for hosting uploaded media files

---

### 1. Backend Configuration

Navigate into the `backend/` directory, create a `.env` file, and populate it with the following:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/your-db
FRONTEND_URL=http://localhost:5173

# Clerk Keys
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ImageKit Keys
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint_id
```

Install dependencies and start the backend development server:

```bash
cd backend
npm install
npm run dev
```

---

### 2. Frontend Configuration

Navigate into the `frontend/` directory, create a `.env` file, and populate it with the following:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Install dependencies and start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173/` by default and proxy requests to your backend at `http://localhost:3000/`.

---

## 🐳 Docker Deployment (Monolith Build)

The project includes a multi-stage `Dockerfile` in the root folder that builds both the static React client and the Express server, hosting them together.

### Building the Image

Run this command from the root directory (make sure to pass your Clerk Publishable Key as a build argument so it gets embedded in the static build files):

```bash
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key \
  -t latest-chat .
```

### Running the Container

Provide your production database credentials and other secret keys as environment variables:

```bash
docker run -p 3001:3001 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e CLERK_SECRET_KEY="your-clerk-secret-key" \
  -e IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key" \
  -e IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key" \
  -e IMAGEKIT_URL_ENDPOINT="your-imagekit-endpoint" \
  latest-chat
```

The app will be accessible at `http://localhost:3001`.

---

## 📄 License
This project is licensed under the ISC License.
