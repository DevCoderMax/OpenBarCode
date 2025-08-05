# OpenBarCode

OpenBarCode é uma biblioteca de código aberto para acessar e cadastrar informações de produtos usando códigos de barras. O projeto consiste em uma API backend construída com FastAPI e uma aplicação frontend móvel desenvolvida com React Native e Expo.

## Como Funciona

O OpenBarCode funciona como um sistema completo de gerenciamento de produtos baseado em códigos de barras:

### 1. **Escaneamento de Códigos de Barras**
- O aplicativo móvel utiliza a câmera do dispositivo para escanear códigos de barras (EAN13, EAN8, Code128, Code39, Code93, UPC-A, UPC-E, QR Code)
- Utiliza a biblioteca `expo-camera` para captura e reconhecimento automático
- Interface intuitiva com modal de escaneamento e visualização em tempo real

### 2. **Busca e Consulta de Produtos**
- Após escanear um código, o sistema consulta a API backend para verificar se o produto já existe no banco de dados
- Se encontrado, exibe todas as informações cadastradas (nome, descrição, marca, categoria, medidas, etc.)
- Se não encontrado, apresenta um formulário em branco para cadastro de novo produto

### 3. **Cadastro e Edição de Produtos**
- Interface completa para cadastro com campos para:
  - Nome do produto
  - Descrição
  - Marca (selecionável de lista pré-cadastrada)
  - Categorias (seleção múltipla)
  - Tipo de medida (litro, ml, kg, g, unidade)
  - Valor da medida e quantidade
  - Upload de imagens
  - Status ativo/inativo

### 4. **Armazenamento e Gerenciamento**
- Backend robusto com FastAPI e PostgreSQL
- Relacionamentos complexos entre produtos, marcas e categorias
- Sistema de imagens com MinIO para armazenamento de arquivos
- API RESTful completa com endpoints para todas as operações CRUD

## Funcionalidades

- **Escaneamento de Códigos**: Reconhecimento automático de múltiplos formatos de código de barras
- **Gerenciamento de Produtos**: Criar, consultar, atualizar e deletar produtos
- **Sistema de Categorias**: Organizar produtos em categorias múltiplas
- **Controle de Marcas**: Gerenciar marcas de produtos
- **Upload de Imagens**: Suporte a múltiplas imagens por produto
- **Interface Responsiva**: Aplicativo móvel com design moderno e intuitivo
- **API Documentada**: API RESTful com documentação automática via Swagger

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
