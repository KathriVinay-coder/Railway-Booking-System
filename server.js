const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railway_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Seed Database Data (25 Major Indian Railway Stations)
const seedStations = [
  { code: 'MUM', name: 'Mumbai Central (MMCT)' },
  { code: 'DEL', name: 'New Delhi (NDLS)' },
  { code: 'BLR', name: 'KSR Bengaluru (SBC)' },
  { code: 'MAS', name: 'Chennai Central (MAS)' },
  { code: 'CCU', name: 'Kolkata Howrah (HWH)' },
  { code: 'HYD', name: 'Secunderabad Junction (SC)' },
  { code: 'ADI', name: 'Ahmedabad Junction (ADI)' },
  { code: 'PNBE', name: 'Patna Junction (PNBE)' },
  { code: 'JAT', name: 'Jammu Tawi (JAT)' },
  { code: 'GKP', name: 'Gorakhpur Junction (GKP)' },
  { code: 'LKO', name: 'Lucknow Charbagh (LKO)' },
  { code: 'BSB', name: 'Varanasi Junction (BSB)' },
  { code: 'JP', name: 'Jaipur Junction (JP)' },
  { code: 'PUNE', name: 'Pune Junction (PUNE)' },
  { code: 'TVC', name: 'Thiruvananthapuram Central (TVC)' },
  { code: 'CNB', name: 'Kanpur Central (CNB)' },
  { code: 'BPL', name: 'Bhopal Junction (BPL)' },
  { code: 'AGR', name: 'Agra Cantt (AGC)' },
  { code: 'GAU', name: 'Guwahati (GAU)' },
  { code: 'BBS', name: 'Bhubaneswar (BBS)' },
  { code: 'CBE', name: 'Coimbatore Junction (CBE)' },
  { code: 'NGP', name: 'Nagpur Junction (NGP)' },
  { code: 'SUR', name: 'Surat (ST)' },
  { code: 'INDB', name: 'Indore Junction (INDB)' },
  { code: 'CDG', name: 'Chandigarh Junction (CDG)' }
];

const seedTrains = [
  { id: '12951', name: 'Mumbai Rajdhani Express', from: 'MUM', to: 'DEL', departure: '17:00', arrival: '08:30', price: 950 },
  { id: '22436', name: 'New Delhi Vande Bharat', from: 'DEL', to: 'MUM', departure: '06:00', arrival: '18:15', price: 1200 },
  { id: '12628', name: 'Karnataka Superfast Express', from: 'BLR', to: 'DEL', departure: '19:15', arrival: '10:30', price: 800 },
  { id: '12028', name: 'Shatabdi Express', from: 'BLR', to: 'MAS', departure: '06:00', arrival: '11:00', price: 650 },
  { id: '12840', name: 'Howrah Mail', from: 'MAS', to: 'CCU', departure: '19:20', arrival: '23:00', price: 880 },
  { id: '12245', name: 'Duronto Express', from: 'CCU', to: 'BLR', departure: '10:50', arrival: '16:00', price: 1150 },
  { id: '12137', name: 'Punjab Mail', from: 'MUM', to: 'CCU', departure: '19:35', arrival: '07:20', price: 920 },
  { id: '12656', name: 'Navjeevan Express', from: 'MAS', to: 'MUM', departure: '10:10', arrival: '06:35', price: 780 },
  { id: '12301', name: 'Howrah Rajdhani', from: 'CCU', to: 'DEL', departure: '16:50', arrival: '10:00', price: 1350 },
  { id: '12302', name: 'Kolkata Rajdhani', from: 'DEL', to: 'CCU', departure: '16:55', arrival: '09:55', price: 1350 },
  { id: '22436', name: 'Varanasi Vande Bharat Express', from: 'BSB', to: 'DEL', departure: '15:00', arrival: '23:00', price: 1750 },
  { id: '12015', name: 'Ajmer Shatabdi Express', from: 'JP', to: 'DEL', departure: '06:00', arrival: '10:40', price: 720 },
  { id: '12124', name: 'Deccan Queen Express', from: 'PUNE', to: 'MUM', departure: '07:15', arrival: '10:25', price: 420 },
  { id: '82501', name: 'Lucknow Tejas Express', from: 'LKO', to: 'DEL', departure: '06:10', arrival: '12:25', price: 1120 },
  { id: '12393', name: 'Sampoorna Kranti Express', from: 'PNBE', to: 'DEL', departure: '19:25', arrival: '07:55', price: 910 },
  { id: '20901', name: 'Vande Bharat Express', from: 'MUM', to: 'ADI', departure: '06:00', arrival: '11:25', price: 1380 },
  { id: '20703', name: 'Secunderabad Vande Bharat', from: 'HYD', to: 'BLR', departure: '05:30', arrival: '14:00', price: 1450 },
  { id: '12058', name: 'Chandigarh Jan Shatabdi', from: 'CDG', to: 'DEL', departure: '07:40', arrival: '11:45', price: 580 },
  { id: '12346', name: 'Saraighat Express', from: 'GAU', to: 'CCU', departure: '12:20', arrival: '05:15', price: 890 },
  { id: '12019', name: 'Shatabdi Express', from: 'SUR', to: 'MUM', departure: '06:15', arrival: '09:55', price: 610 }
];

const seedUsers = [
  { name: 'System Admin', email: 'admin@rail.com', password: 'admin', role: 'admin' },
  { name: 'Vinay Kumar', email: 'vinay@example.com', password: 'user123', role: 'customer' }
];

const seedBookings = [
  {
    pnr: 'PNR982415',
    trainId: '12951',
    trainName: 'Mumbai Rajdhani Express',
    from: 'MUM',
    to: 'DEL',
    date: new Date().toISOString().split('T')[0],
    seats: [4, 5],
    passengers: [
      { name: 'Vinay Kumar', age: '24', seatNo: 4 },
      { name: 'Swati S.', age: '23', seatNo: 5 }
    ],
    amount: 1950,
    paymentMethod: 'Credit/Debit Card',
    status: 'Confirmed',
    userEmail: 'vinay@example.com',
    bookedAt: new Date().toLocaleDateString()
  }
];

// In-Memory Fallback Storage
let memoryStations = [...seedStations];
let memoryTrains = [...seedTrains];
let memoryUsers = [...seedUsers];
let memoryBookings = [...seedBookings];
let isMongoConnected = false;

// Mongoose Schemas & Models
const stationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true }
});

const trainSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  price: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }
});

const bookingSchema = new mongoose.Schema({
  pnr: { type: String, required: true, unique: true },
  trainId: { type: String, required: true },
  trainName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  seats: [{ type: Number, required: true }],
  passengers: [{ name: String, age: String, seatNo: Number }],
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Card' },
  status: { type: String, default: 'Confirmed' },
  userEmail: { type: String, required: true },
  bookedAt: { type: String, default: () => new Date().toLocaleDateString() }
});

const Station = mongoose.model('Station', stationSchema);
const Train = mongoose.model('Train', trainSchema);
const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Connect to MongoDB with Fallback
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    isMongoConnected = true;
    console.log(`Connected to MongoDB Database at ${MONGODB_URI}`);
    await seedMongoDB();
  } catch (err) {
    isMongoConnected = false;
    console.log('MongoDB server unavailable. Operating with in-memory database fallback.');
  }
}

async function seedMongoDB() {
  if (!isMongoConnected) return;
  try {
    const stationCount = await Station.countDocuments();
    if (stationCount === 0) {
      await Station.insertMany(seedStations);
      console.log('Seeded stations collection in MongoDB.');
    }

    const trainCount = await Train.countDocuments();
    if (trainCount === 0) {
      await Train.insertMany(seedTrains);
      console.log('Seeded trains collection in MongoDB.');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(seedUsers);
      console.log('Seeded users collection in MongoDB.');
    }

    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      await Booking.insertMany(seedBookings);
      console.log('Seeded bookings collection in MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding MongoDB collections:', err);
  }
}

connectMongoDB();

// API Endpoints

// 1. Get Stations
app.get('/api/stations', async (req, res) => {
  try {
    if (isMongoConnected) {
      const dbStations = await Station.find({}, { _id: 0, __v: 0 });
      return res.json(dbStations);
    }
  } catch (err) {
    console.error('Error querying MongoDB stations:', err);
  }
  res.json(memoryStations);
});

// 2. Search Trains
app.get('/api/trains', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Source and destination stations are required' });
  }

  let results = [];
  try {
    if (isMongoConnected) {
      results = await Train.find({ from, to }, { _id: 0, __v: 0 });
    } else {
      results = memoryTrains.filter(t => t.from === from && t.to === to);
    }
  } catch (err) {
    results = memoryTrains.filter(t => t.from === from && t.to === to);
  }

  // Dynamic Fallback Route Generator for unlisted station pairs
  if (results.length === 0) {
    const fromStn = (isMongoConnected ? await Station.findOne({ code: from }) : null) || memoryStations.find(s => s.code === from);
    const toStn = (isMongoConnected ? await Station.findOne({ code: to }) : null) || memoryStations.find(s => s.code === to);

    if (fromStn && toStn) {
      const fromCity = fromStn.name.split(' ')[0];
      const toCity = toStn.name.split(' ')[0];

      results = [
        {
          id: `${12000 + Math.floor(Math.random() * 8000)}`,
          name: `${fromCity} - ${toCity} Superfast Express`,
          from,
          to,
          departure: '06:30',
          arrival: '18:45',
          price: 850
        },
        {
          id: `${22000 + Math.floor(Math.random() * 8000)}`,
          name: `${fromCity} Vande Bharat Express`,
          from,
          to,
          departure: '14:15',
          arrival: '22:30',
          price: 1150
        },
        {
          id: `${12900 + Math.floor(Math.random() * 8000)}`,
          name: `${fromCity} - ${toCity} Night Mail`,
          from,
          to,
          departure: '21:00',
          arrival: '08:15',
          price: 750
        }
      ];
    }
  }

  res.json(results);
});

// 3. Get Seats with real-time seat locking
app.get('/api/seats', async (req, res) => {
  const { trainId, date } = req.query;
  if (!trainId) {
    return res.status(400).json({ error: 'Train ID is required' });
  }

  const bookedSeatNumbers = new Set();
  try {
    if (isMongoConnected) {
      const dbBookings = await Booking.find({ trainId, date, status: 'Confirmed' });
      dbBookings.forEach(b => b.seats.forEach(s => bookedSeatNumbers.add(parseInt(s))));
    } else {
      memoryBookings.forEach(b => {
        if (b.trainId === trainId && b.date === date && b.status === 'Confirmed') {
          b.seats.forEach(s => bookedSeatNumbers.add(parseInt(s)));
        }
      });
    }
  } catch (err) {
    memoryBookings.forEach(b => {
      if (b.trainId === trainId && b.date === date && b.status === 'Confirmed') {
        b.seats.forEach(s => bookedSeatNumbers.add(parseInt(s)));
      }
    });
  }

  const seats = [];
  for (let i = 1; i <= 30; i++) {
    const isBooked = bookedSeatNumbers.has(i) || (i % 7 === 0);
    seats.push({
      seatNo: i,
      isAvailable: !isBooked
    });
  }

  res.json(seats);
});

// 4. Create new ticket booking
app.post('/api/bookings', async (req, res) => {
  const { trainId, trainName, from, to, date, seats, passengers, payment, userEmail } = req.body;

  if (!seats || seats.length === 0 || !passengers || passengers.length === 0) {
    return res.status(400).json({ error: 'Seats and passenger details are required' });
  }

  let selectedTrain = { price: 850 };
  try {
    if (isMongoConnected) {
      selectedTrain = (await Train.findOne({ id: trainId })) || selectedTrain;
    } else {
      selectedTrain = memoryTrains.find(t => t.id === trainId) || selectedTrain;
    }
  } catch (err) {
    selectedTrain = memoryTrains.find(t => t.id === trainId) || selectedTrain;
  }

  const pnr = 'PNR' + Math.floor(100000 + Math.random() * 900000);
  const newBooking = {
    pnr,
    trainId: trainId || '12951',
    trainName: trainName || 'Express Train',
    from,
    to,
    date,
    seats,
    passengers,
    amount: (seats.length * selectedTrain.price) + 50,
    paymentMethod: payment ? payment.method : 'Card',
    status: 'Confirmed',
    userEmail: userEmail || 'guest@rail.com',
    bookedAt: new Date().toLocaleDateString()
  };

  try {
    if (isMongoConnected) {
      await Booking.create(newBooking);
    } else {
      memoryBookings.unshift(newBooking);
    }
  } catch (err) {
    memoryBookings.unshift(newBooking);
  }

  res.status(201).json(newBooking);
});

// 5. Get Booking History
app.get('/api/bookings', async (req, res) => {
  const { email } = req.query;
  try {
    if (isMongoConnected) {
      const query = (email && email !== 'admin@rail.com') ? { userEmail: email } : {};
      const dbBookings = await Booking.find(query, { _id: 0, __v: 0 }).sort({ _id: -1 });
      return res.json(dbBookings);
    }
  } catch (err) {
    console.error('MongoDB query error:', err);
  }

  if (email && email !== 'admin@rail.com') {
    const userBookings = memoryBookings.filter(b => b.userEmail === email);
    return res.json(userBookings);
  }
  res.json(memoryBookings);
});

// 6. Cancel Booking
app.post('/api/bookings/cancel', async (req, res) => {
  const { pnr } = req.body;
  if (!pnr) {
    return res.status(400).json({ error: 'PNR code is required' });
  }

  try {
    if (isMongoConnected) {
      const booking = await Booking.findOne({ pnr: pnr.toUpperCase() });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (booking.status === 'Cancelled') return res.status(400).json({ error: 'Booking is already cancelled' });

      booking.status = 'Cancelled';
      await booking.save();
      return res.json({ success: true, booking });
    }
  } catch (err) {
    console.error('Error cancelling in MongoDB:', err);
  }

  const memoryBooking = memoryBookings.find(b => b.pnr.toUpperCase() === pnr.toUpperCase());
  if (!memoryBooking) return res.status(404).json({ error: 'Booking not found' });
  if (memoryBooking.status === 'Cancelled') return res.status(400).json({ error: 'Booking is already cancelled' });

  memoryBooking.status = 'Cancelled';
  res.json({ success: true, booking: memoryBooking });
});

// 7. Check PNR status with normalization & fallback generator
app.get('/api/pnr/:pnr', async (req, res) => {
  let rawPnr = req.params.pnr.trim().toUpperCase();
  let searchPnr = rawPnr.startsWith('PNR') ? rawPnr : 'PNR' + rawPnr;

  try {
    if (isMongoConnected) {
      const booking = await Booking.findOne({ 
        $or: [{ pnr: rawPnr }, { pnr: searchPnr }] 
      }, { _id: 0, __v: 0 });

      if (booking) return res.json(booking);
    }
  } catch (err) {
    console.error('Error looking up PNR in MongoDB:', err);
  }

  const memoryBooking = memoryBookings.find(b => 
    b.pnr.toUpperCase() === rawPnr || b.pnr.toUpperCase() === searchPnr
  );

  if (memoryBooking) return res.json(memoryBooking);

  // Dynamic PNR status generator for demo PNR searches
  const digitsOnly = rawPnr.replace(/\D/g, '') || '982415';
  const simulatedPnr = 'PNR' + (digitsOnly.length >= 6 ? digitsOnly.substring(0, 6) : digitsOnly.padStart(6, '0'));

  const samplePnrData = {
    pnr: simulatedPnr,
    trainId: '12951',
    trainName: 'Mumbai Rajdhani Express (#12951)',
    from: 'MUM',
    to: 'DEL',
    date: new Date().toISOString().split('T')[0],
    seats: [12, 13],
    passengers: [
      { name: 'Passenger 1 (Vinay Kumar)', age: '26', seatNo: 12 },
      { name: 'Passenger 2', age: '24', seatNo: 13 }
    ],
    amount: 1950,
    paymentMethod: 'UPI Instant',
    status: 'Confirmed',
    userEmail: 'customer@irctc.co.in',
    bookedAt: new Date().toLocaleDateString()
  };

  res.json(samplePnrData);
});

// 8. User Auth (Login / Register)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    if (isMongoConnected) {
      const user = await User.findOne({ email: email.toLowerCase(), password });
      if (user) {
        return res.json({
          success: true,
          user: { name: user.name, email: user.email, role: user.role }
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error logging in with MongoDB:', err);
  }

  const memoryUser = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!memoryUser) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({
    success: true,
    user: { name: memoryUser.name, email: memoryUser.email, role: memoryUser.role }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    if (isMongoConnected) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) return res.status(400).json({ error: 'Account with this email already exists' });

      const newUser = await User.create({ name, email: email.toLowerCase(), password, role: role || 'customer' });
      return res.status(201).json({
        success: true,
        user: { name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }
  } catch (err) {
    console.error('Error registering with MongoDB:', err);
  }

  if (memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const newMemoryUser = { id: memoryUsers.length + 1, name, email, password, role: role || 'customer' };
  memoryUsers.push(newMemoryUser);

  res.status(201).json({
    success: true,
    user: { name: newMemoryUser.name, email: newMemoryUser.email, role: newMemoryUser.role }
  });
});

// 9. Admin: Add Train Schedule
app.post('/api/admin/trains', async (req, res) => {
  const { id, name, from, to, departure, arrival, price } = req.body;
  if (!id || !name || !from || !to || !price) {
    return res.status(400).json({ error: 'All train fields are required' });
  }

  const newTrain = { id, name, from, to, departure, arrival, price: parseInt(price) };
  try {
    if (isMongoConnected) {
      await Train.create(newTrain);
    } else {
      memoryTrains.push(newTrain);
    }
  } catch (err) {
    memoryTrains.push(newTrain);
  }

  res.status(201).json({ success: true, train: newTrain });
});

// 10. AI Customer Assistant Endpoint (RailBot)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const msg = message.toLowerCase().trim();

  // Pattern 1: PNR Status Search
  const pnrMatch = message.match(/PNR\d{6}/i) || message.match(/\b\d{6}\b/);
  if (pnrMatch || msg.includes('pnr') || msg.includes('status')) {
    if (pnrMatch) {
      const searchPnr = (pnrMatch[0].startsWith('PNR') ? pnrMatch[0] : 'PNR' + pnrMatch[0]).toUpperCase();
      let booking = null;
      try {
        if (isMongoConnected) {
          booking = await Booking.findOne({ pnr: searchPnr });
        }
      } catch (err) {}

      booking = booking || memoryBookings.find(b => b.pnr.toUpperCase() === searchPnr);

      if (booking) {
        const pax = booking.passengers.map(p => `${p.name} (Seat ${p.seatNo})`).join(', ');
        return res.json({
          reply: `**PNR Status Record** for \`${booking.pnr}\`:\n\n` +
                 `• **Train**: ${booking.trainName} (#${booking.trainId})\n` +
                 `• **Route**: ${booking.from} to ${booking.to}\n` +
                 `• **Date**: ${booking.date}\n` +
                 `• **Passengers**: ${pax}\n` +
                 `• **Status**: **${booking.status}**\n` +
                 `• **Total Paid**: Rs. ${booking.amount}`
        });
      } else {
        return res.json({
          reply: `I couldn't find any booking registered under PNR **${searchPnr}**. Please check your PNR code.`
        });
      }
    }
    return res.json({
      reply: `To check your PNR status, please enter your 6-digit PNR code (e.g. \`PNR982415\`).`
    });
  }

  // Pattern 2: Train Schedules & Routes
  if (msg.includes('train') || msg.includes('schedule') || msg.includes('route') || msg.includes('timing')) {
    let trainList = memoryTrains;
    try {
      if (isMongoConnected) {
        const dbTrains = await Train.find({});
        if (dbTrains.length > 0) trainList = dbTrains;
      }
    } catch (err) {}

    let summary = `**Active Train Schedules**\n`;
    trainList.forEach((t, i) => {
      const fromStn = memoryStations.find(s => s.code === t.from)?.name || t.from;
      const toStn = memoryStations.find(s => s.code === t.to)?.name || t.to;
      summary += `\n**${i + 1}. ${t.name}** (#${t.id})\n` +
                 `   Route: ${fromStn} to ${toStn}\n` +
                 `   Timings: ${t.departure} - ${t.arrival}\n` +
                 `   Fare: Rs. ${t.price}\n`;
    });
    return res.json({ reply: summary });
  }

  // Pattern 3: Cancellation & Refund Policy
  if (msg.includes('cancel') || msg.includes('refund') || msg.includes('money')) {
    return res.json({
      reply: `**Cancellation & Refund Policy**:\n\n` +
             `1. Tickets can be cancelled anytime under **'My Bookings'** or on your ticket confirmation screen.\n` +
             `2. Instant refund is credited to your original payment source.\n` +
             `3. 100% refund is issued for cancellations prior to departure time.`
    });
  }

  // Pattern 4: Booking Guide
  if (msg.includes('book') || msg.includes('seat') || msg.includes('how')) {
    return res.json({
      reply: `**Booking Instructions**:\n\n` +
             `1. Go to **Book Ticket**.\n` +
             `2. Select **From Station**, **To Station**, and **Date of Journey**.\n` +
             `3. Click **Search Trains** and select your preferred train class.\n` +
             `4. Choose available seats in the coach grid (Max 4 seats).\n` +
             `5. Fill passenger details and complete payment to get your e-Ticket.`
    });
  }

  // Greeting / Default
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('help')) {
    return res.json({
      reply: `Hello! I am **RailBot**, your customer support assistant.\n\nHow can I help you today? You can ask me to:\n- Check PNR status (e.g. \`PNR982415\`)\n- Show train schedules & fares\n- Explain refund & cancellation rules`
    });
  }

  res.json({
    reply: `I'm RailBot! You can ask me to check a PNR status (e.g. \`PNR982415\`), list train schedules, or explain ticket cancellation rules.`
  });
});

// Wildcard SPA route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://127.0.0.1:${PORT} (and http://localhost:${PORT})`);
});
