# Leave Management System

A role-based web application built with React + Vite for managing employee leave requests, approvals, and HR operations. Includes authentication, protected routes, and a mock backend using JSON Server.

## Features

- **Role-Based Access Control**
  - **Employee**: Apply for leave, view balance/history
  - **Manager**: Approve/reject team requests, view team details
  - **HR Admin**: Full employee management, company-wide leaves
- **Authentication System** with session persistence(uses local storage)
- **Leave Management**
  - Leave Balance tracking (Paid leaves start at 20 days, persists across sessions and unpaid leaves are infinity)
  - Request workflow (Pending → Approved/Rejected or cancelled by user)
  - Date range selection & leave type categorization
- **Interactive Dashboard** with data visualization (donut chart for balances)
- **Protected Routes** based on user roles

## Installation

1. **Clone the repository**
   - git clone [your-repository-url]
   - cd leave-management-system
2. **Install dependencies**
   - npm install
3. **Install JSON Server (mock backend)**
   - npm install -g json-server (Global install)
   - npm install json-server --save-dev (Local install)

## Running the Application

1. **Start React development server**
   - npm run dev
2. **Start JSON Server (in a separate terminal)**
   - json-server --watch db.json --port 3001 (Ensure db.json exists in your root directory)
