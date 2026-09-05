const express = require("express");
const cors = require("cors");
const parcelRoutes = require('./routes/parcelRoutes');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4321;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running...");
});

app.use('/api/parcels', parcelRoutes);

app.listen(PORT, () => {
  console.log(`Serving the backend at http://localhost:${PORT}`);
});
