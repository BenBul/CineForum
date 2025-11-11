# CineForum - TV Series Review Platform 🎬

CineForum is a modern web application where users can discover, rate, and review their favorite TV series. Built with Next.js, TypeScript, and Supabase, it features role-based authentication and a beautiful, responsive user interface.

![CineForum Banner](https://images.unsplash.com/photo-1574267432644-f61f7af7798f?w=1200&h=400&fit=crop)

## 🎯 Project Overview

CineForum allows users to:
- **Browse** TV series with an elegant, responsive grid layout
- **Create** series, seasons, and episodes
- **Review & Rate** shows from 1 to 5 stars
- **Comment** on series to share thoughts with the community
- **Search** for series in real-time
- **Manage** content with role-based permissions (Guest, User, Admin)

## ✨ Features

### UI/UX Requirements ✅

- ✅ **Responsive Layout** - Breakpoint at 768px for mobile/desktop
- ✅ **Responsive Images** - `max-width` rule for adaptive images
- ✅ **Distinct Sections** - Header, Content, Footer with unique styling
- ✅ **Input Forms** - Multiple input types (text, url, textarea, rating selector)
- ✅ **Transitions & Animations** - Smooth hover effects, modals, page transitions
- ✅ **Responsive Menu** - Desktop: horizontal nav, Mobile: hamburger menu
- ✅ **Vector Icons** - Font Awesome icons throughout
- ✅ **Custom Fonts** - Google Fonts (Poppins & Roboto)
- ✅ **Modal Dialogs** - For adding reviews, seasons, episodes
- ✅ **Color Scheme** - Coordinated purple/pink gradient theme
- ✅ **Grid Layout** - Aligned elements following grid system
- ✅ **Accessibility** - Clear, visible, accessible UI elements
- ✅ **Consistent Forms** - Unified form design across app
- ✅ **Cohesive Design** - Unified visual language

### Technical Features

- **Authentication** - Supabase Auth with email/password
- **Authorization** - Role-based access control (Guest, User, Admin)
- **REST API** - Full CRUD operations for all resources
- **Real-time Search** - Client-side filtering
- **Responsive Design** - Mobile-first approach
- **TypeScript** - Full type safety
- **Modern Stack** - Next.js 15, React 19

## 🏗️ Architecture

### Database Schema

```
users
├── id (uuid, PK)
├── created_at (timestamp)
└── role (text) - "guest" | "user" | "admin"

series
├── id (int8, PK)
├── created_at (timestamp)
├── name (text)
├── image_url (text, nullable)
└── created_by (uuid, FK → users.id)

seasons
├── id (int8, PK)
├── created_at (timestamp)
├── name (text)
├── fk_series (int8, FK → series.id)
└── created_by (uuid, FK → users.id)

episodes
├── id (int8, PK)
├── created_at (timestamp)
├── name (text)
├── image_url (text, nullable)
├── fk_season (int8, FK → seasons.id)
└── created_by (uuid, FK → users.id)

comments
├── id (int8, PK)
├── created_at (timestamp)
├── text (text, nullable)
├── rating (int2, 1-5)
├── fk_series (int8, FK → series.id, nullable)
├── fk_season (int8, FK → seasons.id, nullable)
├── fk_episode (int8, FK → episodes.id, nullable)
└── fk_user (uuid, FK → users.id)
```

### Role-Based Permissions

| Action | Guest | User | Admin |
|--------|-------|------|-------|
| View series/seasons/episodes | ✅ | ✅ | ✅ |
| View comments | ✅ | ✅ | ✅ |
| Create series/seasons/episodes | ❌ | ✅ | ✅ |
| Create comments | ❌ | ✅ | ✅ |
| Edit own content | ❌ | ✅ | ✅ |
| Delete own content | ❌ | ✅ | ✅ |
| Edit any content | ❌ | ❌ | ✅ |
| Delete any content | ❌ | ❌ | ✅ |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BenBul/CineForum.git
   cd CineForum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up Supabase database**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Add created_by columns
   ALTER TABLE series ADD COLUMN created_by UUID REFERENCES auth.users(id);
   ALTER TABLE seasons ADD COLUMN created_by UUID REFERENCES auth.users(id);
   ALTER TABLE episodes ADD COLUMN created_by UUID REFERENCES auth.users(id);
   
   -- Ensure rating column exists
   ALTER TABLE comments ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Routes

### Public Routes
- `/` - Redirects to /series
- `/series` - Browse all TV series
- `/series/[id]` - View series details, seasons, episodes, and reviews
- `/auth` - Sign in / Sign up
- `/api-docs` - Swagger API documentation

### Protected Routes
- All POST/PUT/DELETE operations require authentication
- Admin routes (future): `/admin` - Content management dashboard

## 🎨 UI Components

### Layout Components
- **Header** - Responsive navigation with hamburger menu (mobile)
- **Footer** - Multi-column footer with links and social icons
- **Modal** - Reusable modal dialog for forms

### Feature Components
- **SeriesCard** - Card component for series grid
- **Rating Stars** - Interactive star rating (1-5)
- **Search Bar** - Real-time series filtering

### Form Inputs Used
- Text input (series name, season name, episode name)
- URL input (image URLs with validation)
- Textarea (comment text)
- Custom rating selector (star buttons)
- Submit buttons with loading states

## 🎯 Design System

### Color Palette
```css
--primary-color: #6366f1 (Indigo)
--primary-hover: #4f46e5
--secondary-color: #ec4899 (Pink)
--bg-primary: #0f172a (Dark blue)
--bg-card: #1e293b
--text-primary: #f1f5f9
--success: #10b981
--error: #ef4444
```

### Typography
- **Headings**: Poppins (600 weight)
- **Body**: Roboto (300-500 weight)
- **Base size**: 16px
- **Scale**: 0.875rem to 3rem

### Breakpoints
- Mobile: < 768px
- Tablet: 769px - 1024px
- Desktop: > 1024px

### Animations
- Fade in
- Slide down/up
- Scale in
- Hover transitions (150-300ms)

## 🔧 API Endpoints

### Series
- `GET /api/series` - List all series
- `POST /api/series` - Create series (auth required)
- `GET /api/series/[id]` - Get series by ID
- `PUT /api/series/[id]` - Update series (owner/admin)
- `DELETE /api/series/[id]` - Delete series (owner/admin)
- `GET /api/series/[id]/seasons` - List seasons for series

### Seasons
- `GET /api/seasons` - List all seasons
- `POST /api/seasons` - Create season (auth required)
- `GET /api/seasons/[id]` - Get season by ID
- `PUT /api/seasons/[id]` - Update season (owner/admin)
- `DELETE /api/seasons/[id]` - Delete season (owner/admin)
- `GET /api/seasons/[id]/episodes` - List episodes for season

### Episodes
- `GET /api/episodes` - List all episodes
- `POST /api/episodes` - Create episode (auth required)
- `GET /api/episodes/[id]` - Get episode by ID
- `PUT /api/episodes/[id]` - Update episode (owner/admin)
- `DELETE /api/episodes/[id]` - Delete episode (owner/admin)

### Comments
- `GET /api/comments?fk_series=[id]` - List comments (with filters)
- `POST /api/comments` - Create comment (auth required)
- `GET /api/comments/[id]` - Get comment by ID
- `PUT /api/comments/[id]` - Update comment (owner/admin)
- `DELETE /api/comments/[id]` - Delete comment (owner/admin)

All authenticated endpoints require:
```
Authorization: Bearer <supabase_jwt_token>
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Global CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins, Roboto)
- **Validation**: Zod
- **Image Optimization**: Next.js Image component

## 🖼️ Wireframes

### Desktop Layout
```
┌─────────────────────────────────────────────┐
│  Header (Logo | Series | Admin | API | User)│
├─────────────────────────────────────────────┤
│                                             │
│  Hero Title & Subtitle                      │
│  [Search Input]          [Add Series Btn]   │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Series│ │Series│ │Series│ │Series│       │
│  │Image │ │Image │ │Image │ │Image │       │
│  │★4.5  │ │★3.8  │ │★5.0  │ │★4.2  │       │
│  │Title │ │Title │ │Title │ │Title │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
├─────────────────────────────────────────────┤
│ Footer (About | Links | Features | Contact)│
└─────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────┐
│ Logo    [≡] │
├──────────────┤
│   Hero       │
│   [Search]   │
│ [Add Series] │
│              │
│  ┌────────┐  │
│  │ Series │  │
│  │ Image  │  │
│  │ ★ 4.5  │  │
│  │ Title  │  │
│  └────────┘  │
│              │
│  ┌────────┐  │
│  │ Series │  │
│  └────────┘  │
├──────────────┤
│   Footer     │
└──────────────┘
```

### Series Detail Page
```
┌───────────────────────────────────────┐
│ Header Navigation                     │
├───────────────────────────────────────┤
│ [← Back to Series]                    │
│                                       │
│ ┌────────┐  Series Title              │
│ │        │  ⭐⭐⭐⭐☆ 4.2/5 (15 reviews)│
│ │ Poster │  [Add Review]              │
│ │ Image  │                            │
│ └────────┘  Description text...       │
│                                       │
│ ┌─── Seasons & Episodes ───────────┐ │
│ │ Season 1                          │ │
│ │   Episode 1 - Title               │ │
│ │   Episode 2 - Title               │ │
│ │ Season 2                          │ │
│ │   Episode 1 - Title               │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌─── Reviews ──────────────────────┐ │
│ │ User123  ⭐⭐⭐⭐⭐                 │ │
│ │ "Great show!"                     │ │
│ │                                   │ │
│ │ AnotherUser  ⭐⭐⭐⭐☆             │ │
│ │ "Really enjoyed it"               │ │
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
```

## 📸 Screenshots

### Home Page (Series Grid)
- Responsive grid layout (4 columns desktop, 1 column mobile)
- Search bar with real-time filtering
- Hover effects on series cards
- Star ratings visible on each card

### Series Detail Page
- Large poster image
- Average rating calculation
- Expandable seasons/episodes list
- Comment section with star ratings
- Modal forms for adding content

### Authentication Page
- Modern glassmorphic design
- Animated floating background shapes
- Toggle between login/register
- Guest access option

## 🔐 Authentication Flow

1. **Sign Up**: User registers with email/password
2. **Email Confirmation**: Supabase sends confirmation email
3. **Sign In**: User logs in, receives JWT token
4. **Role Assignment**: User role stored in `user_metadata.role`
5. **Protected Actions**: Token sent in Authorization header
6. **Permission Check**: Backend validates role for each action

## 📝 License

This project is part of an academic assignment.

## 👤 Author

**BenBul**
- GitHub: [@BenBul](https://github.com/BenBul)

## 🙏 Acknowledgments

- Images from Unsplash
- Icons from Font Awesome
- Fonts from Google Fonts
- Hosting: Vercel (deployment ready)

---

**Built with ❤️ using Next.js and Supabase**
