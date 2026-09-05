const pool = require("../config/db");

const getParcelGeoJSON = async (req, res) => {
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
};

const updateParcelGeometry = async (req, res) => {
  const { parcel_id, geometry, land_use } = req.body;

  if (!parcel_id || !geometry) {
    return res.status(400).json({
      error: "parcel_id and geometry are required.",
    });
  }

  try {
    const query = `
    UPDATE parcels
    SET
        geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
        land_use = COALESCE($2, land_use),
        status = 'Pending Audit',
        updated_at = CURRENT_TIMESTAMP
    WHERE parcel_id = $3
    RETURNING id, parcel_id, status, land_use; 
  `;

    const values = [JSON.stringify(geometry), land_use, parcel_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Parcel not found." });
    }

    return res.json({
      message: "Parcel boundary updated successfully.",
      updatesParcel: result.rows[0],
    });
  } catch (e) {
    console.error("Failed to update parcel boundary : ", e);
    return res
      .status(500)
      .json({ error: "Internal server spatial update error." });
  }
};

module.exports = { getParcelGeoJSON, updateParcelGeometry };
