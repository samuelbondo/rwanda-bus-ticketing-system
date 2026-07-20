# Contributing Guide

## Welcome

Thank you for contributing to the Rwanda Bus Ticketing System. This guide explains
the workflow, standards, and conventions all team members must follow.

---

## Team Responsibilities

| Member        | Responsibility                                                        |
|---------------|-----------------------------------------------------------------------|
| Samuel Bondo  | System architecture, backend API, database design, auth, deployment   |
| Prince Karn   | React frontend, UI/UX, seat map, dashboards, responsive design        |
| Timothy Keita | Reports, PDF tickets, QR codes, testing, documentation                |

Samuel reviews and merges all Pull Requests.

---

## Git Workflow

### Branch Strategy

```
main        → stable production branch (protected)
develop     → integration branch for all features

feature/auth
feature/users
feature/routes
feature/buses
feature/schedules
feature/booking
feature/seats
feature/reports
feature/pdf-ticket
feature/qr-code
feature/dashboard
```

### Flow

```
feature branch
      ↓
Pull Request → develop
      ↓
Code Review (Samuel)
      ↓
Merge to develop
      ↓
Testing on develop
      ↓
Merge to main
      ↓
Automatic Deployment
```

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Submitting a Pull Request

1. Push your branch to GitHub.
2. Open a Pull Request targeting `develop`.
3. Fill in the PR description with what was changed and why.
4. Request a review from Samuel Bondo.
5. Address all review comments before merging.

---

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>
```

### Types

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `refactor` | Code change that is not a fix or feature         |
| `test`     | Adding or updating tests                         |
| `chore`    | Build process, dependency updates, config        |
| `style`    | Formatting, missing semicolons (no logic change) |

### Examples

```
feat: implement JWT authentication
feat: add seat reservation workflow
feat: generate PDF tickets with QR codes
fix: prevent duplicate seat booking
fix: correct cancellation time validation
docs: update API documentation
refactor: improve booking service logic
test: add booking API integration tests
chore: update dependencies
```

---

## Code Standards

### TypeScript

- Enable strict mode in all `tsconfig.json` files.
- No use of `any` type. Use `unknown` and narrow types properly.
- Define all API response types in `client/src/types/` and `server/src/types/`.

### Formatting

- Prettier is configured at the root. Run before committing:

```bash
npm run format
```

### Linting

- ESLint is configured for both client and server. Run:

```bash
npm run lint
```

### Naming Conventions

| Context           | Convention       | Example                  |
|-------------------|------------------|--------------------------|
| Files (React)     | PascalCase       | `BookingCard.tsx`        |
| Files (server)    | camelCase        | `bookingService.ts`      |
| Components        | PascalCase       | `SeatMap`                |
| Functions         | camelCase        | `createBooking`          |
| Constants         | UPPER_SNAKE_CASE | `MAX_SEATS_PER_BOOKING`  |
| Database columns  | snake_case       | `departure_time`         |
| API routes        | kebab-case       | `/api/booking-history`   |

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

## GitHub Issues

Use the following labels when creating issues:

| Label           | Purpose                              |
|-----------------|--------------------------------------|
| `bug`           | Something is broken                  |
| `enhancement`   | New feature or improvement           |
| `frontend`      | Relates to the React client          |
| `backend`       | Relates to the Express server        |
| `database`      | Relates to Prisma or PostgreSQL      |
| `documentation` | Docs, README, comments               |
| `testing`       | Tests and QA                         |
| `security`      | Security-related issue               |
| `priority-high` | Must be resolved immediately         |
| `priority-medium` | Should be resolved this milestone  |
| `priority-low`  | Nice to have                         |

---

## Local Development Setup

See [README.md](../README.md#getting-started) for full setup instructions.

Quick start:

```bash
git clone https://github.com/your-username/rwanda-bus-ticketing-system.git
cd rwanda-bus-ticketing-system
cp .env.example .env
docker-compose up --build
```

---

## Questions

If you are unsure about anything, open a GitHub Discussion or message Samuel directly
before making changes to shared files like `schema.prisma`, `docker-compose.yml`,
or any middleware.
