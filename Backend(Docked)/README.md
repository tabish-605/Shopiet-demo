# Shopiet | Facebook Marketplace Like Site
Full Stack ecommerce Website for my local town

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- Product listing with categories and filters
- Real Time Instant Messaging
- JWT Authentication for Secure Login and Actions
- Redis Caching for Performance
- Web Sockets with Redis Channels
- Shopping cart and checkout
- User dashboard for product uploads
- Search and Categorisation
- Google Maps Embeding
- Image Compression through TinyPNG API
- Account Customisation (Profile Pics, Bio's, Contacts)
- Docker Contanied run on Google Cloud for Scalibilaty and Reliabilty
- Responsive design

## Tech Stack

**Frontend:**
- React
- Vite
- Redux (for state management)
- Axios (for API calls)
- CSS Modules / Styled Components

**Backend:**
- Django
- Django REST Framework
- Django Allauth (for authentication)
- Django JWT
- Redis

## Installation

### Prerequisites

- Python (>=3.8)
- Node.js (>=14.x)
- npm or Yarn

### Backend Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/AustinMaturure/Shopiet.git
    cd Ghosted/backend
    ```

2. Create a virtual environment and activate it:

    ```sh
    python -m venv env
    source env\Scripts\activate  # On Linux use `env/bin/activate`
    ```

3. Install the dependencies:

    ```sh
    pip install -r requirements.txt
    ```

4. Set up the database:

    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```

5. Create a superuser:

    ```sh
    python manage.py createsuperuser
    ```

6. Start the development server:

    ```sh
    python manage.py runserver
    ```

### Frontend Setup

1. Navigate to the `frontend` directory:

    ```sh
    cd ../frontend
    ```

2. Install the dependencies:

    ```sh
    npm install  # Or `yarn install`
    ```

3. Start the development server:

    ```sh
    npm run dev  # Or `yarn dev`
    ```

## Usage

1. Access the backend API at `http://127.0.0.1:8000/`.
2. Access the frontend at `http://127.0.0.1:5173/`.
3. Use the admin dashboard at `http://127.0.0.1:8000/admin/` to manage products.

## Project Structure

```plaintext
Ghosted/
├── Backend/
│   ├── manage.py
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── shopiet/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── tests.py
│   │   └── views.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── urls.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── static/
│   └── templates/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── css/
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md 
```
## License
This project is licensed under the MIT License.
