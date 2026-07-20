# Rwanda Bus Ticketing System

A modern full-stack bus ticketing platform for Rwanda that enables passengers to search
schedules, book seats, download digital tickets, and manage reservations entirely online —
no office visit required.

Built with React, Express, TypeScript, PostgreSQL, and Prisma as a portfolio-quality final
project demonstrating modern full-stack software engineering practices.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [User Roles](#user-roles)
- [Business Rules](#business-rules)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Team](#team)
- [License](#license)

---

## Project Overview

The Rwanda Bus Ticketing System is a web application that allows passengers to:

- Search available bus schedules by route, date, and seat availability
- Book seats on buses without visiting a ticket office
- Download digital tickets as PDF with embedded QR codes
- Cancel bookings up to 3 hours before departure
- Manage their booking history from a personal dashboard

The system provides dedicated dashboards for Customers, Agents, and Administrators with
role-based access control.

**Initial Route:**

```
Nyanza → Ruhango → Muhanga → Kigali
```

The architecture supports adding new routes, buses, and operators without structural changes.

---

## Live Demo

| Service     | URL                                         |
|-------------|---------------------------------------------|
| Frontend    | https://rwanda-bus-ticketing.vercel.app     |
| Backend API | https://rwanda-bus-api.railway.app          |
| API Docs    | https://rwanda-bus-api.railway.app/docs     |

---

## Tech Stack

### Frontend

| Technology      | Purpose                        |
|-----------------|--------------------------------|
| React 19        | UI framework                   |
| TypeScript      | Type safety                    |
| Vite            | Build tool and dev server      |
| Tailwind CSS    | Utility-first styling          |
| shadcn/ui       | Accessible UI components       |
| React Router v6 | Client-side routing            |
| TanStack Query  | Server state management        |
| React Hook Form | Form handling                  |
| Zod             | Schema validation              |
| Axios           | HTTP client                    |
| Recharts        | Dashboard charts               |

### Backend

| Technology          | Purpose                              |
|---------------------|--------------------------------------|
| Node.js             | Runtime                              |
| Express.js          | Web framework                        |
| TypeScript          | Type safety                          |
| Prisma ORM          | Database access and migrations       |
| PostgreSQL          | Relational database                  |
| JWT                 | Authentication tokens                |
| bcrypt              | Password hashing                     |
| Helmet              | HTTP security headers                |
| express-rate-limit  | API rate limiting                    |
| Zod                 | Request validation                   |
| Nodemailer          | Email notifications                  |
| PDFKit              | PDF ticket generation                |
| qrcode              | QR code generation                   |
| Swagger/OpenAPI     | API documentation                    |

### DevOps

| Tool            | Purpose                               |
|-----------------|---------------------------------------|
| Docker          | Containerization                      |
| Docker Compose  | Local multi-service orchestration     |
| GitHub Actions  | CI/CD pipeline                        |
| Vercel          | Frontend deployment                   |
| Railway         | Backend and database deployment       |

---

## Features

### Core Features

- JWT authentication with role-based access control
- Four user roles: Guest, Customer, Agent, Admin
- Bus schedule search by route, date, and availability
- Interactive seat map with real-time availability
- Automatic seat assignment
- PDF ticket generation with embedded QR codes
- Booking cancellation with time-based rules
- Email confirmation for bookings and cancellations
- Booking history per customer
- QR code verification for agents at boarding

### Admin Features

- Dashboard with analytics and charts
- Manage buses, routes, schedules, users, and agents
- View all bookings and revenue reports
- Export reports as PDF, Excel, or CSV
- Audit logs for all system actions

### Professional Features

- Dark mode and light mode
- Fully responsive design
- Toast notifications
- Skeleton loading states
- Pagination, search, sorting, and filtering
- Swagger/OpenAPI documentation
- Docker support for local development
- GitHub Actions CI/CD pipeline
- Production deployment on Vercel and Railway

---

## User Roles

| Role     | Permissions                                                                                  |
|----------|----------------------------------------------------------------------------------------------|
| Guest    | Search routes and view schedules without an account                                          |
| Customer | Register, login, book tickets, cancel bookings, download PDF tickets, view booking history   |
| Agent    | Verify QR codes, check in passengers, view today's trips, assist customers                   |
| Admin    | Full system access: manage buses, routes, schedules, users, agents, bookings, reports, logs  |

---

## Business Rules

1. Payment must be completed at least **1 hour before departure**.
2. Cancellations are only allowed if at least **3 hours remain before departure**.
3. Seats cannot be double-booked.
4. Every ticket number is unique and system-generated.
5. Every QR code is unique per ticket.
6. Agents cannot access admin features.
7. Customers can only access their own bookings.
8. Schedules cannot exceed the bus seating capacity.
9. No office visit is required to book or cancel a ticket.

---

## Project Structure

```
rwanda-bus-ticketing-system/
├── client/                          # React frontend
│   ├── public/
│   └── src/
│       ├── assets/                  # Images, icons, fonts
│       ├── components/              # Reusable UI components
│       │   ├── ui/                  # shadcn/ui base components
│       │   ├── layout/              # Header, Footer, Sidebar
│       │   ├── booking/             # Booking flow components
│       │   ├── seat/                # Seat map components
│       │   └── charts/              # Dashboard chart components
│       ├── contexts/                # React context providers
│       ├── hooks/                   # Custom React hooks
│       ├── layouts/                 # Page layout wrappers
│       ├── pages/                   # Route-level page components
│       │   ├── public/              # Home, Search, Login, Register
│       │   ├── customer/            # Customer dashboard pages
│       │   ├── agent/               # Agent dashboard pages
│       │   └── admin/               # Admin dashboard pages
│       ├── routes/                  # React Router configuration
│       ├── services/                # Axios API service functions
│       ├── types/                   # TypeScript type definitions
│       └── utils/                   # Helper functions
│
├── server/                          # Express backend
│   └── src/
│       ├── config/                  # App configuration and env
│       ├── controllers/             # Route handler functions
│       ├── middlewares/             # Auth, error, validation middleware
│       ├── prisma/                  # Prisma schema and migrations
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── routes/                  # Express route definitions
│       ├── services/                # Business logic layer
│       ├── utils/                   # Helpers: PDF, QR, email, tokens
│       └── validators/              # Zod validation schemas
│
├── docs/                            # Project documentation
│   ├── api/                         # OpenAPI/Swagger spec
│   ├── database/                    # ERD and schema diagrams
│   ├── architecture/                # Architecture diagrams
│   └── postman/                     # Postman collection
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI pipeline
│       └── deploy.yml               # CD pipeline
│
├── docker-compose.yml               # Local development services
├── .env.example                     # Environment variable template
├── .gitignore
├── LICENSE
└── README.md
```

---

## Database Schema

### Tables

| Table               | Description                                        |
|---------------------|----------------------------------------------------|
| users               | All system users (customers, agents, admins)       |
| roles               | Role definitions and permissions                   |
| buses               | Bus fleet with capacity and details                |
| routes              | Named routes (e.g. Nyanza–Kigali)                  |
| route_stops         | Ordered stops along each route                     |
| schedules           | Departure times and dates per route and bus        |
| seats               | Individual seats per bus                           |
| bookings            | Customer ticket reservations                       |
| booking_passengers  | Passenger details per booking (future support)     |
| payments            | Simulated payment records                          |
| cancellations       | Cancellation records with timestamps               |
| audit_logs          | System-wide action audit trail                     |

### Entity Relationships

```
User ──< Booking >── Schedule ──< Seat
                         │
                       Route ──< RouteStop
                         │
                        Bus ──< Seat
```

---

## API Endpoints

Full interactive documentation is available at `/docs` (Swagger UI) when the server is running.

### Authentication

```
POST   /api/auth/register       Register a new customer account
POST   /api/auth/login          Login and receive JWT token
POST   /api/auth/logout         Invalidate session
GET    /api/auth/profile        Get authenticated user profile
PUT    /api/auth/profile        Update profile
POST   /api/auth/refresh        Refresh JWT token
```

### Users (Admin)

```
GET    /api/users               List all users
GET    /api/users/:id           Get user by ID
PUT    /api/users/:id           Update user
DELETE /api/users/:id           Delete user
```

### Buses (Admin)

```
GET    /api/buses               List all buses
POST   /api/buses               Create a bus
PUT    /api/buses/:id           Update a bus
DELETE /api/buses/:id           Delete a bus
```

### Routes

```
GET    /api/routes              List all routes
POST   /api/routes              Create a route (Admin)
PUT    /api/routes/:id          Update a route (Admin)
DELETE /api/routes/:id          Delete a route (Admin)
```

### Schedules

```
GET    /api/schedules           Search schedules (public)
POST   /api/schedules           Create a schedule (Admin/Agent)
PUT    /api/schedules/:id       Update a schedule (Admin/Agent)
DELETE /api/schedules/:id       Delete a schedule (Admin)
```

### Seats

```
GET    /api/seats/:scheduleId   Get seat availability for a schedule
```

### Bookings

```
POST   /api/bookings                    Create a booking (Customer)
GET    /api/bookings                    List bookings (Customer: own, Admin: all)
GET    /api/bookings/:id                Get booking details
DELETE /api/bookings/:id                Cancel a booking
GET    /api/bookings/:id/ticket         Download PDF ticket
```

### Verification (Agent)

```
POST   /api/verify              Verify a QR code at boarding
```

### Reports (Admin)

```
GET    /api/reports             Get report data (daily/weekly/monthly/yearly)
GET    /api/reports/export      Export report as PDF, Excel, or CSV
```

### Audit Logs (Admin)

```
GET    /api/audit-logs          List audit log entries
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose
- Git

### Clone the Repository

```bash
git clone https://github.com/your-username/rwanda-bus-ticketing-system.git
cd rwanda-bus-ticketing-system
```

### Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local values. See [Environment Variables](#environment-variables).

### Start with Docker Compose (Recommended)

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port `5432`
- Express API on port `5000`
- React frontend on port `3000`

### Manual Setup (without Docker)

**Backend:**

```bash
cd server
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

### Server (`server/.env`)

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/rwanda_bus_db

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Docker Setup

```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down

# Reset database volumes
docker-compose down -v
```

| Service  | Port | Description           |
|----------|------|-----------------------|
| postgres | 5432 | PostgreSQL database   |
| api      | 5000 | Express backend       |
| client   | 3000 | React frontend (Vite) |

---

## Running Tests

### Backend

```bash
cd server
npm run test
```

### Frontend

```bash
cd client
npm run test
```

### API Testing

Import `docs/postman/rwanda-bus-api.json` into Postman for manual API testing.

---

## Deployment

### Frontend — Vercel

1. Connect your GitHub repository to Vercel.
2. Set the root directory to `client`.
3. Add environment variables in the Vercel dashboard.
4. Vercel auto-deploys on every push to `main`.

### Backend and Database — Railway

1. Create a new Railway project.
2. Add a PostgreSQL plugin.
3. Deploy the `server` directory as a service.
4. Set all environment variables in the Railway dashboard.
5. Set `DATABASE_URL` to the Railway PostgreSQL connection string.

### CI/CD — GitHub Actions

- `ci.yml` runs on every pull request: lint, type check, tests, build.
- `deploy.yml` runs on push to `main`: deploys frontend to Vercel and backend to Railway.

---

## Git Workflow

### Branches

| Branch               | Purpose                             |
|----------------------|-------------------------------------|
| `main`               | Stable production branch            |
| `develop`            | Integration branch for all features |
| `feature/auth`       | Authentication                      |
| `feature/booking`    | Booking workflow                    |
| `feature/seats`      | Seat management                     |
| `feature/reports`    | Reports and analytics               |
| `feature/pdf-ticket` | PDF ticket generation               |
| `feature/qr-code`    | QR code verification                |
| `feature/dashboard`  | Admin and customer dashboards       |

### Flow

```
feature branch → Pull Request → Code Review → develop → Testing → main → Auto Deploy
```

### Commit Convention

```
feat: implement JWT authentication
feat: add seat reservation workflow
feat: generate PDF tickets with QR codes
fix: prevent duplicate seat booking
fix: correct cancellation time validation
docs: update API documentation
refactor: improve booking service logic
test: add booking API tests
chore: update dependencies
```

---

## Project Milestones

| Milestone         | Scope                                                  |
|-------------------|--------------------------------------------------------|
| 1 — Foundation    | Project setup, Docker, Prisma schema, Authentication   |
| 2 — Core Data     | Routes, buses, schedules management                    |
| 3 — Booking       | Booking flow, seat assignment, cancellation            |
| 4 — Tickets       | PDF generation, QR codes, email notifications          |
| 5 — Analytics     | Reports, dashboards, charts                            |
| 6 — Production    | Testing, CI/CD, deployment, documentation              |

---

## Team

| Member        | Role                                                                  |
|---------------|-----------------------------------------------------------------------|
| Samuel Bondo  | System architecture, backend API, database design, auth, deployment   |
| Prince Karn   | React frontend, UI/UX, seat map, dashboards, responsive design        |
| Timothy Keita | Reports, PDF tickets, QR codes, testing, documentation                |

Samuel reviews and merges all Pull Requests to maintain code quality and consistency.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
