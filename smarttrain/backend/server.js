const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ── API Routes ──────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/trains", require("./routes/trains"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));

// ── SPA fallback ────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚂 SmartTrain running → http://localhost:${PORT}`);
  console.log(`   Admin:  admin@smarttrain.com / Admin1234`);
  console.log(`   Demo:   soliman@demo.com / password\n`);
});
