# OpenBarCode

OpenBarcode is an open-source project for registering, consulting, and managing product barcodes. It consists of a backend API built with FastAPI and a frontend mobile application developed with React Native and Expo.

## Features

- **Product Management**: Create, read, update, and delete products.
- **Category Management**: Organize products into categories.
- **Brand Management**: Keep track of product brands.
- **Barcode Scanning**: The mobile app allows scanning barcodes to retrieve product information.
- **RESTful API**: A well-documented API for interacting with the data.

## Technologies Used

### Backend (API)

- **Python 3.11+**
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs.
- **Uvicorn**: An ASGI server for running the FastAPI application.
- **SQLAlchemy**: The Python SQL Toolkit and Object Relational Mapper.
- **PostgreSQL**: The database used to store the application data.

### Frontend (openbarcodeweb)

- **React Native**: A framework for building native apps using React.
- **Expo**: A platform for making universal React applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Expo Router**: A file-based router for React Native and web applications.

## Project Structure

```
OpenBarCode/
├── api/                # Backend FastAPI application
│   ├── database.py     # Database connection and initialization
│   ├── main.py         # Main FastAPI application file
│   ├── models/         # SQLAlchemy models
│   ├── routes/         # API routes (endpoints)
│   └── requirements.txt# Python dependencies
├── openbarcodeweb/       # Frontend React Native (Expo) application
│   ├── app/            # Application screens and layouts
│   ├── assets/         # Images, fonts, and other static assets
│   ├── components/     # Reusable components
│   ├── constants/      # Application constants (e.g., API URLs)
│   ├── hooks/          # Custom React hooks
│   ├── models/         # Data models for the frontend
│   ├── package.json    # Project metadata and dependencies
│   └── tsconfig.json   # TypeScript configuration
└── README.md           # This file
```

## Getting Started

This project is composed of a frontend application that consumes a backend API. As the API is already hosted, you only need to set up and run the frontend application.

### Prerequisites

- **Node.js** and **npm** (or **yarn**)
- **Expo Go** app on your mobile device for testing.

### Setup and Running the Application

1.  **Configure the API URL:**
    - Open the file `openbarcodeweb/constants/Api.ts`.
    - Replace the existing URL with the API URL provided to you.

    ```typescript
    export const API_URL = 'YOUR_API_URL_HERE';
    ```

2.  **Navigate to the `openbarcodeweb` directory:**
    ```sh
    cd openbarcodeweb
    ```

3.  **Install the dependencies:**
    ```sh
    npm install
    ```

4.  **Run the application:**
    ```sh
    npx expo start
    ```
    This will start the Metro bundler. You can then scan the QR code with the Expo Go app on your phone to run the app.

## API Endpoints

The API provides the following endpoints under the `/api/v1` prefix:

- `GET /products`: Get a list of all products.
- `GET /products/{product_id}`: Get a specific product by its ID.
- `POST /products`: Create a new product.
- `PUT /products/{product_id}`: Update an existing product.
- `DELETE /products/{product_id}`: Delete a product.
- `GET /categories`: Get a list of all categories.
- `GET /brands`: Get a list of all brands.

For a complete list of endpoints and their details, please visit the API documentation at `/docs` when the API is running.

## Available Scripts (Frontend)

In the `openbarcodeweb` directory, you can run the following scripts:

- `npm start`: Runs the app in development mode.
- `npm run android`: Runs the app on a connected Android device or emulator.
- `npm run ios`: Runs the app on the iOS simulator.
- `npm run web`: Runs the app in a web browser.
- `npm run lint`: Lints the project files.
