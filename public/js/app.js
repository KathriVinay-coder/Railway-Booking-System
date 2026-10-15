// Global Application State
let allStations = [];
let currentTrain = null;
let selectedSeats = [];
let passengerDetails = [];
let routeDate = '';
let currentUser = null;
let pendingTrainSelection = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initDateDefaults();
  fetchStations();
  initEventListeners();
  initChatbot();
  initAuth();
  initQuickPNR();
  initCustomModals();
});

// Set default journey date to tomorrow and set up preset listeners
function initDateDefaults() {
  const travelDateInput = document.getElementById('travel-date');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  travelDateInput.value = tomorrowStr;
  travelDateInput.min = todayStr;

  const presetToday = document.getElementById('preset-today');
  const presetTomorrow = document.getElementById('preset-tomorrow');

  if (presetToday && presetTomorrow) {
    presetToday.addEventListener('click', () => {
      travelDateInput.value = todayStr;
      presetToday.classList.add('active');
      presetTomorrow.classList.remove('active');
    });

    presetTomorrow.addEventListener('click', () => {
      travelDateInput.value = tomorrowStr;
      presetTomorrow.classList.add('active');
      presetToday.classList.remove('active');
    });
  }
}

// Fetch stations and populate dropdown options
function fetchStations() {
  fetch('/api/stations')
    .then(res => res.json())
    .then(data => {
      allStations = data;
      renderStationOptions();
      bindStationChangeEvent();
    })
    .catch(err => console.error('Error fetching station database:', err));
}

function renderStationOptions() {
  const fromSelect = document.getElementById('from-station');
  const toSelect = document.getElementById('to-station');
  const adminFrom = document.getElementById('admin-train-from');
  const adminTo = document.getElementById('admin-train-to');

  const currentFrom = fromSelect.value;
  const currentTo = toSelect.value;

  fromSelect.innerHTML = '<option value="" disabled selected>Select Origin Station</option>';
  toSelect.innerHTML = '<option value="" disabled selected>Select Destination Station</option>';
  adminFrom.innerHTML = '<option value="" disabled selected>Select Origin</option>';
  adminTo.innerHTML = '<option value="" disabled selected>Select Destination</option>';

  allStations.forEach(stn => {
    adminFrom.innerHTML += `<option value="${stn.code}">${stn.name} (${stn.code})</option>`;
    adminTo.innerHTML += `<option value="${stn.code}">${stn.name} (${stn.code})</option>`;

    const disableFrom = (currentTo && stn.code === currentTo);
    fromSelect.innerHTML += `
      <option value="${stn.code}" ${disableFrom ? 'disabled' : ''} ${currentFrom === stn.code ? 'selected' : ''}>
        ${stn.name} (${stn.code}) ${disableFrom ? '(Selected as To)' : ''}
      </option>`;

    const disableTo = (currentFrom && stn.code === currentFrom);
    toSelect.innerHTML += `
      <option value="${stn.code}" ${disableTo ? 'disabled' : ''} ${currentTo === stn.code ? 'selected' : ''}>
        ${stn.name} (${stn.code}) ${disableTo ? '(Selected as From)' : ''}
      </option>`;
  });
}

function bindStationChangeEvent() {
  const fromSelect = document.getElementById('from-station');
  const toSelect = document.getElementById('to-station');
  const swapBtn = document.getElementById('btn-swap-stations');

  fromSelect.addEventListener('change', () => {
    const selectedFrom = fromSelect.value;
    Array.from(toSelect.options).forEach(opt => {
      if (!opt.value) return;
      opt.disabled = (opt.value === selectedFrom);
      if (opt.value === selectedFrom && toSelect.value === selectedFrom) {
        toSelect.value = '';
      }
    });
  });

  toSelect.addEventListener('change', () => {
    const selectedTo = toSelect.value;
    Array.from(fromSelect.options).forEach(opt => {
      if (!opt.value) return;
      opt.disabled = (opt.value === selectedTo);
      if (opt.value === selectedTo && fromSelect.value === selectedTo) {
        fromSelect.value = '';
      }
    });
  });

  swapBtn.addEventListener('click', () => {
    const valFrom = fromSelect.value;
    const valTo = toSelect.value;
    if (!valFrom && !valTo) return;

    fromSelect.value = valTo;
    toSelect.value = valFrom;
    fromSelect.dispatchEvent(new Event('change'));
    toSelect.dispatchEvent(new Event('change'));
  });
}

// Bind UI event handlers
function initEventListeners() {
  // Navigation tabs
  document.getElementById('link-book').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab('link-book');
    displayScreen('search-section');
  });

  document.getElementById('link-history').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab('link-history');
    displayScreen('history-section');
    fetchBookingHistory();
  });

  document.getElementById('link-admin').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab('link-admin');
    displayScreen('admin-section');
    fetchAdminMetrics();
  });

  document.getElementById('brand-logo').addEventListener('click', () => {
    setActiveTab('link-book');
    displayScreen('search-section');
  });

  // Train Search Submit
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fromVal = document.getElementById('from-station').value;
    const toVal = document.getElementById('to-station').value;
    routeDate = document.getElementById('travel-date').value;

    if (!fromVal || !toVal) {
      displayAlert('Stations Required', 'Please select both Origin and Destination stations.', 'info');
      return;
    }

    if (fromVal === toVal) {
      displayAlert('Invalid Station Pair', 'Origin and Destination stations cannot be identical.', 'error');
      return;
    }

    searchTrainSchedules(fromVal, toVal);
  });

  // Back Navigation
  document.getElementById('btn-back-search').addEventListener('click', () => displayScreen('search-section'));
  document.getElementById('btn-back-trains').addEventListener('click', () => displayScreen('trains-section'));
  document.getElementById('btn-back-booking').addEventListener('click', () => displayScreen('booking-section'));

  // Passenger Form Submit -> Proceed to Payment
  document.getElementById('passenger-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUser) {
      displayAlert('Login Required', 'Only logged-in users can book tickets. Please sign in or create an account to proceed.', 'info');
      document.getElementById('auth-modal').classList.remove('hidden');
      return;
    }

    passengerDetails = [];
    const names = document.querySelectorAll('.pax-name-input');
    const ages = document.querySelectorAll('.pax-age-input');

    for (let i = 0; i < names.length; i++) {
      passengerDetails.push({
        name: names[i].value,
        age: ages[i].value,
        seatNo: names[i].dataset.seat
      });
    }

    const totalAmount = (selectedSeats.length * currentTrain.price) + 50;
    document.getElementById('payment-amount').textContent = `Total Amount to Pay: Rs. ${totalAmount}`;
    displayScreen('payment-section');
  });

  // Payment Option Tabs
  document.getElementById('tab-card').addEventListener('click', () => {
    document.getElementById('tab-card').classList.add('active');
    document.getElementById('tab-upi').classList.remove('active');
    document.getElementById('payment-form-card').classList.remove('hidden');
    document.getElementById('payment-form-upi').classList.add('hidden');
  });

  document.getElementById('tab-upi').addEventListener('click', () => {
    document.getElementById('tab-upi').classList.add('active');
    document.getElementById('tab-card').classList.remove('active');
    document.getElementById('payment-form-upi').classList.remove('hidden');
    document.getElementById('payment-form-card').classList.add('hidden');
  });

  // Payment Execution Submit
  document.getElementById('payment-form-card').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
      displayAlert('Login Required', 'Only logged-in users can book tickets. Please sign in or create an account.', 'info');
      document.getElementById('auth-modal').classList.remove('hidden');
      return;
    }
    processPayment('Credit/Debit Card');
  });

  document.getElementById('btn-confirm-upi').addEventListener('click', () => {
    if (!currentUser) {
      displayAlert('Login Required', 'Only logged-in users can book tickets. Please sign in or create an account.', 'info');
      document.getElementById('auth-modal').classList.remove('hidden');
      return;
    }
    processPayment('UPI Instant');
  });

  // Ticket Receipt Actions
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  document.getElementById('btn-new-booking').addEventListener('click', () => {
    displayScreen('search-section');
    setActiveTab('link-book');
  });

  document.getElementById('btn-cancel-ticket').addEventListener('click', () => {
    const pnr = document.getElementById('ticket-pnr-value')?.textContent;
    if (pnr) {
      displayConfirm('Cancel Ticket', `Are you sure you want to cancel ticket PNR ${pnr}? Refund will be processed immediately.`, () => {
        processCancelTicket(pnr);
      });
    }
  });

  // Admin Train Addition
  document.getElementById('admin-add-train-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const trainData = {
      id: document.getElementById('admin-train-id').value.trim(),
      name: document.getElementById('admin-train-name').value.trim(),
      from: document.getElementById('admin-train-from').value,
      to: document.getElementById('admin-train-to').value,
      departure: document.getElementById('admin-train-dep').value.trim(),
      arrival: document.getElementById('admin-train-arr').value.trim(),
      price: document.getElementById('admin-train-price').value
    };

    fetch('/api/admin/trains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          displayAlert('Train Added', `Train '${trainData.name}' (#${trainData.id}) successfully added to active schedule!`, 'success');
          document.getElementById('admin-add-train-form').reset();
          fetchAdminMetrics();
        } else {
          displayAlert('Add Failed', data.error || 'Failed to add train schedule.', 'error');
        }
      })
      .catch(err => displayAlert('Server Error', 'Error communicating with admin server.', 'error'));
  });
}

// Quick select popular route
window.quickSelectRoute = function(fromCode, toCode) {
  const fromSelect = document.getElementById('from-station');
  const toSelect = document.getElementById('to-station');

  fromSelect.value = fromCode;
  fromSelect.dispatchEvent(new Event('change'));
  toSelect.value = toCode;
  toSelect.dispatchEvent(new Event('change'));

  routeDate = document.getElementById('travel-date').value;
  searchTrainSchedules(fromCode, toCode);
};

function setActiveTab(linkId) {
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(linkId);
  if (target) target.classList.add('active');
}

function displayScreen(screenId) {
  const screens = ['search-section', 'trains-section', 'booking-section', 'payment-section', 'confirmation-section', 'history-section', 'admin-section'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

// Search train schedules
function searchTrainSchedules(from, to) {
  toggleLoader(true, 'Searching available trains...');
  fetch(`/api/trains?from=${from}&to=${to}`)
    .then(res => res.json())
    .then(data => {
      toggleLoader(false);
      const listDiv = document.getElementById('trains-list');
      listDiv.innerHTML = '';

      if (!data || data.length === 0) {
        listDiv.innerHTML = '<p class="info-text">No direct trains found for this route. Please try another station pair.</p>';
        displayScreen('trains-section');
        return;
      }

      data.forEach(train => {
        const fromStn = allStations.find(s => s.code === train.from)?.name || train.from;
        const toStn = allStations.find(s => s.code === train.to)?.name || train.to;

        const card = `
          <div class="train-card-item">
            <div class="train-main-info">
              <div class="train-title-block">
                <h3>${train.name} <span class="train-number-tag">#${train.id}</span></h3>
                <div class="train-schedule-strip">
                  <div class="time-box">
                    <span class="time-val">${train.departure}</span>
                    <span class="stn-val">${fromStn}</span>
                  </div>
                  <div class="duration-arrow">
                    <span>Direct</span>
                    <div class="duration-line"></div>
                    <span>Daily</span>
                  </div>
                  <div class="time-box">
                    <span class="time-val">${train.arrival}</span>
                    <span class="stn-val">${toStn}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="train-classes-row">
              <div class="class-box" onclick="selectTrainSchedule('${train.id}', '${train.name} (3A)', ${train.price})">
                <div class="class-title"><span>3 Tier AC (3A)</span></div>
                <div class="class-price">Rs. ${train.price}</div>
                <div class="class-status">AVAILABLE</div>
              </div>
              <div class="class-box" onclick="selectTrainSchedule('${train.id}', '${train.name} (2A)', ${Math.round(train.price * 1.4)})">
                <div class="class-title"><span>2 Tier AC (2A)</span></div>
                <div class="class-price">Rs. ${Math.round(train.price * 1.4)}</div>
                <div class="class-status">AVAILABLE</div>
              </div>
              <div class="class-box" onclick="selectTrainSchedule('${train.id}', '${train.name} (SL)', ${Math.round(train.price * 0.5)})">
                <div class="class-title"><span>Sleeper (SL)</span></div>
                <div class="class-price">Rs. ${Math.round(train.price * 0.5)}</div>
                <div class="class-status">AVAILABLE</div>
              </div>
            </div>
          </div>
        `;
        listDiv.innerHTML += card;
      });

      const fromNameTitle = allStations.find(s => s.code === from)?.name || from;
      const toNameTitle = allStations.find(s => s.code === to)?.name || to;
      document.getElementById('route-title').textContent = `${fromNameTitle} -> ${toNameTitle}`;

      displayScreen('trains-section');
    })
    .catch(err => {
      toggleLoader(false);
      displayAlert('Search Error', 'Failed to retrieve train schedule.', 'error');
    });
}

// Select train & fetch live seats with strict auth enforcement
window.selectTrainSchedule = function(trainId, name, price) {
  if (!currentUser) {
    pendingTrainSelection = { trainId, name, price };
    displayAlert(
      'Login Required to Book', 
      'Only logged-in customers can book tickets. Please sign in to your account or create a new account to select seats and proceed.', 
      'info'
    );
    document.getElementById('auth-modal').classList.remove('hidden');
    return;
  }

  currentTrain = { id: trainId, name, price };
  selectedSeats = [];
  passengerDetails = [];

  toggleLoader(true, 'Loading live coach seating grid...');
  fetch(`/api/seats?trainId=${trainId}&date=${routeDate}`)
    .then(res => res.json())
    .then(seatsData => {
      toggleLoader(false);
      renderSeatsLayout(seatsData);
      updatePassengerInputFields();
      displayScreen('booking-section');
    })
    .catch(err => {
      toggleLoader(false);
      displayAlert('Error', 'Unable to load coach seat map.', 'error');
    });
};

function renderSeatsLayout(seats) {
  const grid = document.getElementById('seats-grid');
  grid.innerHTML = '';

  seats.forEach(seat => {
    const btn = document.createElement('div');
    btn.className = 'seat';
    if (!seat.isAvailable) btn.classList.add('occupied');
    btn.textContent = seat.seatNo;

    if (seat.isAvailable) {
      btn.addEventListener('click', () => handleSeatToggle(seat.seatNo, btn));
    }

    grid.appendChild(btn);
  });
}

function handleSeatToggle(seatNo, btnElement) {
  const idx = selectedSeats.indexOf(seatNo);
  if (idx > -1) {
    selectedSeats.splice(idx, 1);
    btnElement.classList.remove('selected');
  } else {
    if (selectedSeats.length >= 4) {
      displayAlert('Seat Limit Exceeded', 'You can select a maximum of 4 seats per booking.', 'info');
      return;
    }
    selectedSeats.push(seatNo);
    btnElement.classList.add('selected');
  }
  updatePassengerInputFields();
}

function updatePassengerInputFields() {
  const container = document.getElementById('passenger-inputs-container');
  const summaryBox = document.getElementById('fare-summary');
  container.innerHTML = '';

  if (selectedSeats.length === 0) {
    container.innerHTML = '<p class="info-text">Please click available seats from the coach layout to add passengers.</p>';
    summaryBox.classList.add('hidden');
    return;
  }

  selectedSeats.sort((a, b) => a - b);

  selectedSeats.forEach((seat, i) => {
    const defaultName = (currentUser && i === 0) ? currentUser.name : '';
    container.innerHTML += `
      <div class="pax-input-block">
        <span class="pax-input-title">Passenger #${i + 1} (Seat ${seat})</span>
        <div class="form-group" style="margin-bottom:8px;">
          <input type="text" placeholder="Full Passenger Name" class="pax-name-input" data-seat="${seat}" value="${defaultName}" required>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <input type="number" placeholder="Age" class="pax-age-input" min="1" max="100" required>
        </div>
      </div>
    `;
  });

  const basePrice = selectedSeats.length * currentTrain.price;
  const total = basePrice + 50;

  document.getElementById('summary-seats').textContent = selectedSeats.join(', ');
  document.getElementById('summary-base').textContent = `Rs. ${basePrice}`;
  document.getElementById('summary-total').textContent = `Rs. ${total}`;
  summaryBox.classList.remove('hidden');
}

// Process payment execution
function processPayment(method) {
  if (!currentUser) {
    displayAlert('Login Required', 'Only logged-in customers can complete payment.', 'error');
    document.getElementById('auth-modal').classList.remove('hidden');
    return;
  }

  toggleLoader(true, 'Verifying gateway transaction & locking seats...');

  setTimeout(() => {
    const payload = {
      trainId: currentTrain.id,
      trainName: currentTrain.name,
      from: document.getElementById('from-station').value,
      to: document.getElementById('to-station').value,
      date: routeDate,
      seats: selectedSeats,
      passengers: passengerDetails,
      payment: { method },
      userEmail: currentUser.email
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(booking => {
        toggleLoader(false);
        rendereTicketVoucher(booking);
        displayScreen('confirmation-section');
      })
      .catch(err => {
        toggleLoader(false);
        displayAlert('Payment Failed', 'Error completing booking confirmation.', 'error');
      });
  }, 1200);
}

// Render e-Ticket voucher
function rendereTicketVoucher(booking) {
  const fromName = allStations.find(s => s.code === booking.from)?.name || booking.from;
  const toName = allStations.find(s => s.code === booking.to)?.name || booking.to;
  const infoDiv = document.getElementById('ticket-info');

  let paxRows = '';
  booking.passengers.forEach((p, idx) => {
    paxRows += `<li><strong>${idx + 1}. ${p.name}</strong> (Age ${p.age}) — <span>Seat ${p.seatNo}</span></li>`;
  });

  infoDiv.innerHTML = `
    <div class="ticket-grid-row">
      <div class="ticket-field">
        <label>PNR Code</label>
        <span id="ticket-pnr-value" style="color:var(--brand-blue);">${booking.pnr}</span>
      </div>
      <div class="ticket-field">
        <label>Train Name & Number</label>
        <span>${booking.trainName}</span>
      </div>
      <div class="ticket-field">
        <label>Route</label>
        <span>${fromName} to ${toName}</span>
      </div>
      <div class="ticket-field">
        <label>Date of Journey</label>
        <span>${booking.date}</span>
      </div>
      <div class="ticket-field">
        <label>Status</label>
        <span class="badge badge-success">${booking.status}</span>
      </div>
      <div class="ticket-field">
        <label>Total Fare</label>
        <span>Rs. ${booking.amount}</span>
      </div>
    </div>
    
    <div class="ticket-passengers-block">
      <h4 style="font-size:14px; margin-bottom:8px; color:var(--primary-navy);">Booked Passenger Manifest</h4>
      <ul style="padding-left:18px; line-height:1.8; color:var(--text-main);">
        ${paxRows}
      </ul>
    </div>
  `;
}

// Fetch booking history
function fetchBookingHistory() {
  const tbody = document.getElementById('history-table-body');

  if (!currentUser) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding:30px;">
          <p style="font-weight:700; color:var(--primary-navy); margin-bottom:10px;">Login Required</p>
          <p style="color:var(--text-muted); font-size:13px; margin-bottom:14px;">Please sign in to view your personalized booking history and ticket vouchers.</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('auth-modal').classList.remove('hidden')">Sign In / Register</button>
        </td>
      </tr>`;
    return;
  }

  const query = `?email=${encodeURIComponent(currentUser.email)}`;
  fetch(`/api/bookings${query}`)
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:24px;">No booking records found for your account.</td></tr>';
        return;
      }

      data.forEach(b => {
        const badgeClass = b.status === 'Confirmed' ? 'badge-success' : 'badge-danger';
        const fromStn = allStations.find(s => s.code === b.from)?.name || b.from;
        const toStn = allStations.find(s => s.code === b.to)?.name || b.to;

        let actions = (b.status === 'Confirmed')
          ? `<button class="btn btn-secondary btn-sm" onclick="cancelHistoryBooking('${b.pnr}')">Cancel Ticket</button>`
          : `<span style="color:var(--danger); font-weight:700; font-size:12px;">Cancelled</span>`;

        tbody.innerHTML += `
          <tr>
            <td><strong>${b.pnr}</strong></td>
            <td>${b.trainName}<br><small style="color:var(--text-muted);">${fromStn} to ${toStn}</small></td>
            <td>${b.date}</td>
            <td>${b.seats.join(', ')}</td>
            <td>Rs. ${b.amount}</td>
            <td><span class="badge ${badgeClass}">${b.status}</span></td>
            <td>${actions}</td>
          </tr>
        `;
      });
    })
    .catch(err => displayAlert('Error', 'Failed to retrieve booking history.', 'error'));
}

window.cancelHistoryBooking = function(pnr) {
  displayConfirm('Cancel Booking', `Are you sure you want to cancel ticket PNR ${pnr}? Refund will be processed immediately.`, () => {
    processCancelTicket(pnr);
  });
};

function processCancelTicket(pnr) {
  toggleLoader(true, 'Processing cancellation & refund...');
  fetch('/api/bookings/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr })
  })
    .then(res => res.json())
    .then(data => {
      toggleLoader(false);
      if (data.success) {
        displayAlert('Ticket Cancelled', `Ticket PNR ${pnr} has been successfully cancelled. Refund has been initiated.`, 'success');
        if (document.getElementById('history-section').classList.contains('hidden')) {
          displayScreen('search-section');
          setActiveTab('link-book');
        } else {
          fetchBookingHistory();
        }
      } else {
        displayAlert('Cancellation Error', data.error || 'Failed to cancel booking.', 'error');
      }
    })
    .catch(err => {
      toggleLoader(false);
      displayAlert('Server Error', 'Failed to communicate with cancellation server.', 'error');
    });
}

// Quick PNR status search
function initQuickPNR() {
  document.getElementById('pnr-quick-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pnr = document.getElementById('pnr-input-quick').value.trim();
    if (!pnr) return;

    toggleLoader(true, 'Checking PNR Status...');
    fetch(`/api/pnr/${pnr}`)
      .then(res => res.json())
      .then(data => {
        toggleLoader(false);
        if (data.error) {
          displayAlert('PNR Status', data.error, 'error');
        } else {
          rendereTicketVoucher(data);
          displayScreen('confirmation-section');
        }
      })
      .catch(err => {
        toggleLoader(false);
        displayAlert('PNR Search', 'PNR number not found.', 'error');
      });
  });
}

// Admin dashboard analytics
function fetchAdminMetrics() {
  fetch('/api/bookings')
    .then(res => res.json())
    .then(data => {
      document.getElementById('admin-stat-bookings').textContent = data.length;
      const rev = data.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + b.amount, 0);
      document.getElementById('admin-stat-revenue').textContent = `Rs. ${rev.toLocaleString()}`;

      const tbody = document.getElementById('admin-bookings-table');
      tbody.innerHTML = '';
      data.forEach(b => {
        const badgeClass = b.status === 'Confirmed' ? 'badge-success' : 'badge-danger';
        tbody.innerHTML += `
          <tr>
            <td><strong>${b.pnr}</strong></td>
            <td>${b.trainName}</td>
            <td>${b.date}</td>
            <td>Rs. ${b.amount}</td>
            <td><span class="badge ${badgeClass}">${b.status}</span></td>
          </tr>
        `;
      });
    });

  fetch('/api/stations')
    .then(() => {
      document.getElementById('admin-stat-trains').textContent = '25';
    });
}

// User Authentication (Login / Register with auto-resume)
function initAuth() {
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('btn-auth-open');
  const logoutBtn = document.getElementById('btn-logout');
  const userPill = document.getElementById('user-info-item');
  const userDisplay = document.getElementById('user-name-display');
  const closeBtn = document.getElementById('auth-modal-close');
  const tabLogin = document.getElementById('tab-auth-login');
  const tabReg = document.getElementById('tab-auth-register');
  const formLogin = document.getElementById('form-auth-login');
  const formReg = document.getElementById('form-auth-register');

  openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    formLogin.classList.remove('hidden');
    formReg.classList.add('hidden');
  });

  tabReg.addEventListener('click', () => {
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    formReg.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = data.user;
          modal.classList.add('hidden');

          userDisplay.textContent = currentUser.name;
          userPill.classList.remove('hidden');
          logoutBtn.classList.remove('hidden');
          openBtn.classList.add('hidden');

          if (currentUser.role === 'admin') {
            document.getElementById('link-admin').classList.remove('hidden');
            displayAlert('Welcome Admin', `Admin mode unlocked! Access control panel from top header navigation.`, 'success');
          } else {
            displayAlert('Welcome Back', `Logged in successfully as ${currentUser.name}. You can now proceed with booking tickets.`, 'success');
          }

          if (pendingTrainSelection) {
            const { trainId, name, price } = pendingTrainSelection;
            pendingTrainSelection = null;
            selectTrainSchedule(trainId, name, price);
          }
        } else {
          displayAlert('Login Failed', data.error || 'Invalid credentials.', 'error');
        }
      })
      .catch(err => displayAlert('Error', 'Failed to process login.', 'error'));
  });

  formReg.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-password').value,
      role: document.getElementById('reg-role').value
    };

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = data.user;
          modal.classList.add('hidden');

          userDisplay.textContent = currentUser.name;
          userPill.classList.remove('hidden');
          logoutBtn.classList.remove('hidden');
          openBtn.classList.add('hidden');

          if (currentUser.role === 'admin') {
            document.getElementById('link-admin').classList.remove('hidden');
          }
          displayAlert('Account Created', `Account created successfully! Welcome ${currentUser.name}.`, 'success');

          if (pendingTrainSelection) {
            const { trainId, name, price } = pendingTrainSelection;
            pendingTrainSelection = null;
            selectTrainSchedule(trainId, name, price);
          }
        } else {
          displayAlert('Registration Error', data.error || 'Registration failed.', 'error');
        }
      })
      .catch(err => displayAlert('Error', 'Failed to register user.', 'error'));
  });

  logoutBtn.addEventListener('click', () => {
    const userName = currentUser ? currentUser.name : 'User';
    currentUser = null;
    pendingTrainSelection = null;

    userPill.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    openBtn.classList.remove('hidden');
    document.getElementById('link-admin').classList.add('hidden');

    document.getElementById('logout-message-text').textContent = `Goodbye, ${userName}! You have been safely signed out.`;
    document.getElementById('logout-success-modal').classList.remove('hidden');

    displayScreen('search-section');
    setActiveTab('link-book');
  });
}

// Custom Modal Popups
function initCustomModals() {
  document.getElementById('btn-logout-success-ok').addEventListener('click', () => {
    document.getElementById('logout-success-modal').classList.add('hidden');
  });
  document.getElementById('btn-alert-modal-ok').addEventListener('click', () => {
    document.getElementById('custom-alert-modal').classList.add('hidden');
  });
}

function displayAlert(title, text) {
  const modal = document.getElementById('custom-alert-modal');
  document.getElementById('alert-modal-title').textContent = title;
  document.getElementById('alert-modal-text').textContent = text;
  modal.classList.remove('hidden');
}

function displayConfirm(title, text, onConfirm) {
  const modal = document.getElementById('custom-confirm-modal');
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-text').textContent = text;

  const btnYes = document.getElementById('btn-confirm-yes');
  const btnNo = document.getElementById('btn-confirm-no');

  const newYes = btnYes.cloneNode(true);
  const newNo = btnNo.cloneNode(true);
  btnYes.parentNode.replaceChild(newYes, btnYes);
  btnNo.parentNode.replaceChild(newNo, btnNo);

  newYes.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (onConfirm) onConfirm();
  });

  newNo.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.classList.remove('hidden');
}

// AI Chatbot Assistant (RailBot)
function initChatbot() {
  const fabTrigger = document.getElementById('chatbot-trigger');
  const chatWin = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  fabTrigger.addEventListener('click', () => {
    chatWin.classList.toggle('hidden');
    if (!chatWin.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => chatWin.classList.add('hidden'));

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    appendChatMessage('user', userMsg);
    chatInput.value = '';

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    })
      .then(res => res.json())
      .then(data => {
        appendChatMessage('bot', data.reply);
      })
      .catch(err => {
        appendChatMessage('bot', 'Sorry, I am having trouble connecting right now. Please try again.');
      });
  });
}

function appendChatMessage(sender, text) {
  const area = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\n/g, '<br>');
  msgDiv.innerHTML = formatted;

  area.appendChild(msgDiv);
  area.scrollTop = area.scrollHeight;
}

window.sendQuickChat = function(text) {
  document.getElementById('chat-input').value = text;
  document.getElementById('chat-form').dispatchEvent(new Event('submit'));
};

function toggleLoader(show, message = 'Processing request...') {
  const loader = document.getElementById('loader');
  if (show) {
    document.getElementById('loader-message').textContent = message;
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}
