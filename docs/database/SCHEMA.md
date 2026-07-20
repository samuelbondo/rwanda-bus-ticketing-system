# Database Schema

## Overview

The Rwanda Bus Ticketing System uses PostgreSQL managed through Prisma ORM.
The schema is designed so that adding new routes, buses, or operators requires
no structural changes.

---

## Entity Relationship Diagram

```
┌─────────┐       ┌──────────┐       ┌───────────┐
│  users  │──────<│ bookings │>──────│ schedules │
└─────────┘       └──────────┘       └───────────┘
                       │                    │
                       │              ┌─────┴──────┐
                  ┌────▼────┐         │            │
                  │payments │      ┌──────┐    ┌───────┐
                  └─────────┘      │routes│    │ buses │
                       │           └──────┘    └───────┘
                  ┌────▼──────┐       │            │
                  │cancellat- │  ┌────▼──────┐ ┌──▼────┐
                  │  ions     │  │route_stops│ │ seats │
                  └───────────┘  └───────────┘ └───────┘

┌────────────┐
│ audit_logs │
└────────────┘
```

---

## Tables

### users

Stores all system users regardless of role.

| Column       | Type      | Constraints              | Description                        |
|--------------|-----------|--------------------------|------------------------------------|
| id           | UUID      | PK, default uuid()       | Unique user identifier             |
| name         | VARCHAR   | NOT NULL                 | Full name                          |
| email        | VARCHAR   | NOT NULL, UNIQUE         | Login email                        |
| password     | VARCHAR   | NOT NULL                 | bcrypt hashed password             |
| role         | ENUM      | NOT NULL, default CUSTOMER | GUEST, CUSTOMER, AGENT, ADMIN    |
| phone        | VARCHAR   | NULLABLE                 | Contact phone number               |
| is_active    | BOOLEAN   | NOT NULL, default true   | Account active status              |
| created_at   | TIMESTAMP | NOT NULL, default now()  | Account creation timestamp         |
| updated_at   | TIMESTAMP | NOT NULL                 | Last update timestamp              |

---

### buses

Represents the physical bus fleet.

| Column       | Type      | Constraints             | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PK                      | Unique bus identifier              |
| name         | VARCHAR   | NOT NULL                | Bus name or label                  |
| plate_number | VARCHAR   | NOT NULL, UNIQUE        | Vehicle registration plate         |
| capacity     | INTEGER   | NOT NULL                | Total number of seats              |
| is_active    | BOOLEAN   | NOT NULL, default true  | Bus operational status             |
| created_at   | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |
| updated_at   | TIMESTAMP | NOT NULL                | Last update timestamp              |

---

### routes

Named travel routes. Designed to support multiple routes beyond the initial one.

| Column       | Type      | Constraints             | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PK                      | Unique route identifier            |
| name         | VARCHAR   | NOT NULL                | Route name (e.g. Nyanza–Kigali)    |
| origin       | VARCHAR   | NOT NULL                | Starting location                  |
| destination  | VARCHAR   | NOT NULL                | Ending location                    |
| distance_km  | DECIMAL   | NULLABLE                | Route distance in kilometres       |
| base_price   | DECIMAL   | NOT NULL                | Base ticket price (RWF)            |
| is_active    | BOOLEAN   | NOT NULL, default true  | Route operational status           |
| created_at   | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |
| updated_at   | TIMESTAMP | NOT NULL                | Last update timestamp              |

---

### route_stops

Ordered intermediate stops along a route.

| Column       | Type      | Constraints             | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PK                      | Unique stop identifier             |
| route_id     | UUID      | FK → routes.id          | Parent route                       |
| name         | VARCHAR   | NOT NULL                | Stop location name                 |
| stop_order   | INTEGER   | NOT NULL                | Position in the route sequence     |
| price_from_origin | DECIMAL | NOT NULL             | Price from origin to this stop     |
| created_at   | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |

---

### schedules

Specific departure instances for a route on a bus.

| Column          | Type      | Constraints             | Description                        |
|-----------------|-----------|-------------------------|------------------------------------|
| id              | UUID      | PK                      | Unique schedule identifier         |
| route_id        | UUID      | FK → routes.id          | Associated route                   |
| bus_id          | UUID      | FK → buses.id           | Assigned bus                       |
| departure_time  | TIMESTAMP | NOT NULL                | Scheduled departure date and time  |
| arrival_time    | TIMESTAMP | NULLABLE                | Estimated arrival time             |
| price           | DECIMAL   | NOT NULL                | Ticket price for this schedule     |
| status          | ENUM      | NOT NULL, default SCHEDULED | SCHEDULED, DEPARTED, COMPLETED, CANCELLED |
| available_seats | INTEGER   | NOT NULL                | Remaining bookable seats           |
| created_at      | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |
| updated_at      | TIMESTAMP | NOT NULL                | Last update timestamp              |

---

### seats

Individual seat records per bus.

| Column       | Type      | Constraints             | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PK                      | Unique seat identifier             |
| bus_id       | UUID      | FK → buses.id           | Parent bus                         |
| seat_number  | VARCHAR   | NOT NULL                | Seat label (e.g. A1, B3)           |
| is_available | BOOLEAN   | NOT NULL, default true  | Availability per schedule          |
| created_at   | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |

---

### bookings

Customer ticket reservations.

| Column          | Type      | Constraints             | Description                        |
|-----------------|-----------|-------------------------|------------------------------------|
| id              | UUID      | PK                      | Unique booking identifier          |
| user_id         | UUID      | FK → users.id           | Customer who made the booking      |
| schedule_id     | UUID      | FK → schedules.id       | Booked schedule                    |
| seat_id         | UUID      | FK → seats.id           | Assigned seat                      |
| ticket_number   | VARCHAR   | NOT NULL, UNIQUE        | System-generated unique ticket ID  |
| qr_code         | TEXT      | NOT NULL                | QR code data string                |
| source          | VARCHAR   | NOT NULL                | Passenger boarding stop            |
| destination     | VARCHAR   | NOT NULL                | Passenger alighting stop           |
| status          | ENUM      | NOT NULL, default PENDING | PENDING, CONFIRMED, CANCELLED, USED |
| total_price     | DECIMAL   | NOT NULL                | Final price paid                   |
| booked_at       | TIMESTAMP | NOT NULL, default now() | Booking creation timestamp         |
| updated_at      | TIMESTAMP | NOT NULL                | Last update timestamp              |

---

### payments

Simulated payment records linked to bookings.

| Column          | Type      | Constraints             | Description                        |
|-----------------|-----------|-------------------------|------------------------------------|
| id              | UUID      | PK                      | Unique payment identifier          |
| booking_id      | UUID      | FK → bookings.id, UNIQUE| Associated booking                 |
| amount          | DECIMAL   | NOT NULL                | Amount paid (RWF)                  |
| method          | ENUM      | NOT NULL                | MOMO, CARD, CASH                   |
| status          | ENUM      | NOT NULL, default PENDING | PENDING, COMPLETED, FAILED, REFUNDED |
| paid_at         | TIMESTAMP | NULLABLE                | Payment completion timestamp       |
| created_at      | TIMESTAMP | NOT NULL, default now() | Record creation timestamp          |

---

### cancellations

Records of cancelled bookings with reason and timestamp.

| Column          | Type      | Constraints             | Description                        |
|-----------------|-----------|-------------------------|------------------------------------|
| id              | UUID      | PK                      | Unique cancellation identifier     |
| booking_id      | UUID      | FK → bookings.id, UNIQUE| Cancelled booking                  |
| cancelled_by    | UUID      | FK → users.id           | User who initiated cancellation    |
| reason          | TEXT      | NULLABLE                | Optional cancellation reason       |
| cancelled_at    | TIMESTAMP | NOT NULL, default now() | Cancellation timestamp             |

---

### audit_logs

Immutable log of all significant system actions.

| Column       | Type      | Constraints             | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PK                      | Unique log entry identifier        |
| user_id      | UUID      | FK → users.id, NULLABLE | User who performed the action      |
| action       | VARCHAR   | NOT NULL                | Action name (e.g. BOOKING_CREATED) |
| entity       | VARCHAR   | NOT NULL                | Affected entity (e.g. bookings)    |
| entity_id    | UUID      | NULLABLE                | ID of the affected record          |
| details      | JSONB     | NULLABLE                | Additional context as JSON         |
| ip_address   | VARCHAR   | NULLABLE                | Request IP address                 |
| created_at   | TIMESTAMP | NOT NULL, default now() | Log entry timestamp                |

---

## Enums

```
Role:            GUEST | CUSTOMER | AGENT | ADMIN
ScheduleStatus:  SCHEDULED | DEPARTED | COMPLETED | CANCELLED
BookingStatus:   PENDING | CONFIRMED | CANCELLED | USED
PaymentStatus:   PENDING | COMPLETED | FAILED | REFUNDED
PaymentMethod:   MOMO | CARD | CASH
```

---

## Key Constraints and Rules

- A seat cannot be booked twice for the same schedule (enforced at application and DB level).
- A booking ticket_number is unique across the entire system.
- Cancellations are only created when a booking transitions to CANCELLED status.
- Audit logs are append-only and never updated or deleted.
- Schedules track available_seats as a denormalized counter for fast availability queries.
