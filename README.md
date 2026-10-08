# Health Monitor Backend

Node.js + Express backend for the **AI-Based Smart Health Monitoring Application**.

## Tech Stack

- **Node.js + Express** — Web framework
- **MongoDB Atlas + Mongoose** — Database
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **USDA FoodData Central API** — Nutrition lookup
- **CORS** — Cross-origin requests
- **dotenv** — Environment variables

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/SHARK-10/health-monitor-backend.git
cd health-monitor-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` in the root

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
USDA_API_KEY=your_usda_api_key
```

### 4. Run the server

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint      | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/`           | API info                 |
| GET    | `/api/health` | Health check + DB status |

## Project Structure

```
health-monitor-backend/
├── config/          # DB connection
├── controllers/     # Business logic
├── middleware/      # Auth, error handling
├── models/          # Mongoose schemas
├── routes/          # API routes
├── utils/           # Helper functions
├── .env             # Environment variables (not committed)
├── server.js        # Entry point
└── package.json
```

## Scripts

| Command       | Description           |
| ------------- | --------------------- |
| `npm start`   | Production run        |
| `npm run dev` | Development (nodemon) |

## Server

Runs on `http://localhost:5000`

## Author

**Shamanth Kumar S** — [GitHub](https://github.com/SHARK-10)
