-- Database skjema for CRM Norway

-- Bruker tabellen
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kunde tabellen
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    organization_number VARCHAR(20) UNIQUE,
    website VARCHAR(255),
    industry VARCHAR(100),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_postal_code VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'Norge',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id)
);

-- Kontaktperson tabellen
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Muligheter/Deals tabellen
CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'NOK',
    status VARCHAR(50) NOT NULL,
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id)
);

-- Aktiviteter tabellen
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id)
);

-- Noter tabellen
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Dokumenter tabellen
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);

-- Indekser for bedre ytelse
CREATE INDEX idx_customers_company_name ON customers(company_name);
CREATE INDEX idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX idx_deals_customer_id ON deals(customer_id);
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_notes_customer_id ON notes(customer_id);
CREATE INDEX idx_documents_customer_id ON documents(customer_id);

-- Trigger for å oppdatere updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Legg til triggere på alle tabeller
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();