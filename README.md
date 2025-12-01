# School Management System  
A full-stack application designed to streamline academic, financial, and administrative operations for schools.  
Built with **React**, **Node.js**, **Express**, **Prisma**, and **PostgreSQL**.

---

## 🚀 Features

### 📊 Dashboard
- Displays daily fee credits, salary deductions, overall student count, and class-wise attendance summaries.
- Provides administrators with a quick overview of key academic and financial metrics.

### 🤖 AI Question Generator
- Generates quiz and test questions using the Groq API.
- Supports adjustable difficulty levels for teachers.

### 💰 Finance Module
- Fee collection and payment tracking.
- Salary processing for staff.
- Receipt generation and complete transaction history.

### 📝 Attendance Management
- Class-wise attendance tracking.
- Bulk update functionality.
- Monthly summary reports with automatic status calculations.

### 🧑‍🎓 Student & Class Administration
- Add and manage student records.
- Create and update classes.
- Centralized interface for monitoring academic activity.

---

## 🧰 Tech Stack

### **Frontend**
- React    
- MUI CSS

### **Backend**
- Node.js  
- Express  
- Prisma ORM  
- REST APIs  
- Groq API integration  

### **Database**
- PostgreSQL 

### **Dev Tools**
- Docker

---

## 📁 Folder Structure
<pre>
project/
├── prisma/                 # Prisma schema and migrations
├── public/                 # Public assets (icons/media)
├── src/
│   ├── app/                # Application routes & UI (Next.js App Router)
│   │    ├── api/           # Backend APIs
│   │    └── Pages          # Frontend Pages and Components
│   │ 
│   ├── context/            # Global state providers
│   ├── hooks/              # Reusable custom hooks
│   ├── lib/                # Utilities, helpers, and config
│   ├── middleware/         # API / auth / edge middleware
│   ├── pages/              # API routes or legacy Next.js pages (if used)
│   └── types/              # TypeScript definitions & interfaces
├── tests/                  # Jest / Playwright tests
├── .gitignore
├── env.d.ts                # Environment variable type declarations
├── eslint.config.mjs       # ESLint configuration
├── jest.config.js       
├── next.config.ts          # Next.js project configuration
├── package.json
├── package-lock.json
├── playwright.config.ts    # Playwright testing configuration
├── random.ts               # Scratch / experimental file
├── server.ts               # Server entry or API extension layer
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
</pre>
