const API = "";
let authToken = localStorage.getItem("st_token") || null;
let currentUser = JSON.parse(localStorage.getItem("st_user") || "null");
let cities = [];
let toastTimer = null;
let selectedSeat = null;
let currentTrainForBooking = null;
let currentSearchParams = {};
let tripType = "one-way";

// ── Init ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadCities();
  updateNavUI();
  setDefaultDates();
  checkAdminNav();

  // Route initial page
  const hash = location.hash.replace("#", "") || "home";
  navigate(hash, false);
});

// ── Navigation ──────────────────────────────────────────
function navigate(page, scroll = true) {
  document.querySelectorAll(".page").forEach(p => { p.classList.remove("active"); p.classList.add("hidden"); });
  document.querySelectorAll(".nl").forEach(l => l.classList.remove("active"));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) { pageEl.classList.add("active"); pageEl.classList.remove("hidden"); }
  const navEl = document.querySelector(`.nl[data-page="${page}"]`);
  if (navEl) navEl.classList.add("active");

  location.hash = page;
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });

  if (page === "bookings") {
    if (!currentUser) { openModal("login"); return; }
    loadMyBookings();
  }
  if (page === "admin") {
    if (!currentUser || currentUser.role !== "admin") { navigate("home"); return; }
    loadAdminPanel();
  }
}

// ── Auth State ──────────────────────────────────────────
function updateNavUI() {
  const guest = document.getElementById("navGuest");
  const userDiv = document.getElementById("navUser");
  const avatar = document.getElementById("userAvatar");
  const name = document.getElementById("userName");
  const authHides = document.querySelectorAll(".nl-auth-hide");
  const adminLinks = document.querySelectorAll(".nl-admin");

  if (currentUser) {
    guest.classList.add("hidden"); userDiv.classList.remove("hidden");
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();
    name.textContent = currentUser.name.split(" ")[0];
    authHides.forEach(el => el.classList.remove("hidden"));
    adminLinks.forEach(el => el.classList.toggle("hidden", currentUser.role !== "admin"));
  } else {
    guest.classList.remove("hidden"); userDiv.classList.add("hidden");
    authHides.forEach(el => el.classList.add("hidden"));
    adminLinks.forEach(el => el.classList.add("hidden"));
  }
}

function checkAdminNav() {
  document.querySelectorAll(".nl-admin").forEach(el => {
    el.classList.toggle("hidden", !currentUser || currentUser.role !== "admin");
  });
  document.querySelectorAll(".nl-auth-hide").forEach(el => {
    el.classList.toggle("hidden", !currentUser);
  });
}

function setAuth(token, user) {
  authToken = token; currentUser = user;
  localStorage.setItem("st_token", token);
  localStorage.setItem("st_user", JSON.stringify(user));
  updateNavUI(); checkAdminNav();
}

function logout() {
  authToken = null; currentUser = null;
  localStorage.removeItem("st_token"); localStorage.removeItem("st_user");
  updateNavUI(); checkAdminNav();
  navigate("home");
  showToast("Logged out successfully.", "success");
}

// ── Cities ──────────────────────────────────────────────
async function loadCities() {
  try {
    const res = await fetch("/api/trains/cities");
    const data = await res.json();
    cities = data.data || [];
    const selects = ["hw-from", "hw-to", "sf-from", "sf-to"];
    selects.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const first = el.options[0].textContent;
      el.innerHTML = `<option value="">${first}</option>`;
      cities.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        el.appendChild(opt);
      });
    });
  } catch { }
}

function setDefaultDates() {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  ["hw-date", "sf-date"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = today; el.min = today; }
  });
  const returnEl = document.getElementById("hw-return-date");
  if (returnEl) { returnEl.value = tomorrow; returnEl.min = today; }
}

// ── Home Search ─────────────────────────────────────────
function switchTab(btn, type) {
  document.querySelectorAll(".sw-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  tripType = type;
  const returnWrap = document.getElementById("hw-return-wrap");
  if (returnWrap) {
    returnWrap.classList.toggle("hidden", type !== "round");
  }
}

function swapCities() {
  const f = document.getElementById("hw-from");
  const t = document.getElementById("hw-to");
  [f.value, t.value] = [t.value, f.value];
}

function swapSearchCities() {
  const f = document.getElementById("sf-from");
  const t = document.getElementById("sf-to");
  [f.value, t.value] = [t.value, f.value];
}

function doHomeSearch() {
  const from = document.getElementById("hw-from").value;
  const to = document.getElementById("hw-to").value;
  const date = document.getElementById("hw-date").value;
  const passengers = document.getElementById("hw-passengers").value;
  const cls = document.getElementById("hw-class").value;
  const returnDate = document.getElementById("hw-return-date")?.value || "";
  if (!from || !to) { showToast("Please select origin and destination", "warning"); return; }
  if (from === to) { showToast("Origin and destination cannot be the same", "warning"); return; }
  if (tripType === "round" && !returnDate) { showToast("Please select a return date", "warning"); return; }
  if (tripType === "round" && returnDate < date) { showToast("Return date must be after departure date", "warning"); return; }

  // Transfer to search page
  navigate("search");
  setTimeout(() => {
    document.getElementById("sf-from").value = from;
    document.getElementById("sf-to").value = to;
    document.getElementById("sf-date").value = date;
    document.getElementById("sf-passengers").value = passengers;
    document.getElementById("sf-class").value = cls;
    if (tripType === "round") {
      doRoundTripSearch(from, to, date, returnDate, +passengers, cls);
    } else {
      doSearch();
    }
  }, 100);
}

// ── Round Trip Search ───────────────────────────────────
async function doRoundTripSearch(from, to, date, returnDate, passengers, seatClass) {
  const results = document.getElementById("search-results");
  results.innerHTML = `<div class="loading-spin"></div>`;

  try {
    const [outRes, retRes] = await Promise.all([
      fetch("/api/trains/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, date, passengers, seatClass })
      }),
      fetch("/api/trains/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: to, to: from, date: returnDate, passengers, seatClass })
      }),
    ]);
    const outData = await outRes.json();
    const retData = await retRes.json();
    const outTrains = outData.data || [];
    const retTrains = retData.data || [];

    let html = "";

    // Outbound section
    html += `<div style="margin-bottom:32px">`;
    html += `<h3 style="font-family:var(--font-display);font-size:20px;color:var(--accent);margin-bottom:14px">🚄 Outbound · ${from} → ${to} · ${date}</h3>`;
    if (outTrains.length) {
      html += renderTrainCardsHTML(outTrains, from, to, seatClass, passengers, date);
    } else {
      html += `<div class="empty-hint" style="padding:32px"><div class="eh-icon">🚫</div><p>No outbound trains found. Try a different date.</p></div>`;
    }
    html += `</div>`;

    // Return section
    html += `<div>`;
    html += `<h3 style="font-family:var(--font-display);font-size:20px;color:var(--accent);margin-bottom:14px">🔄 Return · ${to} → ${from} · ${returnDate}</h3>`;
    if (retTrains.length) {
      html += renderTrainCardsHTML(retTrains, to, from, seatClass, passengers, returnDate);
    } else {
      html += `<div class="empty-hint" style="padding:32px"><div class="eh-icon">🚫</div><p>No return trains found. Try a different date.</p></div>`;
    }
    html += `</div>`;

    results.innerHTML = html;
  } catch {
    results.innerHTML = `<div class="empty-hint"><div class="eh-icon">⚠️</div><p>Search failed. Please try again.</p></div>`;
  }
}

// ── Train Search ────────────────────────────────────────
async function doSearch() {
  const from = document.getElementById("sf-from").value;
  const to = document.getElementById("sf-to").value;
  const date = document.getElementById("sf-date").value;
  const passengers = +document.getElementById("sf-passengers").value;
  const seatClass = document.getElementById("sf-class").value;

  if (!from || !to) { showToast("Please select origin and destination", "warning"); return; }
  if (from === to) { showToast("Origin and destination cannot be the same", "warning"); return; }

  currentSearchParams = { from, to, date, passengers, seatClass };
  const results = document.getElementById("search-results");
  results.innerHTML = `<div class="loading-spin"></div>`;

  try {
    const res = await fetch("/api/trains/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, date, passengers, seatClass }),
    });
    const data = await res.json();
    renderTrainResults(data.data || [], from, to, seatClass, passengers, date);
  } catch {
    results.innerHTML = `<div class="empty-hint"><div class="eh-icon">⚠️</div><p>Search failed. Please try again.</p></div>`;
  }
}

function renderTrainResults(trains, from, to, seatClass, passengers, date) {
  const results = document.getElementById("search-results");
  if (!trains.length) {
    results.innerHTML = `<div class="empty-hint"><div class="eh-icon">🚫</div><p>No trains found for <strong>${from} → ${to}</strong>. Try a different date or route.</p></div>`;
    return;
  }
  results.innerHTML = `<p style="color:var(--text2);font-size:14px;margin-bottom:16px">${trains.length} train${trains.length > 1 ? "s" : ""} found: <strong>${from} → ${to}</strong></p>` +
    renderTrainCardsHTML(trains, from, to, seatClass, passengers, date);
}

function renderTrainCardsHTML(trains, from, to, seatClass, passengers, date) {
  const amenityMap = { WiFi: "📶", "Dining Car": "🍽️", "Power Outlet": "🔌", AC: "❄️", Luggage: "🧳" };
  return trains.map((t, i) => {
    const avail = t.availableSeats?.[seatClass] ?? 0;
    const price = t.prices[seatClass] * passengers;
    const badgeCls = t.type === "High-Speed" ? "badge-hs" : t.type === "Intercity" ? "badge-ic" : "badge-rg";
    const amenHtml = (t.amenities || []).map(a => `<span class="tc-amenity">${amenityMap[a] || ""} ${a}</span>`).join("");
    return `
      <div class="train-card" style="animation-delay:${i * 0.06}s">
        <div>
          <div class="tc-name-row">
            <span class="tc-name">${t.name}</span>
            <span class="tc-badge ${badgeCls}">${t.type}</span>
          </div>
          <div class="tc-route">
            <div><div class="tc-time">${t.departure}</div><div style="font-size:12px;color:var(--text2)">${t.from}</div></div>
            <div class="tc-arrow">
              <div class="tc-arrow-line"></div>
              <div class="tc-duration">${t.duration}</div>
            </div>
            <div><div class="tc-time">${t.arrival}</div><div style="font-size:12px;color:var(--text2)">${t.to}</div></div>
          </div>
          <div class="tc-amenities">${amenHtml}</div>
        </div>
        <div class="tc-seats">
          <span class="tc-seats-num">${avail}</span>
          <span class="tc-seats-label">${seatClass} seats</span>
        </div>
        <div class="tc-action">
          <div>
            <div class="tc-price-label">From (${passengers} pax)</div>
            <div class="tc-price">₺${price.toLocaleString()}</div>
          </div>
          <button class="tc-select-btn" onclick="openBookingFlow('${t.id}','${seatClass}',${passengers},'${date}')" ${avail < passengers ? "disabled" : ""}>
            ${avail < passengers ? "No Seats" : "Select Seat →"}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// ── Booking Flow ─────────────────────────────────────────
async function openBookingFlow(trainId, seatClass, passengers, date) {
  if (!currentUser) { openModal("login"); return; }

  openModal("loading");
  try {
    const res = await fetch(`/api/trains/${trainId}?date=${date}&seatClass=${seatClass}`);
    const data = await res.json();
    currentTrainForBooking = { ...data.data, selectedDate: date, seatClass, passengers };
    selectedSeat = null;
    renderSeatSelectionModal();
  } catch {
    showToast("Could not load train details.", "error");
    closeModal();
  }
}

function renderSeatSelectionModal() {
  const t = currentTrainForBooking;
  const { seatClass, passengers, selectedDate } = t;

  const seats = t.seatMap || [];
  const classSeats = seats.filter(s => s.class === seatClass);

  let seatGridHtml = `<div class="seat-grid">`;
  let currentRow = "";
  classSeats.forEach(s => {
    const rowNum = parseInt(s.number);
    const col = s.number.replace(/\d/g, "");
    if (rowNum !== currentRow) {
      if (currentRow !== "") seatGridHtml += `</div>`;
      seatGridHtml += `<div class="seat-row"><span class="seat-row-num">${rowNum}</span>`;
      if (col === "C") seatGridHtml += `<span class="seat-gap"></span>`;
      currentRow = rowNum;
    }
    const isAvail = s.available || s.bookedForDate !== selectedDate;
    const seatCls = isAvail ? `seat-${seatClass}` : "seat-taken";
    seatGridHtml += `<div class="seat ${seatCls}" id="seat-${s.number}" onclick="selectSeat('${s.number}',${isAvail})" title="${s.number} ${isAvail ? "Available" : "Taken"}">${s.number}</div>`;
  });
  seatGridHtml += `</div></div>`;

  const price = t.prices[seatClass] * passengers;

  document.getElementById("modal-body").innerHTML = `
    <h2 class="modal-title">${t.name}</h2>
    <p class="modal-sub">${t.from} → ${t.to} · ${t.departure} → ${t.arrival} · ${selectedDate}</p>

    <div style="background:var(--bg);border-radius:8px;padding:14px 18px;margin-bottom:18px;display:flex;gap:20px;font-size:13px">
      <span><strong>Class:</strong> ${seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}</span>
      <span><strong>Passengers:</strong> ${passengers}</span>
      <span><strong>Price/pax:</strong> ₺${t.prices[seatClass].toLocaleString()}</span>
    </div>

    <div class="seat-legend">
      <div class="sl-item"><div class="sl-box seat-${seatClass}" style="background:${seatClass === 'economy' ? '#f0fdf4' : seatClass === 'business' ? '#eff6ff' : '#fffbeb'}"></div> Available</div>
      <div class="sl-item"><div class="sl-box seat-taken" style="background:#f1f5f9;border-color:#cbd5e1"></div> Taken</div>
      <div class="sl-item"><div class="sl-box" style="background:var(--blue);border-color:var(--blue2)"></div> Selected</div>
    </div>

    <p style="font-size:13px;color:var(--text2);margin-bottom:10px">Click a seat to select it for all ${passengers} passenger${passengers > 1 ? "s" : ""}:</p>
    <div class="seat-map-wrap">${seatGridHtml}</div>

    <div id="selected-seat-info" style="display:none;background:var(--sky);border:1px solid var(--sky2);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px">
      Selected: <strong id="selected-seat-display">—</strong>
    </div>

    <button class="form-submit" id="proceed-to-passenger-btn" onclick="openPassengerForm()" disabled>
      Continue with Seat Selection →
    </button>
  `;
}

function selectSeat(seatNum, isAvail) {
  if (!isAvail) return;
  if (selectedSeat) {
    const prev = document.getElementById(`seat-${selectedSeat}`);
    if (prev) {
      prev.classList.remove("seat-selected");
      const cls = currentTrainForBooking.seatClass;
      prev.classList.add(`seat-${cls}`);
    }
  }
  selectedSeat = seatNum;
  const el = document.getElementById(`seat-${seatNum}`);
  if (el) {
    el.classList.remove(`seat-${currentTrainForBooking.seatClass}`);
    el.classList.add("seat-selected");
  }
  const info = document.getElementById("selected-seat-info");
  const display = document.getElementById("selected-seat-display");
  if (info) info.style.display = "block";
  if (display) display.textContent = `Seat ${seatNum} (${currentTrainForBooking.seatClass})`;
  const btn = document.getElementById("proceed-to-passenger-btn");
  if (btn) btn.disabled = false;
}

function openPassengerForm() {
  if (!selectedSeat) { showToast("Please select a seat first.", "warning"); return; }
  const t = currentTrainForBooking;
  const { seatClass, passengers, selectedDate } = t;
  const price = t.prices[seatClass] * passengers;

  let passengerForms = "";
  for (let i = 1; i <= passengers; i++) {
    passengerForms += `
      <div style="border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px">
        <p style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px">Passenger ${i}</p>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input class="form-input" id="p${i}-first" placeholder="Ali" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name *</label>
            <input class="form-input" id="p${i}-last" placeholder="Yılmaz" required />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">ID / Passport *</label>
            <input class="form-input" id="p${i}-id" placeholder="TC1234567890" required />
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input class="form-input" type="date" id="p${i}-dob" />
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("modal-body").innerHTML = `
    <h2 class="modal-title">Passenger Details</h2>
    <p class="modal-sub">${t.name} · Seat ${selectedSeat} · ${selectedDate}</p>
    ${passengerForms}
    <hr class="form-divider" />
    <div class="payment-box">
      <h4>💳 Payment Details (Simulated)</h4>
      <div class="card-icons">
        <span class="card-icon">VISA</span>
        <span class="card-icon">MC</span>
        <span class="card-icon">AMEX</span>
      </div>
      <div class="form-group">
        <label class="form-label">Card Number *</label>
        <input class="form-input" id="pay-card" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCard(this)" />
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Expiry *</label>
          <input class="form-input" id="pay-expiry" placeholder="MM/YY" maxlength="5" />
        </div>
        <div class="form-group">
          <label class="form-label">CVV *</label>
          <input class="form-input" id="pay-cvv" placeholder="123" maxlength="3" type="password" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cardholder Name *</label>
        <input class="form-input" id="pay-name" placeholder="ALI YILMAZ" />
      </div>
    </div>
    <div class="price-summary">
      <span class="ps-label">${seatClass.charAt(0).toUpperCase() + seatClass.slice(1)} × ${passengers} passenger${passengers > 1 ? "s" : ""}</span>
      <span class="ps-total">₺${price.toLocaleString()}</span>
    </div>
    <p id="booking-error" class="form-error hidden"></p>
    <button class="form-submit" id="confirm-booking-btn" onclick="confirmBooking()">
      Confirm & Pay ₺${price.toLocaleString()} →
    </button>
  `;
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = v.replace(/(\d{4})/g, "$1 ").trim();
}

async function confirmBooking() {
  const t = currentTrainForBooking;
  const { seatClass, passengers, selectedDate } = t;
  const btn = document.getElementById("confirm-booking-btn");
  const errEl = document.getElementById("booking-error");
  errEl.classList.add("hidden");

  // Collect passenger details
  const passengerDetails = [];
  for (let i = 1; i <= passengers; i++) {
    const first = document.getElementById(`p${i}-first`)?.value.trim();
    const last = document.getElementById(`p${i}-last`)?.value.trim();
    const idNum = document.getElementById(`p${i}-id`)?.value.trim();
    if (!first || !last || !idNum) {
      errEl.textContent = `Please fill in all required fields for Passenger ${i}.`;
      errEl.classList.remove("hidden"); return;
    }
    passengerDetails.push({ firstName: first, lastName: last, idNumber: idNum, dob: document.getElementById(`p${i}-dob`)?.value });
  }

  // Payment validation
  const card = document.getElementById("pay-card")?.value.replace(/\s/g, "");
  const expiry = document.getElementById("pay-expiry")?.value;
  const cvv = document.getElementById("pay-cvv")?.value;
  const cardName = document.getElementById("pay-name")?.value.trim();

  if (!card || card.length < 16) { errEl.textContent = "Please enter a valid 16-digit card number."; errEl.classList.remove("hidden"); return; }
  if (!expiry || expiry.length < 5) { errEl.textContent = "Please enter a valid expiry date (MM/YY)."; errEl.classList.remove("hidden"); return; }
  if (!cvv || cvv.length < 3) { errEl.textContent = "Please enter a valid 3-digit CVV."; errEl.classList.remove("hidden"); return; }
  if (!cardName) { errEl.textContent = "Please enter the cardholder name."; errEl.classList.remove("hidden"); return; }

  btn.disabled = true; btn.textContent = "Processing payment…";

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        trainId: t.id, date: selectedDate, seatClass,
        seatNumber: selectedSeat, passengers, passengerDetails,
        paymentDetails: { cardNumber: card.slice(-4), cardName },
      }),
    });
    const data = await res.json();
    if (!data.success) {
      errEl.textContent = data.message || "Booking failed."; errEl.classList.remove("hidden");
      btn.disabled = false; btn.textContent = `Confirm & Pay ₺${(t.prices[seatClass] * passengers).toLocaleString()} →`;
      return;
    }
    renderBookingSuccess(data.data);
    showToast("🎉 Booking confirmed!", "success");
  } catch {
    errEl.textContent = "Network error. Please try again."; errEl.classList.remove("hidden");
    btn.disabled = false;
  }
}

function renderBookingSuccess(bk) {
  document.getElementById("modal-body").innerHTML = `
    <div class="booking-success">
      <span class="bs-icon">🎉</span>
      <h2 class="bs-title">Booking Confirmed!</h2>
      <p class="bs-id">Booking ID: <strong>${bk.id}</strong></p>
      <div style="background:var(--bg);border-radius:10px;padding:18px;text-align:left;margin-bottom:20px;font-size:14px">
        <div style="margin-bottom:8px"><strong>${bk.trainName}</strong></div>
        <div style="color:var(--text2)">${bk.from} → ${bk.to}</div>
        <div style="color:var(--text2)">${bk.departure} → ${bk.arrival} · ${bk.date}</div>
        <div style="color:var(--text2)">Seat: <strong>${bk.seatNumber}</strong> · ${bk.seatClass.charAt(0).toUpperCase() + bk.seatClass.slice(1)}</div>
        <div style="margin-top:10px;font-size:18px;color:var(--blue);font-weight:700">Total: ₺${bk.totalPrice.toLocaleString()}</div>
      </div>
      <button class="form-submit" onclick="closeModal(); navigate('bookings')">View My Bookings →</button>
    </div>
  `;
}

// ── My Bookings ──────────────────────────────────────────
async function loadMyBookings() {
  const list = document.getElementById("bookings-list");
  list.innerHTML = `<div class="loading-spin"></div>`;
  try {
    const res = await fetch("/api/bookings/my", { headers: { "Authorization": `Bearer ${authToken}` } });
    const data = await res.json();
    renderBookings(data.data || []);
  } catch {
    list.innerHTML = `<div class="empty-hint"><div class="eh-icon">⚠️</div><p>Failed to load bookings.</p></div>`;
  }
}

function renderBookings(bookings) {
  const list = document.getElementById("bookings-list");
  if (!bookings.length) {
    list.innerHTML = `
      <div class="no-bookings">
        <div class="nb-icon">🎫</div>
        <h3>No bookings yet</h3>
        <p>Search for trains and make your first reservation!</p>
        <button class="btn-primary" onclick="navigate('search')">Search Trains →</button>
      </div>
    `;
    return;
  }
  list.innerHTML = bookings.map((bk, i) => `
    <div class="booking-card" style="animation-delay:${i * 0.05}s">
      <div>
        <div class="bc-id">${bk.id}</div>
        <div class="bc-name">${bk.trainName}</div>
        <div class="bc-route">${bk.from} → ${bk.to}</div>
        <div class="bc-meta">
          <div class="bc-meta-item"><strong>${bk.departure}</strong> → <strong>${bk.arrival}</strong></div>
          <div class="bc-meta-item">Date: <strong>${bk.date}</strong></div>
          <div class="bc-meta-item">Class: <strong>${bk.seatClass.charAt(0).toUpperCase() + bk.seatClass.slice(1)}</strong></div>
          <div class="bc-meta-item">Seat: <strong>${bk.seatNumber}</strong></div>
          <div class="bc-meta-item">Passengers: <strong>${bk.passengers}</strong></div>
          <div class="bc-meta-item"><span class="bc-status st-confirmed">✓ Confirmed</span></div>
        </div>
      </div>
      <div class="bc-action">
        <div>
          <div class="bc-price-label">Total Paid</div>
          <div class="bc-price">₺${bk.totalPrice.toLocaleString()}</div>
        </div>
        <button class="btn-danger" onclick="cancelBooking('${bk.id}')">Cancel</button>
      </div>
    </div>
  `).join("");
}

async function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
  try {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${authToken}` } });
    const data = await res.json();
    if (data.success) { showToast("Booking cancelled.", "success"); loadMyBookings(); }
    else showToast(data.message || "Cancel failed.", "error");
  } catch { showToast("Network error.", "error"); }
}

// ── Admin Panel ──────────────────────────────────────────
async function loadAdminPanel() {
  document.getElementById("adminStats").innerHTML = `<div class="loading-spin" style="grid-column:span 5"></div>`;
  try {
    const [statsRes, bookingsRes, trainsRes, usersRes] = await Promise.all([
      fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${authToken}` } }),
      fetch("/api/admin/bookings", { headers: { "Authorization": `Bearer ${authToken}` } }),
      fetch("/api/admin/trains", { headers: { "Authorization": `Bearer ${authToken}` } }),
      fetch("/api/admin/users", { headers: { "Authorization": `Bearer ${authToken}` } }),
    ]);
    const stats = (await statsRes.json()).data;
    const bookings = (await bookingsRes.json()).data;
    const trains = (await trainsRes.json()).data;
    const users = (await usersRes.json()).data;

    document.getElementById("adminStats").innerHTML = `
      <div class="as-card"><span class="as-num">${stats.totalUsers}</span><span class="as-label">Registered Users</span></div>
      <div class="as-card"><span class="as-num">${stats.totalTrains}</span><span class="as-label">Active Trains</span></div>
      <div class="as-card"><span class="as-num">${stats.totalBookings}</span><span class="as-label">Total Bookings</span></div>
      <div class="as-card"><span class="as-num">${stats.confirmedBookings}</span><span class="as-label">Confirmed</span></div>
      <div class="as-card"><span class="as-num" style="font-size:22px">₺${stats.totalRevenue.toLocaleString()}</span><span class="as-label">Total Revenue</span></div>
    `;

    // Bookings table
    document.getElementById("at-bookings").innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Booking ID</th><th>User</th><th>Train</th><th>Route</th><th>Date</th><th>Class</th><th>Seat</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td style="font-weight:600;color:var(--blue)">${b.id}</td>
              <td>${b.passengerDetails?.[0]?.firstName || "—"} ${b.passengerDetails?.[0]?.lastName || ""}</td>
              <td>${b.trainName}</td>
              <td>${b.from} → ${b.to}</td>
              <td>${b.date}</td>
              <td>${b.seatClass}</td>
              <td>${b.seatNumber}</td>
              <td>₺${b.totalPrice.toLocaleString()}</td>
              <td><span class="bc-status st-confirmed">✓ Confirmed</span></td>
            </tr>
          `).join("") || `<tr><td colspan="9" style="text-align:center;color:var(--text2)">No bookings yet</td></tr>`}
        </tbody>
      </table>
    `;

    // Trains table
    document.getElementById("at-trains").innerHTML = `
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Total Seats</th><th>Booked</th><th>Available</th></tr></thead>
        <tbody>
          ${trains.map(t => `
            <tr>
              <td style="font-weight:600">${t.id}</td>
              <td>${t.name}</td>
              <td>${t.type}</td>
              <td>${t.from} → ${t.to}</td>
              <td>${t.departure}</td>
              <td>${t.arrival}</td>
              <td>${t.totalSeats}</td>
              <td style="color:var(--red)">${t.bookedSeats}</td>
              <td style="color:var(--green)">${t.availableSeats}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // Users table
    document.getElementById("at-users").innerHTML = `
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td style="font-size:11px;color:var(--text3)">${u.id}</td>
              <td style="font-weight:600">${u.name}</td>
              <td>${u.email}</td>
              <td>${u.phone || "—"}</td>
              <td><span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${u.role === 'admin' ? '#fef3c7' : '#dbeafe'};color:${u.role === 'admin' ? '#b45309' : '#1d4ed8'}">${u.role}</span></td>
              <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById("adminStats").innerHTML = `<p style="color:var(--red)">Failed to load admin data.</p>`;
  }
}

function switchAdminTab(btn, panelId) {
  document.querySelectorAll(".atab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-panel").forEach(p => p.classList.add("hidden"));
  btn.classList.add("active");
  document.getElementById(panelId)?.classList.remove("hidden");
}

// ── Auth Modals ──────────────────────────────────────────
function openModal(type) {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("hidden");
  if (type === "loading") {
    document.getElementById("modal-body").innerHTML = `<div class="loading-spin"></div>`;
  } else if (type === "login") {
    renderLoginModal();
  } else if (type === "register") {
    renderRegisterModal();
  }
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  currentTrainForBooking = null; selectedSeat = null;
}

function renderLoginModal() {
  document.getElementById("modal-body").innerHTML = `
    <h2 class="modal-title">Welcome back</h2>
    <p class="modal-sub">Log in to manage your bookings</p>
    <div class="form-group">
      <label class="form-label">Email Address</label>
      <input class="form-input" id="login-email" type="email" placeholder="you@email.com" />
    </div>
    <div class="form-group">
      <label class="form-label">Password</label>
      <input class="form-input" id="login-pwd" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()" />
    </div>
    <p id="login-error" class="form-error hidden"></p>
    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--text2);margin-bottom:12px">
      Demo: <strong>soliman@demo.com</strong> / <strong>password</strong><br/>
      Admin: <strong>admin@smarttrain.com</strong> / <strong>Admin1234</strong>
    </div>
    <button class="form-submit" id="login-btn" onclick="doLogin()">Log In</button>
    <div class="form-footer" style="margin-top:14px">
      <span style="font-size:13px;color:var(--text2)">Don't have an account?</span>
      <button class="form-footer-link" onclick="renderRegisterModal()">Create account →</button>
    </div>
  `;
}

async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pwd = document.getElementById("login-pwd").value;
  const err = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");
  err.classList.add("hidden");
  if (!email || !pwd) { err.textContent = "Please enter email and password."; err.classList.remove("hidden"); return; }
  btn.disabled = true; btn.textContent = "Logging in…";
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pwd }),
    });
    const data = await res.json();
    if (!data.success) { err.textContent = data.message; err.classList.remove("hidden"); btn.disabled = false; btn.textContent = "Log In"; return; }
    setAuth(data.data.token, data.data.user);
    closeModal(); showToast(`Welcome back, ${data.data.user.name.split(" ")[0]}! 👋`, "success");
  } catch { err.textContent = "Login failed. Please try again."; err.classList.remove("hidden"); btn.disabled = false; btn.textContent = "Log In"; }
}

function renderRegisterModal() {
  document.getElementById("modal-body").innerHTML = `
    <h2 class="modal-title">Create account</h2>
    <p class="modal-sub">Join SmartTrain and book your first trip</p>
    <div class="form-row-2">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input class="form-input" id="reg-name" placeholder="Ali Yılmaz" />
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input class="form-input" id="reg-phone" placeholder="+90 555 000 0000" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Email Address *</label>
      <input class="form-input" id="reg-email" type="email" placeholder="you@email.com" />
    </div>
    <div class="form-group">
      <label class="form-label">Password * (min 6 characters)</label>
      <input class="form-input" id="reg-pwd" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')doRegister()" />
    </div>
    <p id="reg-error" class="form-error hidden"></p>
    <button class="form-submit" id="reg-btn" onclick="doRegister()">Create Account</button>
    <div class="form-footer" style="margin-top:14px">
      <span style="font-size:13px;color:var(--text2)">Already have an account?</span>
      <button class="form-footer-link" onclick="renderLoginModal()">Log in →</button>
    </div>
  `;
}

async function doRegister() {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pwd = document.getElementById("reg-pwd").value;
  const phone = document.getElementById("reg-phone").value.trim();
  const err = document.getElementById("reg-error");
  const btn = document.getElementById("reg-btn");
  err.classList.add("hidden");
  if (!name || !email || !pwd) { err.textContent = "Please fill in all required fields."; err.classList.remove("hidden"); return; }
  btn.disabled = true; btn.textContent = "Creating account…";
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pwd, phone }),
    });
    const data = await res.json();
    if (!data.success) { err.textContent = data.message; err.classList.remove("hidden"); btn.disabled = false; btn.textContent = "Create Account"; return; }
    setAuth(data.data.token, data.data.user);
    closeModal(); showToast(`Account created! Welcome, ${data.data.user.name.split(" ")[0]}! 🎉`, "success");
  } catch { err.textContent = "Registration failed. Please try again."; err.classList.remove("hidden"); btn.disabled = false; btn.textContent = "Create Account"; }
}

// ── Toast ────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg; t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 3800);
}
