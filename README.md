# CineForum 🎬

A modern web application for managing and discussing TV series, seasons, and episodes. Built with Next.js 15, TypeScript, Supabase, and featuring JWT-based authentication.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Development](#development)

## ✨ Features

### Core Features

- **User Authentication**: Register and login with email/password using Supabase
- **Series Management**: Create, read, update, and delete TV series
- **Season Management**: Organize episodes into seasons
- **Episode Management**: Manage individual episodes with details
- **Comments System**: Users can leave comments on content
- **JWT Tokens**: Secure API access with JWT authentication
- **API Documentation**: Interactive Swagger UI for API exploration
- **Responsive Design**: Modern, responsive user interface

### Security

- Email/password authentication via Supabase
- JWT token generation and validation
- Protected routes and API endpoints
- Session management with automatic refresh

## Tech Stack

### Frontend

- **Next.js 15.5.4** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.6.2** - Type-safe JavaScript
- **CSS Modules** - Scoped styling

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - PostgreSQL database and authentication

### Development & Documentation

- **Swagger UI** - Interactive API documentation
- **Zod 4.1.12** - Schema validation
- **next-openapi-gen** - OpenAPI spec generation

## Project Structure

```
CineForum-1/
├── app/
│   ├── _lib/
│   │   └── supabase.ts              # Supabase client & auth functions
│   ├── api/
│   │   ├── _lib/
│   │   │   └── supabase.ts          # Server-side Supabase client
│   │   ├── comments/                # Comments API endpoints
│   │   ├── episodes/                # Episodes API endpoints
│   │   ├── seasons/                 # Seasons API endpoints
│   │   └── series/                  # Series API endpoints
│   ├── auth/
│   │   ├── page.tsx                 # Login/Register page
│   │   └── auth.module.css          # Auth styling
│   ├── home/
│   │   ├── page.tsx                 # Home page (displays JWT token)
│   │   └── home.module.css          # Home styling
│   ├── api-docs/
│   │   └── page.tsx                 # API documentation page
│   ├── types/
│   │   └── swagger-ui-react.d.ts    # TypeScript declarations
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Root page (redirects to auth)
│   └── schemas.ts                   # Data schemas
├── public/
│   ├── openapi.json                 # OpenAPI specification
│   └── API Documentation/           # Bruno API collection
├── packages/
│   └── api/                         # Shared API utilities
├── .env.local                       # Environment variables
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## Getting Started

### Prerequisites

- **Node.js 18+** and **npm** or **yarn**
- **Git** for version control
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- A code editor (VS Code recommended)

### Clone the Repository

```bash
git clone https://github.com/BenBul/CineForum.git
cd CineForum-1
```

### Install Dependencies

```bash
npm install
```

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **API Keys**
4. Copy your **Project URL** and **Anon Key**

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup (Optional)

If you need to set up the database schema, you can use the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Create tables for `series`, `seasons`, `episodes`, `comments`, and `auth`

## Running the Project

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Generate OpenAPI Specification

```bash
npm run openapi
```

## API Documentation

### Interactive API Docs

Once the server is running, visit:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/openapi.json`

### API Endpoints

#### Series

- `GET /api/series` - List all series
- `POST /api/series` - Create a new series
- `GET /api/series/[id]` - Get series by ID
- `PUT /api/series/[id]` - Update series
- `DELETE /api/series/[id]` - Delete series

#### Seasons

- `GET /api/seasons` - List all seasons
- `POST /api/seasons` - Create a new season
- `GET /api/seasons/[id]` - Get season by ID
- `PUT /api/seasons/[id]` - Update season
- `DELETE /api/seasons/[id]` - Delete season
- `GET /api/series/[id]/seasons` - Get seasons for a series

#### Episodes

- `GET /api/episodes` - List all episodes
- `POST /api/episodes` - Create a new episode
- `GET /api/episodes/[id]` - Get episode by ID
- `PUT /api/episodes/[id]` - Update episode
- `DELETE /api/episodes/[id]` - Delete episode
- `GET /api/seasons/[id]/episodes` - Get episodes for a season

#### Comments

- `GET /api/comments` - List all comments
- `POST /api/comments` - Create a new comment
- `GET /api/comments/[id]` - Get comment by ID
- `PUT /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

## Authentication Flow

### Registration

1. User navigates to `/auth`
2. Fills in email and password
3. Clicks "Register"
4. User created in Supabase Auth
5. Confirmation email sent (if configured)

### Login

1. User navigates to `/auth`
2. Fills in email and password
3. Clicks "Login"
4. JWT token generated
5. User redirected to `/home` page

### Protected Pages

- `/home` - Shows user email and JWT token
- Automatic redirect to `/auth` if not authenticated

### JWT Token

- Displayed on the home page
- Used for API authentication
- Automatically refreshed by Supabase
- Can be copied to clipboard from the home page

## 🗄 Database Schema

### Users (Managed by Supabase Auth)

- `id` - UUID
- `email` - User email
- `password_hash` - Encrypted password
- `created_at` - Timestamp

### Series

- `id` - Primary key
- `title` - Series title
- `description` - Series description
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### Seasons

- `id` - Primary key
- `series_id` - Foreign key to series
- `season_number` - Season number
- `title` - Season title
- `created_at` - Creation timestamp

### Episodes

- `id` - Primary key
- `season_id` - Foreign key to seasons
- `episode_number` - Episode number
- `title` - Episode title
- `description` - Episode description
- `created_at` - Creation timestamp

### Comments

- `id` - Primary key
- `user_id` - Foreign key to users
- `content_type` - Type (series/season/episode)
- `content_id` - ID of the content
- `text` - Comment text
- `created_at` - Creation timestamp

## Development

### Code Style

- TypeScript for type safety
- CSS Modules for scoped styling

### Project Structure Best Practices

- API routes are grouped by resource (series, seasons, episodes, comments)
- Dynamic routes use `[id]` naming convention
- Client components marked with `'use client'`
- Server-side Supabase client in `api/_lib`
- Client-side Supabase client in `_lib`

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [API Bruno Collection](./public/API%20Documentation/)

---

**Last Updated**: November 10, 2025  
**Author**: BenBul  
**Repository**: [GitHub - CineForum](https://github.com/BenBul/CineForum)
