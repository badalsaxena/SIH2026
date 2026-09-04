const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { authenicateToken, authorizeRoles } = require("./auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4321;
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  res.send("Backend running...");
});

app.get(
  "/api/parcels/geojson",
  authenicateToken,
  authorizeRoles("Admin", "Surveyor", "Auditor"),
  async (req, res) => {
    try {
      const query = `
            SELECT jsonb_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(geom, 4326))::jsonb,
                'properties', jsonb_build_object(
                  'id', id,
                  'parcel_id', parcel_id,
                  'owner_name', owner_name,
                  'land_use', land_use,
                  'status', status
                )
              )
            ),
            '[]'::jsonb
          )
        ) AS geojson
        FROM parcels;
        `;

      const result = await pool.query(query);
      return res.json(result.rows[0].geojson);
    } catch (e) {
      console.error("Error fetching spatial GeoJSON : ", e);
      return res
        .status(500)
        .json({ error: "Internal server spatial query error" });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Serving the backend at http://localhost:${PORT}`);
});
