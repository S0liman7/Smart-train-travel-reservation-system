const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getTrainById, getBookingById, getBookingsByUser, getAllBookings, bookSeat, freeSeat, addBooking, removeBooking } = require("../data/db");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings — create booking
router.post("/", authMiddleware, (req, res) => {
  const { trainId, date, seatClass, seatNumber, passengers, passengerDetails, paymentDetails } = req.body;

  if (!trainId || !date || !seatClass || !seatNumber || !passengers || !passengerDetails)
    return res.status(400).json({ success: false, message: "All booking fields are required." });

  const train = getTrainById(trainId);
  if (!train) return res.status(404).json({ success: false, message: "Train not found." });

  // Check seat availability
  const seat = train.seatMap.find(s => s.number === seatNumber);
  if (!seat) return res.status(400).json({ success: false, message: "Seat not found." });
  if (!seat.available && seat.bookedForDate === date)
    return res.status(409).json({ success: false, message: "This seat is already booked for the selected date." });

  // Simulate payment validation
  if (!paymentDetails || !paymentDetails.cardNumber)
    return res.status(400).json({ success: false, message: "Payment details are required." });

  // Book the seat
  const booked = bookSeat(trainId, seatNumber, req.user.id, date);
  if (!booked) return res.status(409).json({ success: false, message: "Seat could not be booked. Please try another." });

  const totalPrice = train.prices[seatClass] * passengers;

  const booking = {
    id: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
    userId: req.user.id,
    trainId,
    trainName: train.name,
    trainType: train.type,
    from: train.from,
    to: train.to,
    departure: train.departure,
    arrival: train.arrival,
    duration: train.duration,
    date,
    seatClass,
    seatNumber,
    passengers,
    passengerDetails,
    totalPrice,
    paymentStatus: "paid",
    status: "confirmed",
    bookedAt: new Date().toISOString(),
  };

  addBooking(booking);
  res.status(201).json({ success: true, message: "Booking confirmed!", data: booking });
});

// GET /api/bookings/my — current user's bookings
router.get("/my", authMiddleware, (req, res) => {
  const myBookings = getBookingsByUser(req.user.id);
  res.json({ success: true, data: myBookings, total: myBookings.length });
});

// GET /api/bookings/:id — single booking
router.get("/:id", authMiddleware, (req, res) => {
  const booking = getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
  if (booking.userId !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Access denied." });
  res.json({ success: true, data: booking });
});

// DELETE /api/bookings/:id — cancel booking
router.delete("/:id", authMiddleware, (req, res) => {
  const booking = getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
  if (booking.userId !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Access denied." });

  freeSeat(booking.trainId, booking.seatNumber, booking.date);
  removeBooking(booking.id);
  res.json({ success: true, message: "Booking cancelled successfully." });
});

// Admin: GET all bookings
router.get("/", adminMiddleware, (req, res) => {
  const all = getAllBookings();
  res.json({ success: true, data: all, total: all.length });
});

module.exports = router;
