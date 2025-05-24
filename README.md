# Booksy - Book Review Application

A full-stack book review application built with React (frontend) and Node.js (backend).

## Project Structure

```
booksy/
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # Node.js backend API
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── ...
├── package.json       # Root package.json for managing both projects
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/iamtatha/booksy.git
cd booksy
```

2. Install all dependencies:
```bash
npm run install-all
```

### Development

To run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

### Building for Production

Build both frontend and backend:
```bash
npm run build
```

Or build them separately:
```bash
npm run build:frontend
npm run build:backend
```

### Deployment

**Backend (Render):**
- Set root directory to `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

**Frontend (Netlify/Vercel):**
- Set root directory to `frontend`
- Build command: `npm run build`
- Publish directory: `build`

## Environment Variables

Create `.env` files in both frontend and backend directories with the required environment variables.

**Backend (.env):**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Features

- User authentication and authorization
- Book browsing and searching
- Book reviews and ratings
- User profiles and following system
- Responsive mobile design
- Modern UI with Material-UI components

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Axios

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.