-- متریاب (MatYab) — نمای خام دیتابیس (PostgreSQL)
-- این فایل فقط برای مستندسازی/خوانایی است.
-- منبع اصلی truth: backend/prisma/schema.prisma (migration واقعی از همان‌جا تولید می‌شود)

CREATE EXTENSION IF NOT EXISTS vector; -- pgvector برای مچینگ معنایی

CREATE TYPE user_role AS ENUM ('CONTRACTOR', 'SUPPLIER', 'ADMIN');
CREATE TYPE listing_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'MATCHED', 'SOLD', 'EXPIRED', 'REJECTED');
CREATE TYPE request_status AS ENUM ('ACTIVE', 'MATCHED', 'FULFILLED', 'EXPIRED');
CREATE TYPE match_status AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED');
CREATE TYPE quality_grade AS ENUM ('A', 'B', 'C');
CREATE TYPE assessment_source AS ENUM ('AI', 'MANUAL');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE procurement_order_status AS ENUM ('ORDERED', 'DELIVERED', 'DELAYED', 'CANCELLED');

CREATE TABLE users (
    id             TEXT PRIMARY KEY,
    full_name      TEXT NOT NULL,
    phone          TEXT UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    role           user_role NOT NULL,
    city           TEXT,
    trust_score    REAL NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    city       TEXT NOT NULL,
    region     TEXT,
    address    TEXT,
    lat        REAL,
    lng        REAL,
    owner_id   TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE material_categories (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    parent_id TEXT REFERENCES material_categories(id)
);

CREATE TABLE listings (
    id            TEXT PRIMARY KEY,
    project_id    TEXT NOT NULL REFERENCES projects(id),
    category_id   TEXT NOT NULL REFERENCES material_categories(id),
    quantity      REAL NOT NULL,
    unit          TEXT NOT NULL,
    photos        TEXT[] NOT NULL DEFAULT '{}',
    description   TEXT,
    asking_price  REAL NOT NULL,
    status        listing_status NOT NULL DEFAULT 'PENDING_REVIEW',
    description_embedding vector(1536), -- برای مچینگ معنایی فاز V1
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE material_requests (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id),
    category_id TEXT NOT NULL REFERENCES material_categories(id),
    quantity    REAL NOT NULL,
    budget      REAL,
    deadline    TIMESTAMPTZ,
    status      request_status NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quality_assessments (
    id         TEXT PRIMARY KEY,
    listing_id TEXT UNIQUE NOT NULL REFERENCES listings(id),
    score      INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    grade      quality_grade NOT NULL,
    notes      TEXT,
    source     assessment_source NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_suggestions (
    id               TEXT PRIMARY KEY,
    listing_id       TEXT UNIQUE NOT NULL REFERENCES listings(id),
    suggested_price  REAL NOT NULL,
    min_price        REAL NOT NULL,
    max_price        REAL NOT NULL,
    basis            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
    id          TEXT PRIMARY KEY,
    listing_id  TEXT NOT NULL REFERENCES listings(id),
    request_id  TEXT NOT NULL REFERENCES material_requests(id),
    match_score REAL NOT NULL,
    reason      TEXT,
    status      match_status NOT NULL DEFAULT 'SUGGESTED',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shipping_estimates (
    id             TEXT PRIMARY KEY,
    match_id       TEXT UNIQUE NOT NULL REFERENCES matches(id),
    distance_km    REAL NOT NULL,
    estimated_cost REAL NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id          TEXT PRIMARY KEY,
    match_id    TEXT UNIQUE NOT NULL REFERENCES matches(id),
    final_price REAL NOT NULL,
    commission  REAL NOT NULL,
    status      transaction_status NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id             TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id),
    rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_history (
    id          TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES material_categories(id),
    region      TEXT NOT NULL,
    price       REAL NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- کوپایلوت تأمین (Procurement Copilot) — E13
CREATE TABLE suppliers (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    phone      TEXT,
    city       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE supplier_quotes (
    id             TEXT PRIMARY KEY,
    supplier_id    TEXT NOT NULL REFERENCES suppliers(id),
    category_id    TEXT NOT NULL REFERENCES material_categories(id),
    unit_price     REAL NOT NULL,
    lead_time_days INTEGER NOT NULL,
    valid_until    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ردیف BOQ: مصالحی که یک پروژه تا تاریخ مشخصی به آن نیاز دارد
CREATE TABLE boq_items (
    id                TEXT PRIMARY KEY,
    project_id        TEXT NOT NULL REFERENCES projects(id),
    category_id       TEXT NOT NULL REFERENCES material_categories(id),
    required_quantity REAL NOT NULL,
    unit              TEXT NOT NULL,
    needed_by         TIMESTAMPTZ NOT NULL,
    ordered_quantity  REAL NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE procurement_orders (
    id                     TEXT PRIMARY KEY,
    boq_item_id            TEXT NOT NULL REFERENCES boq_items(id),
    supplier_id            TEXT NOT NULL REFERENCES suppliers(id),
    quantity               REAL NOT NULL,
    unit_price             REAL NOT NULL,
    status                 procurement_order_status NOT NULL DEFAULT 'ORDERED',
    ordered_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    expected_delivery_date TIMESTAMPTZ NOT NULL,
    actual_delivery_date   TIMESTAMPTZ
);

CREATE INDEX idx_listings_category_status ON listings(category_id, status);
CREATE INDEX idx_requests_category_status ON material_requests(category_id, status);
CREATE INDEX idx_price_history_category_region ON price_history(category_id, region);
CREATE INDEX idx_supplier_quotes_category ON supplier_quotes(category_id);
CREATE INDEX idx_boq_items_project ON boq_items(project_id);
CREATE INDEX idx_procurement_orders_boq_item ON procurement_orders(boq_item_id);
CREATE INDEX idx_procurement_orders_supplier ON procurement_orders(supplier_id);
