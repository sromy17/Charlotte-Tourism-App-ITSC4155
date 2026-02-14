# <span style="color:gold">CL</span><span style="color:green">Tourism</span>: Charlotte Tourism App

**ITSC 4155 - Software Development Project**  
**Team Members:** Shravan Romy, Josh Miller, Ravi Patel, Gitansh Sharma  
**Semester:** Spring 2026

## Project Overview

<span style="color:gold">CL</span><span style="color:green">Tourism</span> is a fullstack web application that serves as an intelligent, real-time companion for Charlotte tourists. The app provides weather-optimized itinerary management with active monitoring for environmental hazards and traffic congestion.

## Tech Stack

- **Frontend:** React, Mapbox GL JS
- **Backend:** Python (FastAPI/Flask)
- **Database:** PostgreSQL
- **DevOps:** Docker, AWS/Azure
- **APIs:** OpenWeatherMap, Yelp Fusion, Ticketmaster, TomTom Traffic

## Team Responsibilities

- **Gitansh Sharma (Frontend Lead):** React development, Mapbox integration, UI/UX
- **Shravan Romy (API/Backend Lead):** Python middleware, API orchestration, unit tests
- **Josh Miller (Database/Security Lead):** SQL schema, authentication/authorization
- **Ravi Patel(DevOps Lead):** Docker, deployment, CI/CD pipeline

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Docker Desktop
- Git

### Local Development

1. Clone the repository:
```bash
git clone [your-repo-url]
cd cltourism
```

2. Backend setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend setup:
```bash
cd frontend
npm install
npm start
```

4. Docker setup:
```bash
docker-compose up --build
```

## Project Timeline

- **01/30/2026:** Project confirmation email
- **02/13/2026:** Project proposal presentation (20% of grade)
- **TBD:** Final delivery and technical report

## Documentation

See `/docs` folder for:
- Work Breakdown Structure (WBS)
- Gantt Chart
- Risk Assessment Plan
- API Documentation

## License
```

### Step 3: Create a Proper .gitignore

Open `.gitignore` and add:
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.egg-info/

# Node
node_modules/
npm-debug.log*
.npm
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment variables
.env

# Database
*.db
*.sqlite3

# Docker
*.log
