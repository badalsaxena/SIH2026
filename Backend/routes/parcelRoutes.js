const express = require('express');
const { authenicateToken, authorizeRoles } = require('../middlware/auth');
const { getParcelGeoJSON, updateParcelGeometry } = require('../controllers/parcelController');
const router = express.Router();

router.get('/geojson', authenicateToken, authorizeRoles('Admin', 'Surveyor', 'Auditor'), getParcelGeoJSON);
router.post('/save', authenicateToken, authorizeRoles('Surveyor'), updateParcelGeometry);

module.exports = router;