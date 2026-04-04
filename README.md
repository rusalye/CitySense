# CitySense 🏙️

## Project Overview

**CitySense** is an immersive urban exploration web application that transforms city walking into a mindful, gamified experience. It aims to combat modern indoor isolation by turning outdoor walks into interactive discovery trails. 

Inspired by the principles of mindfulness and localized history, CitySense serves as a digital companion that reads your real-world environment. It dynamically tracks your physical route and monitors live climate metrics (temperature and air quality), rewarding you for engaging in physical activity. Instead of wandering randomly, users can embark on curated "Chapters" representing hidden heritage trails, calm nature routes, and popular local culinary spaces.

By blending real-time geolocation tracking, live environmental awareness, collectible digital cards, and storytelling, CitySense encourages users to explore their cities in a whole new, deeply engaged way.

## Features ✨

*   **Real-time Geolocation Tracking & Journaling:** Automatically tracks distance and translates it to footsteps while you walk, leveraging the HTML5 Geolocation API, and logs journeys directly into your personal City Journal.
*   **Live Environmental Awareness:** Integrates with the free Open-Meteo API to pull live hyper-local weather conditions and Air Quality Index (AQI) grids based directly on user coordinates.
*   **Urban Chapters & Scavenger Hunts:** Cities are divided into curatable "Chapters", leading walkers through a structured set of hidden gems, cafes, and heritage sites.
*   **Collectible Street Cards:** A gamified reward system where completing challenges and visiting specific zones unlocks beautiful, location-specific lore cards.
*   **Dynamic Modes:** Choose between "Calm", "Comfort", and "Explore" modes to dictate map routes and thematic discoveries.

## Tech Stack 🛠️

**Frontend:**
*   **React (Vite):** Fast, modern front-end rendering framework.
*   **Context API:** Global state management for User, Theme, and Map selections.
*   **Vanilla CSS:** Custom-engineered styling systems prioritizing sleek interfaces, dark-mode themes, and hardware-accelerated animations. 

**Backend:**
*   **FastAPI:** High-performance async Python framework routing REST endpoints.
*   **MongoDB (Motor):** Asynchronous NoSQL database scaling user entries, challenges, chapters, and card collections.
*   **Pydantic:** Robust, strictly-typed schemas ensuring data integrity.
*   **HTTPX:** Async HTTP client bridging FastAPI with external meteorological services.

---

## Repository Structure 📂

The workspace follows a strict micro-architecture decoupled into distinct client and server directories:

```text
CitySense/
├── backend/                  # FastAPI Python Backend
│   ├── database/             # MongoDB connection instances
│   ├── models/               # Pydantic schema validation layers
│   │   ├── user_model.py     
│   │   ├── zone_model.py     
│   │   ├── chapter_model.py  
│   │   └── ...               
│   ├── routes/               # API endpoints & controllers
│   │   ├── environment.py    # Open-Meteo API integration
│   │   ├── journal.py        
│   │   ├── maps.py           
│   │   └── ...               
│   ├── main.py               # Server entry point & CORS configuration
│   ├── seed.py               # Data seeder for fresh MongoDB instances
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React + Vite Frontend Client
    ├── public/               # Static raw assets
    ├── src/
    │   ├── assets/           # Global stylesheets and CSS variables
    │   ├── components/       # Reusable React UI structural components
    │   ├── context/          # React AppContext (UserState, Theme, Mode)
    │   ├── hooks/            # Custom React Hooks 
    │   │   └── useGeolocation.js # Live tracking system
    │   ├── pages/            # Core views (Auth, Explore, Map, Journal, Cards)
    │   ├── services/         # API abstraction layer fetching from FastAPI
    │   │   └── api.js        
    │   ├── App.jsx           # Main Application Router
    │   └── main.jsx          # DOM Entry
    ├── package.json          # Node dependencies & NPM scripts
    └── vite.config.js        # Vite bundler configurations
```

---

## 🚀 Getting Started

Follow these steps to run CitySense seamlessly on your local environment.

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v16+)
*   [Python](https://www.python.org/downloads/) (3.9+)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas Cluster)

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment (optional, but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On MacOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `backend` directory and add your MongoDB Database connection URL:
   ```env
   MONGODB_URL="mongodb://localhost:27017" # Or your MongoDB Atlas URI
   ```
5. **Seed the database:** Populate your empty MongoDB instance with initial map zones, chapters, and challenges so the frontend has data to render:
   ```bash
   python seed.py
   ```
6. Start the FastAPI local server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will now be actively listening on `http://127.0.0.1:8000`.*

### 2. Frontend Setup (React)

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the frontend in your browser: `http://localhost:5173`. 
5. Navigate to the **Journal** tab and hit `▶ Start Walk` to see the live geolocation systems in motion!

---

## 🏗️ Production Readiness

To deploy CitySense, please consider the following production guidelines:

1. **Authentication:** The current `POST /users/login` hashes passwords but requires robust JWT passing (JSON Web Tokens) and HttpOnly Cookies to manage strict session states across the components.
2. **CORS Origins:** Currently, `backend/main.py` is set to `allow_origins=["*"]`. Under production, lock this down strictly to your hosted frontend Vercel/Netlify URL.
3. **Google Maps Billing:** The frontend utilizes `window.google.maps` functionality. A restricted Google Maps API Key must be generated in the Google Cloud Console and protected via domain referrals if embedding natively.
4. **Environment Rate-Limiting:** If scaling heavily, cache the Open-Meteo `httpx` HTTP calls using an intermediate Redis layer or FastAPI `@cached` dependency so aggressive location tracking doesn't over-poll external servers.
