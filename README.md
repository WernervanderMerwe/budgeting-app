# Budgeting App

A full-stack personal budgeting application that replicates an Excel budget spreadsheet that I built during my studies with a modern web interface.

## Technology Stack

### Backend
- **Node.js + Express** - REST API server
- **SQLite** - Lightweight database 
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
  - Create new months with automatic structure copying
  - Copy fixed payments and budget categories from previous month
  - Income carries over to new months
- ✅ Income editing
  - Edit monthly income with visual feedback
  - Income updates automatically carry to future months
- ✅ Fixed payments tracking (rent, phone, etc.)
  - Add, edit, and delete fixed payments
  - Icon-based action buttons
- ✅ Budget categories (groceries, fuel, eating out, etc.)
  - Add, edit, and delete categories
  - Expandable/collapsible category cards
- ✅ Transaction logging with descriptions and dates
  - Date validation (transactions must be within selected month)
  - Visual transaction management
- ✅ Real-time budget calculations
- ✅ Over/under budget visual indicators (green/red)
- ✅ South African Rand (R) formatting
- ✅ Month switching in sidebar
- ✅ Dark mode toggle (Vue-inspired theme)
- ✅ Responsive icon-based UI (Bootstrap Icons)
- ✅ Automatic calculations:
  - After fixed payments
  - After budget allocations
  - Per-category spending
  - Total money remaining


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

## Database

SQLite database created at: `backend/database/budgeting.db`

To reset:
```bash
cd backend
rm database/budgeting.db
npm run init-db
npm run seed
```

## Usage

1. Start both backend (port 3000) and frontend (port 4200)
2. **Managing Months**:
   - Click the + button in sidebar to create a new month
   - Choose to copy structure from current month (payments & budgets)
   - Switch between months using sidebar buttons
3. **Managing Income**:
   - Click the edit icon next to income to update it
   - New months will carry over the current income
4. **Managing Budgets**:
   - Add categories with the + button in "Monthly Budgets"
   - Edit category amounts with the edit icon
   - Categories expand/collapse to show transactions
5. **Managing Transactions**:
   - Click + on any category card to add transactions
   - Transactions must be dated within the selected month
   - Red header = over budget, Green = under budget
6. **Dark Mode**: Toggle with moon/sun icon in top right

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

Based on the Excel spreadsheet from my university days. Now with data persistence and a modern web interface!