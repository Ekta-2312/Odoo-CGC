# 🚨 CivicTrack - Civic Issue Reporting System

A comprehensive web application for reporting, tracking, and managing civic issues in local communities.

---

## 🧱 Project Structure


project/
├── frontend/
│   ├── src/
│   ├── package.json 
├── backend/
│   ├── src/ 
│   ├── package.json 
└── README.md  


---

## 🚀 Quick Start

### 🔧 Backend Setup
bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and JWT secret
npm run migrate       # Run migrations
npm run seed          # Seed sample data
npm run dev           # Start backend server on http://localhost:3001


### 🎨 Frontend Setup
bash
cd frontend
npm install
npm run dev           # Start frontend server on http://localhost:5173


---

## 🎯 Features

### 👁‍🗨 Public (No Login)
- View all reported civic issues
- Filter by category, status, location
- Search issues by keyword
- View issue details with images
- Visualize on interactive map (within 5km)

### 👤 Registered Users
- Submit issues with photo and map location
- Track issue status updates
- Get real-time notifications
- Flag spam/inappropriate reports
- Optional anonymous reporting

### 🛠 Admin
- Moderate reported issues
- Update issue status (pending → resolved)
- View full analytics dashboard
- Ban/unban users
- View all reports city-wide

---

## ⚙ Technical Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router DOM
- React Hook Form + Yup
- Lucide Icons
- Recharts (Analytics)
- React Toastify for user feedback
- React Tooltip for accessibility
- Intro.js for guided user tours

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Knex.js ORM
- JWT Auth + Bcrypt
- Redis (caching)
- Joi (validation)
- Winston (logging)
- Multer + Sharp (image upload)

---

## 🧩 Database Schema

- users: name, email, role, password_hash  
- issues: title, description, coordinates, status  
- issue_images: image_path, thumbnail  
- status_history: timestamp, previous/new status  
- issue_flags: user_id, reason  
- notifications: type, message, read_status  

Includes foreign keys, indexing, audit trails, and geospatial queries.

---

## 📱 UI/UX and Usability

### Key Usability Features (Implemented)
- ✅ Toasts for success/error messages (React Toastify)
- ✅ Loading indicators for API calls
- ✅ Inline form validation errors using React Hook Form + Yup
- ✅ Tooltips for icon buttons (React Tooltip)
- ✅ Skeleton loaders during page load
- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ /help page and FAQ modal for user guidance
- ✅ Responsive layout across all breakpoints (Mobile → Desktop)

### Accessibility Tools
- Semantic HTML (<main>, <nav>, <section>)
- Focus rings, skip navigation
- Color contrast validation

---

## 📍 Geolocation & Map Features

- Auto-detect user location via GPS
- Drop-pin on interactive map
- Search by address (Geocoding)
- Cluster issues by area
- Radius filtering: 1–10 km

---

## 📊 Admin & Community Analytics

- Issue resolution rates over time
- High-frequency issue zones
- User engagement levels
- Flagged content trends
- Top categories and reporters

---

## 🔐 Security

- Input validation on all forms
- XSS, CSRF, SQL injection prevention
- Password hashing with bcrypt
- JWT-based auth with expiration
- Helmet.js + CORS + Rate limiting

---

## 🧪 Testing Strategy

### Frontend
- Unit tests for components
- E2E tests for forms and flows (Playwright/Cypress)
- Accessibility testing with axe

### Backend
- Integration tests for routes
- DB-level tests with mocked data
- Security audit tests

---

## 🚀 Deployment Ready

- Environment-based configs (.env, .env.production)
- Dockerized frontend & backend
- CI/CD integration with GitHub Actions
- Monitoring with Winston and error logs
- Horizontal scaling ready (Redis + PostgreSQL pooling)

---

## 🧭 Help & User Guidance

### /help Page Includes:
- How to report an issue
- How to track your reports
- How to upload valid photos
- How to reset your password
- Reporting abuse/spam
- Terms and privacy policy