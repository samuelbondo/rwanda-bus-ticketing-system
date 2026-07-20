# System Architecture

## Overview

The Rwanda Bus Ticketing System follows a three-tier client-server architecture with clear
separation between the presentation layer, application layer, and data layer.

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│          React 19 + TypeScript + Vite + Tailwind         │
│                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │ Customer │    │  Agent   │    │  Admin   │          │
│   │Dashboard │    │Dashboard │    │Dashboard │          │
│   └──────────┘    └──────────┘    └──────────┘          │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS / REST API
                          │ JWT Bearer Token
┌─────────────────────────▼────────────────────────────────┐
│                   APPLICATION LAYER                      │
│             Node.js + Express + TypeScript               │
│                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │   Auth   │    │ Booking  │    │ Reports  │          │
│   │ Service  │    │ Service  │    │ Service  │          │
│   └──────────┘    └──────────┘    └──────────┘          │
│                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │  Ticket  │    │   QR     │    │  Email   │          │
│   │  (PDF)   │    │  Code    │    │  (SMTP)  │          │
│   └──────────┘    └──────────┘    └──────────┘          │
└─────────────────────────┬────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼────────────────────────────────┐
│                      DATA LAYER                          │
│                  PostgreSQL Database                     │
└──────────────────────────────────────────────────────────┘
```

---

## Request Lifecycle

```
Browser Request
      │
      ▼
React Router (client-side routing)
      │
      ▼
Axios HTTP Client
      │
      ▼
Express Router
      │
      ▼
Auth Middleware (JWT verification)
      │
      ▼
Role Middleware (RBAC check)
      │
      ▼
Zod Validator (request body/params)
      │
      ▼
Controller
      │
      ▼
Service (business logic)
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
      │
      ▼
JSON Response
```

---

## Authentication Flow

```
User submits login form
        │
        ▼
POST /api/auth/login
        │
        ▼
Validate credentials (bcrypt compare)
        │
        ▼
Generate JWT access token  (7d)
Generate JWT refresh token (30d)
        │
        ▼
Return tokens to client
        │
        ▼
Client stores token in memory / httpOnly cookie
        │
        ▼
All subsequent requests include:
  Authorization: Bearer <token>
        │
        ▼
Auth middleware verifies token on every protected route
```

---

## Booking Flow

```
Customer searches schedules
        │
        ▼
Select route, date, source, destination
        │
        ▼
View available seats (seat map)
        │
        ▼
Select number of seats
        │
        ▼
POST /api/bookings
        │
        ▼
Server validates:
  - Seat availability (no double booking)
  - Schedule exists and is active
  - Departure is in the future
  - Payment deadline not passed (1 hour rule)
        │
        ▼
Create booking record
Assign seats
Create payment record (simulated)
        │
        ▼
Generate unique ticket number
Generate QR code
Generate PDF ticket
        │
        ▼
Send confirmation email with PDF attachment
        │
        ▼
Return booking confirmation to client
```

---

## Cancellation Flow

```
Customer requests cancellation
        │
        ▼
DELETE /api/bookings/:id
        │
        ▼
Server checks:
  - Booking belongs to requesting user
  - At least 3 hours remain before departure
        │
        ├── Valid:
        │     Mark booking as CANCELLED
        │     Create cancellation record
        │     Release seats back to available
        │     Send cancellation confirmation email
        │
        └── Invalid:
              Return 400 error with reason
```

---

## Role-Based Access Control

```
Request arrives with JWT
        │
        ▼
Decode token → extract role
        │
        ├── GUEST    → public routes only (search, view schedules)
        │
        ├── CUSTOMER → own bookings, ticket download, profile
        │
        ├── AGENT    → QR verification, check-in, schedule view
        │
        └── ADMIN    → full system access
```

---

## PDF Ticket Generation

```
Booking confirmed
      │
      ▼
PDFKit creates ticket document
      │
      ├── Passenger name
      ├── Ticket number (unique, system-generated)
      ├── Route (source → destination)
      ├── Bus name and plate number
      ├── Seat number
      ├── Departure date and time
      └── QR code image (embedded)
            │
            ▼
      qrcode library generates QR
      QR encodes: ticketNumber + bookingId
            │
            ▼
      PDF sent as email attachment
      PDF available for download via API
```

---

## Deployment Architecture

```
Developer Machine
      │
      ▼
Git Push → GitHub
      │
      ├── Pull Request → GitHub Actions CI
      │         │
      │         ▼
      │    Lint + Type Check + Tests + Build
      │
      └── Merge to main → GitHub Actions CD
                │
                ├── Vercel (Frontend)
                │     React build deployed globally via CDN
                │
                └── Railway (Backend + Database)
                      Express API deployed as container
                      PostgreSQL managed database
```

---

## Local Development Architecture

```
Docker Compose
      │
      ├── postgres  (port 5432)
      │
      ├── api       (port 5000)
      │     └── connects to postgres via DATABASE_URL
      │
      └── client    (port 3000)
            └── proxies /api requests → api:5000
```
