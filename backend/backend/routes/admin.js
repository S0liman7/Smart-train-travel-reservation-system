const express = require("express");
const { users, trains, getAllBookings } = require("../data/db");
const { adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", adminMiddleware, (req, res) => {
  const bookings = getAllBookings();
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  res.json({
    success: true,
    data: {
      totalUsers: users.filter(u => u.role === "user").length,
      totalTrains: trains.filter(t => t.status === "active").length,
      totalBookings: bookings.length,
      confirmedBookings,
      totalRevenue,
    },
  });
});

// GET /api/admin/users
router.get("/users", adminMiddleware, (req, res) => {
  const safe = users.map(({ passwordHash, ...u }) => u);
  res.json({ success: true, data: safe });
});

// GET /api/admin/bookings
router.get("/bookings", adminMiddleware, (req, res) => {
  const bookings = getAllBookings();
  res.json({ success: true, data: bookings, total: bookings.length });
});

// GET /api/admin/trains
router.get("/trains", adminMiddleware, (req, res) => {
  const enriched = trains.map(t => ({
    ...t,
    bookedSeats: t.seatMap.filter(s => !s.available).length,
    availableSeats: t.seatMap.filter(s => s.available).length,
  }));
  res.json({ success: true, data: enriched });
});

module.exports = router;
