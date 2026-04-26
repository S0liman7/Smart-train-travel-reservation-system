const express = require("express");
const { trains, getTrainById, getAvailableSeats, cities } = require("../data/db");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET /api/trains/cities
router.get("/cities", (req, res) => {
  res.json({ success: true, data: cities });
});

// GET /api/trains — list all or search
router.get("/", (req, res) => {
  const { from, to, date, type } = req.query;
  let results = trains.filter(t => t.status === "active");

  if (from) results = results.filter(t => t.from.toLowerCase() === from.toLowerCase());
  if (to) results = results.filter(t => t.to.toLowerCase() === to.toLowerCase());
  if (type) results = results.filter(t => t.type.toLowerCase() === type.toLowerCase());

  const enriched = results.map(t => ({
    ...t,
    seatMap: undefined,
    availableSeats: {
      economy: t.seatMap.filter(s => s.class === "economy" && (s.available || s.bookedForDate !== date)).length,
      business: t.seatMap.filter(s => s.class === "business" && (s.available || s.bookedForDate !== date)).length,
      first: t.seatMap.filter(s => s.class === "first" && (s.available || s.bookedForDate !== date)).length,
    },
  }));

  res.json({ success: true, data: enriched, total: enriched.length });
});

// POST /api/trains/search
router.post("/search", (req, res) => {
  const { from, to, date, passengers = 1, seatClass = "economy" } = req.body;
  if (!from || !to) return res.status(400).json({ success: false, message: "From and To are required." });
  if (from.toLowerCase() === to.toLowerCase()) return res.status(400).json({ success: false, message: "Origin and destination cannot be the same." });

  let results = trains.filter(t =>
    t.status === "active" &&
    t.from.toLowerCase() === from.toLowerCase() &&
    t.to.toLowerCase() === to.toLowerCase()
  );

  const enriched = results.map(t => {
    const avail = t.seatMap.filter(s => s.class === seatClass && (s.available || s.bookedForDate !== date)).length;
    return {
      ...t,
      seatMap: undefined,
      availableSeats: {
        economy: t.seatMap.filter(s => s.class === "economy" && (s.available || s.bookedForDate !== date)).length,
        business: t.seatMap.filter(s => s.class === "business" && (s.available || s.bookedForDate !== date)).length,
        first: t.seatMap.filter(s => s.class === "first" && (s.available || s.bookedForDate !== date)).length,
      },
      hasAvailability: avail >= passengers,
    };
  });

  res.json({ success: true, data: enriched, total: enriched.length });
});

// GET /api/trains/:id
router.get("/:id", (req, res) => {
  const train = getTrainById(req.params.id);
  if (!train) return res.status(404).json({ success: false, message: "Train not found." });
  const { date, seatClass = "any" } = req.query;
  const availableSeats = getAvailableSeats(train.id, seatClass, date);
  res.json({
    success: true,
    data: {
      ...train,
      seatMap: train.seatMap.map(s => ({
        ...s,
        available: s.available || s.bookedForDate !== date,
      })),
      availableSeatCount: {
        economy: train.seatMap.filter(s => s.class === "economy" && (s.available || s.bookedForDate !== date)).length,
        business: train.seatMap.filter(s => s.class === "business" && (s.available || s.bookedForDate !== date)).length,
        first: train.seatMap.filter(s => s.class === "first" && (s.available || s.bookedForDate !== date)).length,
      },
    },
  });
});

// Admin: update train status
router.patch("/:id/status", adminMiddleware, (req, res) => {
  const train = getTrainById(req.params.id);
  if (!train) return res.status(404).json({ success: false, message: "Train not found." });
  train.status = req.body.status;
  res.json({ success: true, message: "Train status updated." });
});

module.exports = router;
