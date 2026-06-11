# Coast Canopies Configurator

Production-ready MERN configurator for Coast Canopies with:

- Public vehicle canopy builder with live layered SVG preview
- Live price engine for vehicle, canopy, modules, and accessories
- Quote request flow stored in MongoDB
- Admin-only JWT authentication
- Admin dashboards for vehicles, products, and quotes

## Stack

- MongoDB
- Express.js
- React + Vite
- Node.js
- Tailwind CSS

## Structure

```text
.
|-- client
|-- server
|-- package.json
`-- README.md
```

## Environment Setup

Create these files before running the project:

- `server/.env`
- `client/.env` (optional if using Vite proxy)

Use the included examples:

```bash
Copy `server/.env.example` to `server/.env`
Copy `client/.env.example` to `client/.env`
```

Required backend values:

- `MONGODB_URI`
- `JWT_SECRET`

Important defaults:

- Admin login route: `/admin/login`
- Default admin email: `admin@coastcanopies.com`
- Default admin password: `admin@1212`

## Install

```bash
npm install
```

## Seed Default Data

This creates the admin account, four vehicles, and the default canopy/module/accessory catalog.

```bash
npm run seed
```

## Run

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Overview

Public routes:

- `GET /api/vehicles`
- `GET /api/products`
- `POST /api/quotes`

Admin routes:

- `POST /api/admin/login`
- `POST /api/admin/vehicles`
- `PUT /api/admin/vehicles/:id`
- `DELETE /api/admin/vehicles/:id`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/quotes`
- `PATCH /api/admin/quotes/:id/status`

## Notes

- Product placement is driven by `positions[]` with per-vehicle `x`, `y`, `width`, and `height`.
- Quote emails are optional. Configure SMTP variables in `server/.env` to enable notifications.
- Static SVG assets live in `client/public/assets`.
