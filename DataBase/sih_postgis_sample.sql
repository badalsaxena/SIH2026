-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles(name) VALUES ('Admin'), ('Surveyor'), ('Auditor') 
ON CONFLICT (name) DO NOTHING;

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(100) UNIQUE NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) UNIQUE NOT NULL,
	role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

-- 3. Create Parcels Table (SRID 4326 for WGS84 GeoJSON standard)
CREATE TABLE IF NOT EXISTS parcels (
	id SERIAL PRIMARY KEY,
	parcel_id VARCHAR(50) UNIQUE NOT NULL,
	owner_name VARCHAR(150),
	land_use VARCHAR(50) DEFAULT 'Unclassified',
	status VARCHAR(30) DEFAULT 'Draft', -- Options : Draft, Pending Audit, Approved, Rejected
	geom GEOMETRY(Polygon, 4326) NOT NULL,
	created_by INT REFERENCES users(id),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST (geom);

-- Seed some sample GeoJSON Parcel Data
INSERT INTO parcels (parcel_id, owner_name, land_use, status, geom) VALUES 
(
	'P-101',
	'Aarav Sharma',
	'Residential',
	'Draft',
	ST_GeomFromGeoJSON('{
		"type" : "Polygon",
		"coordinates": [[[77.2090, 28.6139], [77.2095, 28.6139], [77.2095, 28.6144], [77.2090, 28.6144], [77.2090, 28.6139]]]
	}')
),
(
    'P-102', 
    'Priya Patel', 
    'Commercial', 
    'Pending Audit', 
    ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[[77.2096, 28.6139], [77.2101, 28.6139], [77.2101, 28.6144], [77.2096, 28.6144], [77.2096, 28.6139]]]
    }')
)
ON CONFLICT (parcel_id) DO NOTHING;
