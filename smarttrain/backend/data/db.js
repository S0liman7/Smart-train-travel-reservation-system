// ═══════════════════════════════════════════════════
//  SmartTrain — In-Memory Database
//  SWE332 Software Architecture Project
// ═══════════════════════════════════════════════════

const { v4: uuidv4 } = require("uuid");

// ── Users ────────────────────────────────────────────
const users = [
  {
    id: "u-admin-001",
    name: "Admin User",
    email: "admin@smarttrain.com",
    // password: Admin1234
    passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/.",
    role: "admin",
    phone: "+90 555 000 0000",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-demo-001",
    name: "Soliman Sabawi",
    email: "soliman@demo.com",
    // password: Demo1234
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "user",
    phone: "+90 555 123 4567",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
];

// ── Trains ───────────────────────────────────────────
const trains = [
  {
    id: "TR-001",
    name: "Boğaz Ekspresi",
    type: "High-Speed",
    from: "Istanbul",
    to: "Ankara",
    departure: "07:00",
    arrival: "10:30",
    duration: "3h 30m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 180, business: 320, first: 520 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-002",
    name: "Ege Mavi",
    type: "High-Speed",
    from: "Istanbul",
    to: "Izmir",
    departure: "08:30",
    arrival: "12:00",
    duration: "3h 30m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 200, business: 360, first: 580 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-003",
    name: "Anadolu Starı",
    type: "Intercity",
    from: "Ankara",
    to: "Konya",
    departure: "09:00",
    arrival: "11:45",
    duration: "2h 45m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 90, business: 160, first: 260 },
    amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"],
    status: "active",
  },
  {
    id: "TR-004",
    name: "Bursa Ekspresi",
    type: "Intercity",
    from: "Istanbul",
    to: "Bursa",
    departure: "10:00",
    arrival: "12:30",
    duration: "2h 30m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 300 },
    amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-005",
    name: "Kapadokya Özel",
    type: "High-Speed",
    from: "Ankara",
    to: "Kayseri",
    departure: "13:00",
    arrival: "15:15",
    duration: "2h 15m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 130, business: 230, first: 380 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-006",
    name: "Çukurova Ekspresi",
    type: "Intercity",
    from: "Ankara",
    to: "Adana",
    departure: "15:30",
    arrival: "20:00",
    duration: "4h 30m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 160, business: 280, first: 450 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-007",
    name: "Porsuk Treni",
    type: "Regional",
    from: "Eskisehir",
    to: "Ankara",
    departure: "06:30",
    arrival: "08:00",
    duration: "1h 30m",
    totalSeats: 100,
    seatMap: generateSeatMap(100),
    prices: { economy: 60, business: 100, first: 0 },
    amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    status: "active",
  },
  {
    id: "TR-008",
    name: "Mavi Yıldız",
    type: "High-Speed",
    from: "Istanbul",
    to: "Eskisehir",
    departure: "11:00",
    arrival: "13:00",
    duration: "2h 00m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 150, business: 260, first: 420 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },

  // ── Reverse-Direction Trains ────────────────────────
  {
    id: "TR-101",
    name: "Boğaz Ekspresi",
    type: "High-Speed",
    from: "Ankara",
    to: "Istanbul",
    departure: "14:00",
    arrival: "17:30",
    duration: "3h 30m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 180, business: 320, first: 520 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-102",
    name: "Ege Mavi",
    type: "High-Speed",
    from: "Izmir",
    to: "Istanbul",
    departure: "14:30",
    arrival: "18:00",
    duration: "3h 30m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 200, business: 360, first: 580 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-103",
    name: "Anadolu Starı",
    type: "Intercity",
    from: "Konya",
    to: "Ankara",
    departure: "14:00",
    arrival: "16:45",
    duration: "2h 45m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 90, business: 160, first: 260 },
    amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"],
    status: "active",
  },
  {
    id: "TR-104",
    name: "Bursa Ekspresi",
    type: "Intercity",
    from: "Bursa",
    to: "Istanbul",
    departure: "15:00",
    arrival: "17:30",
    duration: "2h 30m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 300 },
    amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-105",
    name: "Kapadokya Özel",
    type: "High-Speed",
    from: "Kayseri",
    to: "Ankara",
    departure: "17:00",
    arrival: "19:15",
    duration: "2h 15m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 130, business: 230, first: 380 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-106",
    name: "Çukurova Ekspresi",
    type: "Intercity",
    from: "Adana",
    to: "Ankara",
    departure: "08:00",
    arrival: "12:30",
    duration: "4h 30m",
    totalSeats: 80,
    seatMap: generateSeatMap(80),
    prices: { economy: 160, business: 280, first: 450 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },
  {
    id: "TR-107",
    name: "Porsuk Treni",
    type: "Regional",
    from: "Ankara",
    to: "Eskisehir",
    departure: "16:30",
    arrival: "18:00",
    duration: "1h 30m",
    totalSeats: 100,
    seatMap: generateSeatMap(100),
    prices: { economy: 60, business: 100, first: 0 },
    amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    status: "active",
  },
  {
    id: "TR-108",
    name: "Mavi Yıldız",
    type: "High-Speed",
    from: "Eskisehir",
    to: "Istanbul",
    departure: "15:00",
    arrival: "17:00",
    duration: "2h 00m",
    totalSeats: 60,
    seatMap: generateSeatMap(60),
    prices: { economy: 150, business: 260, first: 420 },
    amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    status: "active",
  },

  // ── Additional Trips ──────────────────────────────────

  // Istanbul → Ankara (2 more)
  { id: "TR-201", name: "Başkent Ekspresi", type: "High-Speed", from: "Istanbul", to: "Ankara",
    departure: "12:00", arrival: "15:30", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 190, business: 340, first: 540 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-202", name: "Gece Yıldızı", type: "High-Speed", from: "Istanbul", to: "Ankara",
    departure: "18:30", arrival: "22:00", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 170, business: 300, first: 500 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-203", name: "Sabah Treni", type: "Intercity", from: "Istanbul", to: "Ankara",
    departure: "05:30", arrival: "09:30", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 150, business: 270, first: 440 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Ankara → Istanbul (2 more)
  { id: "TR-204", name: "Başkent Ekspresi", type: "High-Speed", from: "Ankara", to: "Istanbul",
    departure: "07:30", arrival: "11:00", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 190, business: 340, first: 540 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-205", name: "Gece Yıldızı", type: "High-Speed", from: "Ankara", to: "Istanbul",
    departure: "20:00", arrival: "23:30", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 170, business: 300, first: 500 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-206", name: "Öğle Treni", type: "Intercity", from: "Ankara", to: "Istanbul",
    departure: "11:00", arrival: "15:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 150, business: 270, first: 440 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"], status: "active" },

  // Istanbul → Izmir (2 more)
  { id: "TR-207", name: "Ege Rüzgarı", type: "High-Speed", from: "Istanbul", to: "Izmir",
    departure: "13:00", arrival: "16:30", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 210, business: 370, first: 590 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-208", name: "Akşam Ekspresi", type: "Intercity", from: "Istanbul", to: "Izmir",
    departure: "17:30", arrival: "21:30", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 170, business: 310, first: 500 }, amenities: ["WiFi", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Izmir → Istanbul (2 more)
  { id: "TR-209", name: "Ege Rüzgarı", type: "High-Speed", from: "Izmir", to: "Istanbul",
    departure: "06:30", arrival: "10:00", duration: "3h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 210, business: 370, first: 590 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-210", name: "Akşam Ekspresi", type: "Intercity", from: "Izmir", to: "Istanbul",
    departure: "18:00", arrival: "22:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 170, business: 310, first: 500 }, amenities: ["WiFi", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Ankara → Konya (2 more)
  { id: "TR-211", name: "Mevlana Ekspresi", type: "High-Speed", from: "Ankara", to: "Konya",
    departure: "14:30", arrival: "16:45", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 100, business: 180, first: 290 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-212", name: "Step Treni", type: "Regional", from: "Ankara", to: "Konya",
    departure: "19:00", arrival: "22:00", duration: "3h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 70, business: 120, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Konya → Ankara (2 more)
  { id: "TR-213", name: "Mevlana Ekspresi", type: "High-Speed", from: "Konya", to: "Ankara",
    departure: "07:00", arrival: "09:15", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 100, business: 180, first: 290 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-214", name: "Step Treni", type: "Regional", from: "Konya", to: "Ankara",
    departure: "18:00", arrival: "21:00", duration: "3h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 70, business: 120, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Istanbul → Bursa (2 more)
  { id: "TR-215", name: "Yeşil Lale", type: "High-Speed", from: "Istanbul", to: "Bursa",
    departure: "06:00", arrival: "08:15", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 120, business: 210, first: 330 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-216", name: "Uludağ Ekspresi", type: "Intercity", from: "Istanbul", to: "Bursa",
    departure: "16:00", arrival: "18:30", duration: "2h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 300 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Bursa → Istanbul (2 more)
  { id: "TR-217", name: "Yeşil Lale", type: "High-Speed", from: "Bursa", to: "Istanbul",
    departure: "08:30", arrival: "10:45", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 120, business: 210, first: 330 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-218", name: "Uludağ Ekspresi", type: "Intercity", from: "Bursa", to: "Istanbul",
    departure: "19:00", arrival: "21:30", duration: "2h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 300 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Ankara → Kayseri (2 more)
  { id: "TR-219", name: "Erciyes Treni", type: "Intercity", from: "Ankara", to: "Kayseri",
    departure: "07:00", arrival: "09:30", duration: "2h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 120, business: 210, first: 350 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-220", name: "Kapadokya Gece", type: "High-Speed", from: "Ankara", to: "Kayseri",
    departure: "18:00", arrival: "20:15", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 130, business: 230, first: 380 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Kayseri → Ankara (2 more)
  { id: "TR-221", name: "Erciyes Treni", type: "Intercity", from: "Kayseri", to: "Ankara",
    departure: "10:00", arrival: "12:30", duration: "2h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 120, business: 210, first: 350 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-222", name: "Kapadokya Gece", type: "High-Speed", from: "Kayseri", to: "Ankara",
    departure: "20:00", arrival: "22:15", duration: "2h 15m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 130, business: 230, first: 380 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Ankara → Adana (2 more)
  { id: "TR-223", name: "Toros Ekspresi", type: "High-Speed", from: "Ankara", to: "Adana",
    departure: "08:00", arrival: "12:00", duration: "4h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 170, business: 300, first: 480 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-224", name: "Akdeniz Treni", type: "Regional", from: "Ankara", to: "Adana",
    departure: "21:00", arrival: "02:00", duration: "5h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 130, business: 230, first: 0 }, amenities: ["AC", "Power Outlet", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Adana → Ankara (2 more)
  { id: "TR-225", name: "Toros Ekspresi", type: "High-Speed", from: "Adana", to: "Ankara",
    departure: "14:00", arrival: "18:00", duration: "4h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 170, business: 300, first: 480 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-226", name: "Akdeniz Treni", type: "Regional", from: "Adana", to: "Ankara",
    departure: "20:00", arrival: "01:00", duration: "5h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 130, business: 230, first: 0 }, amenities: ["AC", "Power Outlet", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Eskisehir → Ankara (2 more)
  { id: "TR-227", name: "Sakarya Ekspresi", type: "Intercity", from: "Eskisehir", to: "Ankara",
    departure: "11:00", arrival: "12:30", duration: "1h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 65, business: 110, first: 180 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-228", name: "Akşam Porsuk", type: "Regional", from: "Eskisehir", to: "Ankara",
    departure: "17:30", arrival: "19:00", duration: "1h 30m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 60, business: 100, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"], status: "active" },

  // Ankara → Eskisehir (2 more)
  { id: "TR-229", name: "Sakarya Ekspresi", type: "Intercity", from: "Ankara", to: "Eskisehir",
    departure: "08:00", arrival: "09:30", duration: "1h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 65, business: 110, first: 180 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-230", name: "Öğle Porsuk", type: "Regional", from: "Ankara", to: "Eskisehir",
    departure: "13:00", arrival: "14:30", duration: "1h 30m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 60, business: 100, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"], status: "active" },

  // Istanbul → Eskisehir (2 more)
  { id: "TR-231", name: "Osmangazi Hızlı", type: "High-Speed", from: "Istanbul", to: "Eskisehir",
    departure: "06:30", arrival: "08:30", duration: "2h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 150, business: 260, first: 420 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-232", name: "Akşam Yıldızı", type: "Intercity", from: "Istanbul", to: "Eskisehir",
    departure: "17:00", arrival: "19:15", duration: "2h 15m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 240, first: 390 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Eskisehir → Istanbul (2 more)
  { id: "TR-233", name: "Osmangazi Hızlı", type: "High-Speed", from: "Eskisehir", to: "Istanbul",
    departure: "09:00", arrival: "11:00", duration: "2h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 150, business: 260, first: 420 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-234", name: "Akşam Yıldızı", type: "Intercity", from: "Eskisehir", to: "Istanbul",
    departure: "19:30", arrival: "21:45", duration: "2h 15m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 240, first: 390 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // ── Cross-Routes (connecting all cities) ────────────────

  // Izmir ↔ Ankara
  { id: "TR-301", name: "Başkent Ege", type: "High-Speed", from: "Izmir", to: "Ankara",
    departure: "07:00", arrival: "11:30", duration: "4h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 190, business: 340, first: 550 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-302", name: "Başkent Ege", type: "High-Speed", from: "Ankara", to: "Izmir",
    departure: "13:00", arrival: "17:30", duration: "4h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 190, business: 340, first: 550 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Bursa ↔ Ankara
  { id: "TR-303", name: "Yeşil Başkent", type: "Intercity", from: "Bursa", to: "Ankara",
    departure: "06:30", arrival: "10:30", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 250, first: 400 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-304", name: "Yeşil Başkent", type: "Intercity", from: "Ankara", to: "Bursa",
    departure: "14:00", arrival: "18:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 250, first: 400 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Eskisehir ↔ Bursa
  { id: "TR-305", name: "Yeşil Hat", type: "Regional", from: "Eskisehir", to: "Bursa",
    departure: "08:00", arrival: "10:00", duration: "2h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 55, business: 95, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-306", name: "Yeşil Hat", type: "Regional", from: "Bursa", to: "Eskisehir",
    departure: "15:00", arrival: "17:00", duration: "2h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 55, business: 95, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Konya ↔ Istanbul
  { id: "TR-307", name: "Sema Ekspresi", type: "High-Speed", from: "Konya", to: "Istanbul",
    departure: "06:00", arrival: "10:30", duration: "4h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 200, business: 350, first: 560 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-308", name: "Sema Ekspresi", type: "High-Speed", from: "Istanbul", to: "Konya",
    departure: "14:00", arrival: "18:30", duration: "4h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 200, business: 350, first: 560 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Adana ↔ Istanbul
  { id: "TR-309", name: "Akdeniz Yıldızı", type: "High-Speed", from: "Adana", to: "Istanbul",
    departure: "07:00", arrival: "13:00", duration: "6h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 250, business: 440, first: 700 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-310", name: "Akdeniz Yıldızı", type: "High-Speed", from: "Istanbul", to: "Adana",
    departure: "10:00", arrival: "16:00", duration: "6h 00m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 250, business: 440, first: 700 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Izmir ↔ Bursa
  { id: "TR-311", name: "Ege Zeytin", type: "Intercity", from: "Izmir", to: "Bursa",
    departure: "09:00", arrival: "12:30", duration: "3h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 120, business: 210, first: 340 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-312", name: "Ege Zeytin", type: "Intercity", from: "Bursa", to: "Izmir",
    departure: "13:30", arrival: "17:00", duration: "3h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 120, business: 210, first: 340 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Kayseri ↔ Istanbul
  { id: "TR-313", name: "Kapadokya Ekspresi", type: "High-Speed", from: "Kayseri", to: "Istanbul",
    departure: "06:30", arrival: "12:00", duration: "5h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 220, business: 390, first: 630 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-314", name: "Kapadokya Ekspresi", type: "High-Speed", from: "Istanbul", to: "Kayseri",
    departure: "11:00", arrival: "16:30", duration: "5h 30m", totalSeats: 60, seatMap: generateSeatMap(60),
    prices: { economy: 220, business: 390, first: 630 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Konya ↔ Adana
  { id: "TR-315", name: "Toros Güneyi", type: "Intercity", from: "Konya", to: "Adana",
    departure: "08:00", arrival: "12:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 310 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-316", name: "Toros Güneyi", type: "Intercity", from: "Adana", to: "Konya",
    departure: "14:00", arrival: "18:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 110, business: 190, first: 310 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Izmir ↔ Eskisehir
  { id: "TR-317", name: "Batı Ekspresi", type: "Intercity", from: "Izmir", to: "Eskisehir",
    departure: "07:30", arrival: "12:00", duration: "4h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 150, business: 270, first: 430 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },
  { id: "TR-318", name: "Batı Ekspresi", type: "Intercity", from: "Eskisehir", to: "Izmir",
    departure: "13:00", arrival: "17:30", duration: "4h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 150, business: 270, first: 430 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Eskisehir ↔ Konya
  { id: "TR-319", name: "İç Anadolu Treni", type: "Intercity", from: "Eskisehir", to: "Konya",
    departure: "09:00", arrival: "13:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 100, business: 180, first: 290 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-320", name: "İç Anadolu Treni", type: "Intercity", from: "Konya", to: "Eskisehir",
    departure: "15:00", arrival: "19:00", duration: "4h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 100, business: 180, first: 290 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Izmir ↔ Konya
  { id: "TR-321", name: "Ege Mevlana", type: "Intercity", from: "Izmir", to: "Konya",
    departure: "08:00", arrival: "14:00", duration: "6h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 180, business: 320, first: 510 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"], status: "active" },
  { id: "TR-322", name: "Ege Mevlana", type: "Intercity", from: "Konya", to: "Izmir",
    departure: "09:00", arrival: "15:00", duration: "6h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 180, business: 320, first: 510 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"], status: "active" },

  // Kayseri ↔ Konya
  { id: "TR-323", name: "Orta Anadolu", type: "Regional", from: "Kayseri", to: "Konya",
    departure: "10:00", arrival: "13:30", duration: "3h 30m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 80, business: 140, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-324", name: "Orta Anadolu", type: "Regional", from: "Konya", to: "Kayseri",
    departure: "14:30", arrival: "18:00", duration: "3h 30m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 80, business: 140, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Kayseri ↔ Adana
  { id: "TR-325", name: "Çukurova Hattı", type: "Regional", from: "Kayseri", to: "Adana",
    departure: "11:00", arrival: "14:00", duration: "3h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 70, business: 120, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },
  { id: "TR-326", name: "Çukurova Hattı", type: "Regional", from: "Adana", to: "Kayseri",
    departure: "15:00", arrival: "18:00", duration: "3h 00m", totalSeats: 100, seatMap: generateSeatMap(100),
    prices: { economy: 70, business: 120, first: 0 }, amenities: ["AC", "Power Outlet"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], status: "active" },

  // Izmir ↔ Adana
  { id: "TR-327", name: "Akdeniz Ege", type: "Intercity", from: "Izmir", to: "Adana",
    departure: "07:00", arrival: "14:00", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 230, business: 400, first: 650 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },
  { id: "TR-328", name: "Akdeniz Ege", type: "Intercity", from: "Adana", to: "Izmir",
    departure: "08:00", arrival: "15:00", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 230, business: 400, first: 650 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Izmir ↔ Kayseri
  { id: "TR-329", name: "Ege Kapadokya", type: "Intercity", from: "Izmir", to: "Kayseri",
    departure: "08:30", arrival: "15:30", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 210, business: 370, first: 600 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat"], status: "active" },
  { id: "TR-330", name: "Ege Kapadokya", type: "Intercity", from: "Kayseri", to: "Izmir",
    departure: "09:00", arrival: "16:00", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 210, business: 370, first: 600 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat"], status: "active" },

  // Bursa ↔ Konya
  { id: "TR-331", name: "Marmara Mevlana", type: "Intercity", from: "Bursa", to: "Konya",
    departure: "07:00", arrival: "12:30", duration: "5h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 160, business: 280, first: 450 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },
  { id: "TR-332", name: "Marmara Mevlana", type: "Intercity", from: "Konya", to: "Bursa",
    departure: "13:00", arrival: "18:30", duration: "5h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 160, business: 280, first: 450 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Bursa ↔ Kayseri
  { id: "TR-333", name: "Marmara Erciyes", type: "Intercity", from: "Bursa", to: "Kayseri",
    departure: "06:00", arrival: "13:00", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 200, business: 350, first: 570 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat"], status: "active" },
  { id: "TR-334", name: "Marmara Erciyes", type: "Intercity", from: "Kayseri", to: "Bursa",
    departure: "08:00", arrival: "15:00", duration: "7h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 200, business: 350, first: 570 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat"], status: "active" },

  // Bursa ↔ Adana
  { id: "TR-335", name: "Marmara Akdeniz", type: "Intercity", from: "Bursa", to: "Adana",
    departure: "07:00", arrival: "14:30", duration: "7h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 220, business: 380, first: 620 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Wed", "Fri"], status: "active" },
  { id: "TR-336", name: "Marmara Akdeniz", type: "Intercity", from: "Adana", to: "Bursa",
    departure: "08:00", arrival: "15:30", duration: "7h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 220, business: 380, first: 620 }, amenities: ["WiFi", "Dining Car", "Power Outlet", "AC", "Luggage"],
    days: ["Mon", "Wed", "Fri"], status: "active" },

  // Eskisehir ↔ Adana
  { id: "TR-337", name: "Anadolu Güneyi", type: "Intercity", from: "Eskisehir", to: "Adana",
    departure: "06:30", arrival: "13:00", duration: "6h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 180, business: 310, first: 500 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },
  { id: "TR-338", name: "Anadolu Güneyi", type: "Intercity", from: "Adana", to: "Eskisehir",
    departure: "09:00", arrival: "15:30", duration: "6h 30m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 180, business: 310, first: 500 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Mon", "Wed", "Fri", "Sun"], status: "active" },

  // Eskisehir ↔ Kayseri
  { id: "TR-339", name: "Anadolu Ortası", type: "Intercity", from: "Eskisehir", to: "Kayseri",
    departure: "08:00", arrival: "13:00", duration: "5h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 250, first: 400 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"], status: "active" },
  { id: "TR-340", name: "Anadolu Ortası", type: "Intercity", from: "Kayseri", to: "Eskisehir",
    departure: "10:00", arrival: "15:00", duration: "5h 00m", totalSeats: 80, seatMap: generateSeatMap(80),
    prices: { economy: 140, business: 250, first: 400 }, amenities: ["WiFi", "Power Outlet", "AC"],
    days: ["Tue", "Thu", "Sat", "Sun"], status: "active" },

  // Eskisehir ↔ Izmir (already added above as TR-317/318, skip)

  // Adana ↔ Eskisehir (already added above as TR-337/338, skip)
];

// ── Bookings ─────────────────────────────────────────
let bookings = [
  {
    id: "BK-DEMO001",
    userId: "u-demo-001",
    trainId: "TR-001",
    trainName: "Boğaz Ekspresi",
    from: "Istanbul",
    to: "Ankara",
    departure: "07:00",
    arrival: "10:30",
    date: "2026-03-25",
    seatClass: "business",
    seatNumber: "B12",
    passengers: 1,
    passengerDetails: [{ firstName: "Soliman", lastName: "Sabawi", idNumber: "TR123456", dob: "1999-05-10" }],
    totalPrice: 320,
    paymentStatus: "paid",
    status: "confirmed",
    bookedAt: "2026-03-19T10:00:00.000Z",
  },
];

// ── Seat Map Generator ────────────────────────────────
function generateSeatMap(total) {
  const seats = [];
  const rows = Math.ceil(total / 4);
  for (let r = 1; r <= rows; r++) {
    for (const col of ["A", "B", "C", "D"]) {
      if (seats.length >= total) break;
      const seatClass = r <= 3 ? "first" : r <= 8 ? "business" : "economy";
      seats.push({
        number: `${r}${col}`,
        class: seatClass,
        available: true,
        bookedByUserId: null,
        bookedForDate: null,
      });
    }
  }
  return seats;
}

// ── Helpers ────────────────────────────────────────────
function getTrainById(id) { return trains.find(t => t.id === id); }
function getUserById(id) { return users.find(u => u.id === id); }
function getUserByEmail(email) { return users.find(u => u.email === email.toLowerCase()); }
function getBookingById(id) { return bookings.find(b => b.id === id); }
function getBookingsByUser(userId) { return bookings.filter(b => b.userId === userId); }
function getAllBookings() { return bookings; }

function getAvailableSeats(trainId, seatClass, date) {
  const train = getTrainById(trainId);
  if (!train) return [];
  return train.seatMap.filter(s =>
    (seatClass === "any" || s.class === seatClass) &&
    (s.available || s.bookedForDate !== date)
  );
}

function bookSeat(trainId, seatNumber, userId, date) {
  const train = getTrainById(trainId);
  if (!train) return false;
  const seat = train.seatMap.find(s => s.number === seatNumber);
  if (!seat) return false;
  if (!seat.available && seat.bookedForDate === date) return false;
  seat.available = false;
  seat.bookedByUserId = userId;
  seat.bookedForDate = date;
  return true;
}

function freeSeat(trainId, seatNumber, date) {
  const train = getTrainById(trainId);
  if (!train) return;
  const seat = train.seatMap.find(s => s.number === seatNumber && s.bookedForDate === date);
  if (seat) { seat.available = true; seat.bookedByUserId = null; seat.bookedForDate = null; }
}

function addUser(user) { users.push(user); }
function addBooking(booking) { bookings.push(booking); }
function removeBooking(id) { const idx = bookings.findIndex(b => b.id === id); if (idx !== -1) bookings.splice(idx, 1); }

const cities = ["Istanbul", "Ankara", "Izmir", "Bursa", "Konya", "Eskisehir", "Kayseri", "Adana"];

module.exports = {
  users, trains, bookings, cities,
  getTrainById, getUserById, getUserByEmail, getBookingById,
  getBookingsByUser, getAllBookings, getAvailableSeats,
  bookSeat, freeSeat, addUser, addBooking, removeBooking,
};
