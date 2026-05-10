# Odoo-Parul-Hackathon
========================================================================
TRAVELOOP - FULL-STACK TRAVEL PLANNING APPLICATION
========================================================================
Project for Odoo Organized Hackathon
========================================================================

Traveloop is a comprehensive travel planning application that allows users to
discover destinations, plan multi-stop itineraries, manage budgets, and 
share their travel experiences with a community.

------------------------------------------------------------------------
TECH STACK
------------------------------------------------------------------------
FRONTEND:
- React 18 with Vite
- Tailwind CSS (Styling)
- React Router v6 (Routing)
- Axios (API Integration)
- Recharts (Data Visualization)
- react-hot-toast (Notifications)
- react-datepicker (Date Management)

BACKEND:
- Django 4.x
- Django REST Framework (API)
- djangorestframework-simplejwt (Authentication)
- django-cors-headers (CORS Management)
- Pillow (Image Handling)
- SQLite (Default Database)

------------------------------------------------------------------------
GETTING STARTED
------------------------------------------------------------------------

1. BACKEND SETUP:
   - Navigate to: /traveloop_backend
   - Create virtual environment: python -m venv venv
   - Activate venv: .\venv\Scripts\activate
   - Install dependencies: pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
   - Run Migrations: python manage.py migrate
   - Seed Data: python manage.py seed_data --reset
   - Run Server: python manage.py runserver

2. FRONTEND SETUP:
   - Navigate to: /frontend
   - Install dependencies: npm install
   - Run Dev Server: npm run dev

------------------------------------------------------------------------
DEFAULT CREDENTIALS (FOR TESTING)
------------------------------------------------------------------------

ADMIN ACCESS (Django Admin & Dashboard):
- Email: admin@traveloop.com
- Password: admin123

TEST USER ACCOUNT:
- Email: jay@test.com
- Password: password123

------------------------------------------------------------------------
KEY FEATURES
------------------------------------------------------------------------
- Interactive Dashboard: Browse 20 curated destinations (12 Indian cities 
  like Jaipur, Goa, Mumbai and 8 International cities like Paris, Tokyo).
- Itinerary Builder: Create multi-stop trips with arrival/departure dates, 
  budgets, and specific activities.
- Inline Editing: Seamlessly update trip stops and activities directly 
  within the builder timeline.
- Budget Tracking: Automated expense management and visualization with charts.
- Community: Share and discover travel posts from other users.
- Admin Panel: Full control over cities, activities, and user data via 
  the Django admin interface (http://localhost:8000/admin).

------------------------------------------------------------------------
DEVELOPED FOR ODOO HACKATHON
------------------------------------------------------------------------
========================================================================
