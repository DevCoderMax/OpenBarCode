-- ENUM para tipo de medida
CREATE TYPE measure_enum AS ENUM ('l', 'ml', 'kg', 'g', 'un');

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand_id INT REFERENCES brands(id),
    measure_type measure_enum,
    measure_value DECIMAL(10, 4),
    qtt INT,
    category_id INT REFERENCES category(id),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
