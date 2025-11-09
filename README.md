# Budgeting App

A full-stack personal budgeting application that replicates your Excel budget spreadsheet with a modern web interface.

## Technology Stack

### Backend
- **Node.js + Express** - REST API server
- **SQLite** - Lightweight database (perfect for personal use)
- **No ORM** - Raw SQL for simplicity and performance

### Frontend
- **Angular 17** - Modern web framework
- **Bootstrap 5** - Responsive UI components
- **RxJS** - Reactive data management
- **TypeScript** - Type-safe code

## Getting Started

### 1. Setup Backend

```bash
cd backend
npm install
npm run init-db    # Initialize database
npm run seed       # (Optional) Add test data
npm start          # Start API server at http://localhost:3000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start          # Start dev server at http://localhost:4200
```

### 3. Open in Browser

Navigate to **http://localhost:4200**

## Features Implemented ✓

- ✅ Month management (create, select, delete months)
- ✅ Fixed payments tracking (rent, phone, etc.)
- ✅ Budget categories (groceries, fuel, eating out, etc.)
- ✅ Transaction logging with descriptions and dates
- ✅ Real-time budget calculations
- ✅ Over/under budget visual indicators (green/red)
- ✅ Add/delete transactions via modal
- ✅ South African Rand (R) formatting
- ✅ Month switching in sidebar
- ✅ Automatic calculations:
  - After fixed payments
  - After budget allocations
  - Per-category spending
  - Total money remaining

## Bug Fixes from Original Code

1. ✅ Fixed `eatingOutFilter()` bug (line 93) - was assigning to wrong variable
2. ✅ Replaced hardcoded data.json with live API calls
3. ✅ Added month switching functionality (sidebar buttons now work)
4. ✅ Implemented transaction management UI
5. ✅ Added proper state management with RxJS
6. ✅ Consistent currency formatting throughout

## API Endpoints

All endpoints available at `http://localhost:3000/api`

### Months
- `GET /months` - List all months
- `GET /months/:id` - Get month details
- `POST /months` - Create new month
- `GET /months/:id/summary` - Get calculations

### Transactions
- `POST /categories/:categoryId/transactions` - Add transaction
- `DELETE /transactions/:id` - Delete transaction

See [full API documentation](#api-endpoints) below for all endpoints.

## Database

SQLite database created at: `backend/database/budgeting.db`

To reset:
```bash
cd backend
rm database/budgeting.db
npm run init-db
npm run seed
```

## Why Node.js Instead of Java?

You started with Java but switched to Node.js/Express because:
- **60-70% less boilerplate code**
- 8 files vs 20-30 files for same functionality
- No framework complexity (Spring Boot, JPA, etc.)
- Faster development
- Perfect for personal projects

## Usage

1. Start both backend (port 3000) and frontend (port 4200)
2. Click month in sidebar to view/edit
3. Click "+ Add" on any category to add transactions
4. Watch calculations update in real-time
5. Red header = over budget, Green = under budget
6. Delete transactions with × button

## Project Structure

```
budgeting-app/
├── backend/          # Node.js API
│   ├── database/     # SQLite + schemas
│   ├── routes/       # API endpoints
│   └── server.js     # Express app
├── frontend/         # Angular 17
│   └── src/app/      # Components & services
└── README.md
```

---

Based on your Excel spreadsheet from university days. Now with data persistence and a modern web interface!