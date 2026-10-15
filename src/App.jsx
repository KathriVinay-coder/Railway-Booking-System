import React, { useState, useEffect } from 'react';

const getBerthDetails = (seatNo) => {
  const rem = seatNo % 8;
  switch (rem) {
    case 1:
    case 4:
      return { code: 'LB', label: 'Lower Berth', typeClass: 'berth-lb' };
    case 2:
    case 5:
      return { code: 'MB', label: 'Middle Berth', typeClass: 'berth-mb' };
    case 3:
    case 6:
      return { code: 'UB', label: 'Upper Berth', typeClass: 'berth-ub' };
    case 7:
      return { code: 'SL', label: 'Side Lower', typeClass: 'berth-sl' };
    case 0:
      return { code: 'SU', label: 'Side Upper', typeClass: 'berth-su' };
    default:
      return { code: 'SL', label: 'Berth', typeClass: '' };
  }
};

const DEFAULT_STATIONS = [
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

export default function App() {
  // Global Application State
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [screen, setScreen] = useState('search'); // 'search' | 'trains' | 'booking' | 'payment' | 'confirmation' | 'history' | 'admin'
  const [user, setUser] = useState(null); // { name, email, role }

  // Search State
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [presetActive, setPresetActive] = useState('tomorrow');
  const [quota, setQuota] = useState('GN');
  const [quickPnrInput, setQuickPnrInput] = useState('');

  // Trains & Booking State
  const [trains, setTrains] = useState([]);
  const [currentTrain, setCurrentTrain] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [paymentTab, setPaymentTab] = useState('card');
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [pendingTrainSelection, setPendingTrainSelection] = useState(null);

  // History & Admin State
  const [bookingHistory, setBookingHistory] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState({ bookings: 0, revenue: 0, trains: 25 });
  const [newTrain, setNewTrain] = useState({ id: '', name: '', from: '', to: '', departure: '', arrival: '', price: '' });

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('customer');

  // Custom Modal Popups State
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [logoutModal, setLogoutModal] = useState({ open: false, message: '' });
  const [loader, setLoader] = useState({ open: false, message: '' });

  // Chatbot State
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Welcome to **RailBooker Support**! I am RailBot, your virtual assistant. How can I help you today?' }
  ]);

  // Initial Load
  useEffect(() => {
    // Set default travel date to tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setTravelDate(tomorrow.toISOString().split('T')[0]);

    // Fetch stations from backend API
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Failed to load stations:', err));
  }, []);

  // Station Swap Handler
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Date Preset Handler
  const handleDatePreset = (preset) => {
    const today = new Date();
    if (preset === 'today') {
      setTravelDate(today.toISOString().split('T')[0]);
      setPresetActive('today');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      setTravelDate(tomorrow.toISOString().split('T')[0]);
      setPresetActive('tomorrow');
    }
  };

  // Search Trains Call
  const handleSearchTrains = (e) => {
    e.preventDefault();
    if (!fromStation || !toStation) {
      setAlertModal({ open: true, title: 'Stations Required', message: 'Please select both Origin and Destination stations.' });
      return;
    }
    if (fromStation === toStation) {
      setAlertModal({ open: true, title: 'Invalid Station Pair', message: 'Origin and Destination stations cannot be identical.' });
      return;
    }

    setLoader({ open: true, message: 'Searching available trains...' });
    fetch(`/api/trains?from=${fromStation}&to=${toStation}`)
      .then(res => res.json())
      .then(data => {
        setLoader({ open: false, message: '' });
        setTrains(data);
        setScreen('trains');
      })
      .catch(err => {
        setLoader({ open: false, message: '' });
        setAlertModal({ open: true, title: 'Search Error', message: 'Failed to retrieve train schedule.' });
      });
  };

  // Quick Select Popular Route
  const handleQuickRoute = (fromCode, toCode) => {
    setFromStation(fromCode);
    setToStation(toCode);
    setLoader({ open: true, message: 'Searching available trains...' });
    fetch(`/api/trains?from=${fromCode}&to=${toCode}`)
      .then(res => res.json())
      .then(data => {
        setLoader({ open: false, message: '' });
        setTrains(data);
        setScreen('trains');
      })
      .catch(err => setLoader({ open: false, message: '' }));
  };

  // Select Train Class with Strict Auth Enforcement
  const handleSelectTrainClass = (trainId, name, price) => {
    // STRICT AUTH CHECK: Only logged-in users can book tickets
    if (!user) {
      setPendingTrainSelection({ trainId, name, price });
      setAlertModal({
        open: true,
        title: 'Login Required to Book',
        message: 'Only logged-in customers can book tickets. Please sign in to your account or create a new account to select seats and proceed.'
      });
      setAuthModalOpen(true);
      return;
    }

    setCurrentTrain({ id: trainId, name, price });
    setSelectedSeats([]);
    setPassengers([]);

    setLoader({ open: true, message: 'Loading live coach seating grid...' });
    fetch(`/api/seats?trainId=${trainId}&date=${travelDate}`)
      .then(res => res.json())
      .then(seatsData => {
        setLoader({ open: false, message: '' });
        setSeats(seatsData);
        setScreen('booking');
      })
      .catch(err => {
        setLoader({ open: false, message: '' });
        setAlertModal({ open: true, title: 'Error', message: 'Unable to load coach seat map.' });
      });
  };

  // Seat Toggle
  const handleToggleSeat = (seatNo) => {
    if (selectedSeats.includes(seatNo)) {
      const updated = selectedSeats.filter(s => s !== seatNo);
      setSelectedSeats(updated);
      updatePassengerState(updated);
    } else {
      if (selectedSeats.length >= 4) {
        setAlertModal({ open: true, title: 'Seat Limit Exceeded', message: 'You can select a maximum of 4 seats per booking.' });
        return;
      }
      const updated = [...selectedSeats, seatNo].sort((a, b) => a - b);
      setSelectedSeats(updated);
      updatePassengerState(updated);
    }
  };

  const updatePassengerState = (seatList) => {
    const updatedPax = seatList.map((seat, i) => {
      const existing = passengers.find(p => p.seatNo === seat);
      return existing || { name: (i === 0 && user ? user.name : ''), age: '', seatNo: seat };
    });
    setPassengers(updatedPax);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // Submit Passenger Form -> Proceed to Payment
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!user) {
      setAlertModal({ open: true, title: 'Login Required', message: 'Only logged-in customers can book tickets.' });
      setAuthModalOpen(true);
      return;
    }
    setScreen('payment');
  };

  // Execute Mock Payment
  const handleExecutePayment = (method) => {
    if (!user) {
      setAlertModal({ open: true, title: 'Login Required', message: 'Only logged-in customers can complete payment.' });
      setAuthModalOpen(true);
      return;
    }

    setLoader({ open: true, message: 'Verifying gateway transaction & locking seats...' });
    setTimeout(() => {
      const payload = {
        trainId: currentTrain.id,
        trainName: currentTrain.name,
        from: fromStation,
        to: toStation,
        date: travelDate,
        seats: selectedSeats,
        passengers,
        payment: { method },
        userEmail: user.email
      };

      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(booking => {
          setLoader({ open: false, message: '' });
          setConfirmedTicket(booking);
          setScreen('confirmation');
        })
        .catch(err => {
          setLoader({ open: false, message: '' });
          setAlertModal({ open: true, title: 'Payment Failed', message: 'Error completing booking confirmation.' });
        });
    }, 1200);
  };

  // Quick PNR Lookup
  const handleQuickPnrSearch = (e) => {
    e.preventDefault();
    if (!quickPnrInput.trim()) return;

    setLoader({ open: true, message: 'Checking PNR Status...' });
    fetch(`/api/pnr/${quickPnrInput.trim()}`)
      .then(res => res.json())
      .then(data => {
        setLoader({ open: false, message: '' });
        if (data.error) {
          setAlertModal({ open: true, title: 'PNR Status', message: data.error });
        } else {
          setConfirmedTicket(data);
          setScreen('confirmation');
        }
      })
      .catch(err => {
        setLoader({ open: false, message: '' });
        setAlertModal({ open: true, title: 'PNR Search', message: 'PNR number not found.' });
      });
  };

  // Fetch Booking History
  const fetchHistory = () => {
    if (!user) return;
    const query = `?email=${encodeURIComponent(user.email)}`;
    fetch(`/api/bookings${query}`)
      .then(res => res.json())
      .then(data => setBookingHistory(data))
      .catch(err => console.error('Error fetching history:', err));
  };

  // Cancel Ticket
  const handleCancelTicket = (pnr) => {
    setConfirmModal({
      open: true,
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel ticket PNR ${pnr}? Refund will be processed immediately.`,
      onConfirm: () => {
        setLoader({ open: true, message: 'Processing cancellation & refund...' });
        fetch('/api/bookings/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pnr })
        })
          .then(res => res.json())
          .then(data => {
            setLoader({ open: false, message: '' });
            if (data.success) {
              setAlertModal({ open: true, title: 'Ticket Cancelled', message: `Ticket PNR ${pnr} has been successfully cancelled. Refund has been initiated.` });
              if (screen === 'history') fetchHistory();
              else setScreen('search');
            } else {
              setAlertModal({ open: true, title: 'Cancellation Error', message: data.error || 'Failed to cancel booking.' });
            }
          })
          .catch(err => {
            setLoader({ open: false, message: '' });
            setAlertModal({ open: true, title: 'Server Error', message: 'Failed to communicate with cancellation server.' });
          });
      }
    });
  };

  // Fetch Admin Metrics
  const fetchAdminData = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        const rev = data.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + b.amount, 0);
        setAdminMetrics({ bookings: data.length, revenue: rev, trains: 25 });
        setBookingHistory(data);
      });
  };

  // Admin Add Train Submit
  const handleAddTrainSubmit = (e) => {
    e.preventDefault();
    fetch('/api/admin/trains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrain)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAlertModal({ open: true, title: 'Train Added', message: `Train '${newTrain.name}' (#${newTrain.id}) successfully added to active schedule!` });
          setNewTrain({ id: '', name: '', from: '', to: '', departure: '', arrival: '', price: '' });
          fetchAdminData();
        } else {
          setAlertModal({ open: true, title: 'Add Failed', message: data.error || 'Failed to add train schedule.' });
        }
      });
  };

  // Auth Submit Handlers
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setAuthModalOpen(false);

          if (data.user.role === 'admin') {
            setAlertModal({ open: true, title: 'Welcome Admin', message: 'Admin mode unlocked! Access control panel from top header navigation.' });
          } else {
            setAlertModal({ open: true, title: 'Welcome Back', message: `Logged in successfully as ${data.user.name}. You can now proceed with booking tickets.` });
          }

          // Auto-resume pending booking selection if guest attempted prior to login
          if (pendingTrainSelection) {
            const { trainId, name, price } = pendingTrainSelection;
            setPendingTrainSelection(null);
            handleSelectTrainClass(trainId, name, price);
          }
        } else {
          setAlertModal({ open: true, title: 'Login Failed', message: data.error || 'Invalid credentials.' });
        }
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setAuthModalOpen(false);
          setAlertModal({ open: true, title: 'Account Created', message: `Account created successfully! Welcome ${data.user.name}.` });

          if (pendingTrainSelection) {
            const { trainId, name, price } = pendingTrainSelection;
            setPendingTrainSelection(null);
            handleSelectTrainClass(trainId, name, price);
          }
        } else {
          setAlertModal({ open: true, title: 'Registration Error', message: data.error || 'Registration failed.' });
        }
      });
  };

  const handleLogout = () => {
    const userName = user ? user.name : 'User';
    setUser(null);
    setPendingTrainSelection(null);
    setLogoutModal({ open: true, message: `Goodbye, ${userName}! You have been safely signed out.` });
    setScreen('search');
  };

  // Chatbot Submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    })
      .then(res => res.json())
      .then(data => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      })
      .catch(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again.' }]);
      });
  };

  const getStationName = (code) => {
    const stn = stations.find(s => s.code === code);
    return stn ? stn.name : code;
  };

  const baseFareTotal = selectedSeats.length * (currentTrain ? currentTrain.price : 0);
  const grandFareTotal = baseFareTotal + 50;

  return (
    <div>
      
      <div className="top-announcement-bar">
        <div className="container announcement-content">
          <span><strong>Notice:</strong> Tatkal bookings open at 10:00 AM (AC) & 11:00 AM (Non-AC). Zero service charge on UPI payments.</span>
          <span className="helpline">24x7 Customer Support: <strong>139</strong></span>
        </div>
      </div>

      
      <header className="main-header">
        <div className="container header-container">
          <div className="nav-brand" onClick={() => setScreen('search')}>
            <div className="logo-text">
              <span className="brand-title">RailBooker</span>
              <span className="brand-sub">Government Authorized Partner</span>
            </div>
          </div>

          <nav className="nav-links">
            <button className={`nav-item ${screen === 'search' ? 'active' : ''}`} onClick={() => setScreen('search')}>Book Ticket</button>
            <button className={`nav-item ${screen === 'history' ? 'active' : ''}`} onClick={() => { setScreen('history'); fetchHistory(); }}>My Bookings</button>
            {user && user.role === 'admin' && (
              <button className={`nav-item ${screen === 'admin' ? 'active' : ''}`} onClick={() => { setScreen('admin'); fetchAdminData(); }}>Admin Panel</button>
            )}

            {user ? (
              <>
                <div className="user-pill-container"><span className="user-pill">{user.name}</span></div>
                <button className="btn btn-logout-nav btn-sm" onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setAuthModalOpen(true)}>Login / Register</button>
            )}
          </nav>
        </div>
      </header>

      
      <main className="container main-content">
        
        
        {screen === 'search' && (
          <section className="app-screen">
            <div className="hero-card">
              <div className="hero-header">
                <div>
                  <h1>Book Train Tickets & Check Live Status</h1>
                  <p className="hero-subtitle">Fast, secure booking with instant refunds & 24/7 Support</p>
                </div>

                <div className="quick-pnr-box">
                  <form onSubmit={handleQuickPnrSearch} className="pnr-inline-form">
                    <label>Check PNR Status</label>
                    <div className="pnr-input-group">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit PNR" 
                        maxLength={10} 
                        value={quickPnrInput}
                        onChange={(e) => setQuickPnrInput(e.target.value)}
                        required 
                      />
                      <button type="submit" className="btn btn-accent btn-sm">Check Status</button>
                    </div>
                  </form>
                </div>
              </div>

              
              <div className="search-box-card">
                <form onSubmit={handleSearchTrains}>
                  <div className="search-form-grid">
                    
                    <div className="form-row-stations">
                      <div className="form-group station-group-flex">
                        <label>From Station</label>
                        <select value={fromStation} onChange={(e) => setFromStation(e.target.value)} required>
                          <option value="" disabled>Select Origin Station</option>
                          {stations.map(stn => (
                            <option key={stn.code} value={stn.code} disabled={toStation === stn.code}>
                              {stn.name} ({stn.code}) {toStation === stn.code ? '(Selected as To)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="swap-button-container">
                        <button type="button" className="btn-swap-circle" onClick={handleSwapStations} title="Swap Origin & Destination">⇆</button>
                      </div>

                      <div className="form-group station-group-flex">
                        <label>To Station</label>
                        <select value={toStation} onChange={(e) => setToStation(e.target.value)} required>
                          <option value="" disabled>Select Destination Station</option>
                          {stations.map(stn => (
                            <option key={stn.code} value={stn.code} disabled={fromStation === stn.code}>
                              {stn.name} ({stn.code}) {fromStation === stn.code ? '(Selected as From)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-options">
                      <div className="form-group option-group-flex">
                        <label>Date of Journey</label>
                        <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required />
                        <div className="date-presets">
                          <button type="button" className={`btn-chip-date ${presetActive === 'today' ? 'active' : ''}`} onClick={() => handleDatePreset('today')}>Today</button>
                          <button type="button" className={`btn-chip-date ${presetActive === 'tomorrow' ? 'active' : ''}`} onClick={() => handleDatePreset('tomorrow')}>Tomorrow</button>
                        </div>
                      </div>

                      <div className="form-group option-group-flex">
                        <label>Quota</label>
                        <select value={quota} onChange={(e) => setQuota(e.target.value)}>
                          <option value="GN">GENERAL (GN)</option>
                          <option value="TQ">TATKAL (TQ)</option>
                          <option value="LD">LADIES (LD)</option>
                          <option value="SS">SENIOR CITIZEN (SS)</option>
                        </select>
                      </div>
                    </div>

                    <div className="search-submit-row">
                      <button type="submit" className="btn btn-primary btn-lg btn-search-trains">Search Available Trains</button>
                    </div>

                  </div>
                </form>
              </div>
            </div>

            
            <div className="popular-routes-section">
              <h3 className="section-title">Popular Routes & Daily Expresses</h3>
              <div className="routes-grid">
                <div className="route-card" onClick={() => handleQuickRoute('MUM', 'DEL')}>
                  <span className="route-badge">Daily</span>
                  <div className="route-cities">Mumbai Central to New Delhi</div>
                  <div className="route-info">10+ Direct Trains | Fares from Rs.850</div>
                </div>
                <div className="route-card" onClick={() => handleQuickRoute('BLR', 'MAS')}>
                  <span className="route-badge">Shatabdi</span>
                  <div className="route-cities">Bengaluru to Chennai Central</div>
                  <div className="route-info">6 Direct Trains | Express in 5h 00m</div>
                </div>
                <div className="route-card" onClick={() => handleQuickRoute('CCU', 'DEL')}>
                  <span className="route-badge">Rajdhani</span>
                  <div className="route-cities">Kolkata Howrah to New Delhi</div>
                  <div className="route-info">Superfast Trains | Meals Included</div>
                </div>
              </div>
            </div>
          </section>
        )}

        
        {screen === 'trains' && (
          <section className="app-screen">
            <div className="section-header-card">
              <button className="btn-back-link" onClick={() => setScreen('search')}>Back to Search</button>
              <div className="route-summary-box">
                <h2>{getStationName(fromStation)} &rarr; {getStationName(toStation)}</h2>
                <p className="subtitle-text">Showing live schedule & class availability</p>
              </div>
            </div>

            <div className="trains-list">
              {trains.length === 0 ? (
                <p className="info-text">No direct trains found for this route. Please try another station pair.</p>
              ) : (
                trains.map(train => (
                  <div key={train.id} className="train-card-item">
                    <div className="train-main-info">
                      <div className="train-title-block">
                        <h3>{train.name} <span className="train-number-tag">#{train.id}</span></h3>
                        <div className="train-schedule-strip">
                          <div className="time-box">
                            <span className="time-val">{train.departure}</span>
                            <span className="stn-val">{getStationName(train.from)}</span>
                          </div>
                          <div className="duration-arrow">
                            <span>Direct</span>
                            <div className="duration-line"></div>
                            <span>Daily</span>
                          </div>
                          <div className="time-box">
                            <span className="time-val">{train.arrival}</span>
                            <span className="stn-val">{getStationName(train.to)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="train-classes-row">
                      <div className="class-box" onClick={() => handleSelectTrainClass(train.id, `${train.name} (3A)`, train.price)}>
                        <div className="class-title"><span>3 Tier AC (3A)</span></div>
                        <div className="class-price">Rs. {train.price}</div>
                        <div className="class-status">AVAILABLE</div>
                      </div>
                      <div className="class-box" onClick={() => handleSelectTrainClass(train.id, `${train.name} (2A)`, Math.round(train.price * 1.4))}>
                        <div className="class-title"><span>2 Tier AC (2A)</span></div>
                        <div className="class-price">Rs. {Math.round(train.price * 1.4)}</div>
                        <div className="class-status">AVAILABLE</div>
                      </div>
                      <div className="class-box" onClick={() => handleSelectTrainClass(train.id, `${train.name} (SL)`, Math.round(train.price * 0.5))}>
                        <div className="class-title"><span>Sleeper (SL)</span></div>
                        <div className="class-price">Rs. {Math.round(train.price * 0.5)}</div>
                        <div className="class-status">AVAILABLE</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        
        {screen === 'booking' && (
          <section className="app-screen">
            <div className="section-header-card">
              <button className="btn-back-link" onClick={() => setScreen('trains')}>Select Different Train</button>
              <div>
                <h2>Coach Layout & Passenger Details</h2>
                <p className="subtitle-text">Select up to 4 seats and enter passenger details</p>
              </div>
            </div>

            <div className="booking-grid">
              
              <div className="card coach-card">
                <div className="coach-header">
                  <div>
                    <h3>Coach Sleeper / AC Layout</h3>
                    <p className="coach-subtitle">Indian Railways Compartment Bay & Central Aisle Layout</p>
                  </div>
                  <span className="coach-type-badge">Coach S1 / B1</span>
                </div>

                <div className="seat-legend">
                  <span className="legend-item"><span className="box-legend available"></span> Available</span>
                  <span className="legend-item"><span className="box-legend occupied"></span> Booked</span>
                  <span className="legend-item"><span className="box-legend selected"></span> Selected</span>
                  <span className="legend-divider">|</span>
                  <span className="legend-item"><span className="pill-legend lb">LB</span> Lower</span>
                  <span className="legend-item"><span className="pill-legend mb">MB</span> Middle</span>
                  <span className="legend-item"><span className="pill-legend ub">UB</span> Upper</span>
                  <span className="legend-item"><span className="pill-legend sl">SL</span> Side Lower</span>
                  <span className="legend-item"><span className="pill-legend su">SU</span> Side Upper</span>
                </div>

                <div className="coach-train-wrapper">
                  <div className="coach-end-door">
                    <span>🚪 Entrance & Lavatory Area</span>
                  </div>

                  <div className="coach-bays-container">
                    {(() => {
                      const bays = [];
                      for (let i = 0; i < seats.length; i += 8) {
                        bays.push(seats.slice(i, i + 8));
                      }
                      return bays.map((baySeats, bayIndex) => {
                        const mainLeft = baySeats.slice(0, 3);
                        const mainRight = baySeats.slice(3, 6);
                        const sideBerths = baySeats.slice(6, 8);

                        return (
                          <div key={bayIndex} className="coach-bay-block">
                            <div className="bay-header-label">Bay Compartment #{bayIndex + 1}</div>

                            <div className="main-bay-compartment">
                              <div className="bench-column">
                                <div className="bench-title">Left Berth Stack</div>
                                {mainLeft.map(seat => {
                                  if (!seat || !seat.seatNo) return null;
                                  const isSelected = selectedSeats.includes(seat.seatNo);
                                  const berth = getBerthDetails(seat.seatNo);
                                  let cardClass = 'berth-card';
                                  if (!seat.isAvailable) cardClass += ' occupied';
                                  else if (isSelected) cardClass += ' selected';

                                  return (
                                    <div
                                      key={seat.seatNo}
                                      className={cardClass}
                                      onClick={() => seat.isAvailable && handleToggleSeat(seat.seatNo)}
                                    >
                                      <div className="berth-top-row">
                                        <span className="berth-number">#{seat.seatNo}</span>
                                        <span className={`berth-type-pill ${berth.typeClass}`}>{berth.code}</span>
                                      </div>
                                      <div className="berth-bottom-row">{berth.label}</div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="bench-divider">
                                <span>🪟</span>
                                <span>Window</span>
                              </div>

                              <div className="bench-column">
                                <div className="bench-title">Right Berth Stack</div>
                                {mainRight.map(seat => {
                                  if (!seat || !seat.seatNo) return null;
                                  const isSelected = selectedSeats.includes(seat.seatNo);
                                  const berth = getBerthDetails(seat.seatNo);
                                  let cardClass = 'berth-card';
                                  if (!seat.isAvailable) cardClass += ' occupied';
                                  else if (isSelected) cardClass += ' selected';

                                  return (
                                    <div
                                      key={seat.seatNo}
                                      className={cardClass}
                                      onClick={() => seat.isAvailable && handleToggleSeat(seat.seatNo)}
                                    >
                                      <div className="berth-top-row">
                                        <span className="berth-number">#{seat.seatNo}</span>
                                        <span className={`berth-type-pill ${berth.typeClass}`}>{berth.code}</span>
                                      </div>
                                      <div className="berth-bottom-row">{berth.label}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="aisle-corridor-strip">
                              <span>🚶 CENTRAL AISLE CORRIDOR</span>
                            </div>

                            <div className="side-bay-compartment">
                              <div className="side-bay-header">Side Berths (Window Side)</div>
                              <div className="side-berths-row">
                                {sideBerths.map(seat => {
                                  if (!seat || !seat.seatNo) return null;
                                  const isSelected = selectedSeats.includes(seat.seatNo);
                                  const berth = getBerthDetails(seat.seatNo);
                                  let cardClass = 'berth-card';
                                  if (!seat.isAvailable) cardClass += ' occupied';
                                  else if (isSelected) cardClass += ' selected';

                                  return (
                                    <div
                                      key={seat.seatNo}
                                      className={cardClass}
                                      onClick={() => seat.isAvailable && handleToggleSeat(seat.seatNo)}
                                    >
                                      <div className="berth-top-row">
                                        <span className="berth-number">#{seat.seatNo}</span>
                                        <span className={`berth-type-pill ${berth.typeClass}`}>{berth.code}</span>
                                      </div>
                                      <div className="berth-bottom-row">{berth.label}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="coach-end-door">
                    <span>🚪 Entrance & Lavatory Area</span>
                  </div>
                </div>
              </div>

              
              <div className="card passenger-card">
                <h3>Passenger Information</h3>
                <form onSubmit={handleProceedToPayment}>
                  {selectedSeats.length === 0 ? (
                    <p className="info-text">Please select seats from the layout to add passenger details.</p>
                  ) : (
                    passengers.map((pax, i) => (
                      <div key={pax.seatNo} className="pax-input-block">
                        <span className="pax-input-title">Passenger #{i + 1} (Seat {pax.seatNo})</span>
                        <div className="form-group" style={{ marginBottom: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="Full Passenger Name" 
                            value={pax.name} 
                            onChange={(e) => handlePassengerChange(i, 'name', e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <input 
                            type="number" 
                            placeholder="Age" 
                            min="1" 
                            max="100" 
                            value={pax.age} 
                            onChange={(e) => handlePassengerChange(i, 'age', e.target.value)} 
                            required 
                          />
                        </div>
                      </div>
                    ))
                  )}

                  {selectedSeats.length > 0 && (
                    <div className="fare-breakdown-card">
                      <h4 className="summary-title">Fare Details</h4>
                      <div className="fare-row"><span>Selected Seats:</span><strong>{selectedSeats.join(', ')}</strong></div>
                      <div className="fare-row"><span>Base Ticket Fare:</span><strong>Rs. {baseFareTotal}</strong></div>
                      <div className="fare-row"><span>IRCTC Convenience Fee:</span><strong>Rs. 50</strong></div>
                      <div className="fare-divider"></div>
                      <div className="fare-row total-row"><span>Total Amount Payable:</span><strong className="price-highlight">Rs. {grandFareTotal}</strong></div>
                      <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>Proceed to Payment</button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>
        )}

        
        {screen === 'payment' && (
          <section className="app-screen">
            <div className="section-header-card">
              <button className="btn-back-link" onClick={() => setScreen('booking')}>Back to Seat Selection</button>
              <h2>Payment Gateway Simulator</h2>
            </div>

            <div className="card payment-card">
              <div className="payment-header">
                <h3>Total Amount to Pay: Rs. {grandFareTotal}</h3>
                <p className="help-text">Choose payment method to instantly issue ticket & lock seats.</p>
              </div>

              <div className="payment-tabs">
                <button type="button" className={`tab-btn ${paymentTab === 'card' ? 'active' : ''}`} onClick={() => setPaymentTab('card')}>Credit / Debit Card</button>
                <button type="button" className={`tab-btn ${paymentTab === 'upi' ? 'active' : ''}`} onClick={() => setPaymentTab('upi')}>BHIM UPI / QR Code</button>
              </div>

              {paymentTab === 'card' ? (
                <form onSubmit={(e) => { e.preventDefault(); handleExecutePayment('Credit/Debit Card'); }} className="payment-form-panel">
                  <div className="form-group"><label>Cardholder Name</label><input type="text" placeholder="Name on Card" required /></div>
                  <div className="form-group"><label>Card Number</label><input type="text" placeholder="4111 2222 3333 4444" maxLength={19} required /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Expiry Date</label><input type="text" placeholder="MM/YY" maxLength={5} required /></div>
                    <div className="form-group"><label>CVV Code</label><input type="password" placeholder="123" maxLength={3} required /></div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg">Pay & Generate Ticket</button>
                </form>
              ) : (
                <div className="payment-form-panel">
                  <p className="text-center" style={{ marginBottom: '14px' }}>Scan with Google Pay, PhonePe, or Paytm app:</p>
                  <div className="qr-placeholder-box">
                    <div className="qr-mock-img">[ Simulated IRCTC UPI QR Code ]</div>
                  </div>
                  <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => handleExecutePayment('UPI Instant')}>Simulate Instant UPI Success</button>
                </div>
              )}
            </div>
          </section>
        )}

        
        {screen === 'confirmation' && confirmedTicket && (
          <section className="app-screen">
            <div className="ticket-receipt-card">
              <div className="ticket-top-banner">
                <div>
                  <h2>Booking Successfully Confirmed</h2>
                  <p>Your e-Ticket reservation voucher has been created and sent to your email.</p>
                </div>
              </div>

              <div className="ticket-body">
                <div className="ticket-grid-row">
                  <div className="ticket-field"><label>PNR Code</label><span style={{ color: 'var(--brand-blue)' }}>{confirmedTicket.pnr}</span></div>
                  <div className="ticket-field"><label>Train Name & Number</label><span>{confirmedTicket.trainName}</span></div>
                  <div className="ticket-field"><label>Route</label><span>{getStationName(confirmedTicket.from)} to {getStationName(confirmedTicket.to)}</span></div>
                  <div className="ticket-field"><label>Date of Journey</label><span>{confirmedTicket.date}</span></div>
                  <div className="ticket-field"><label>Status</label><span className="badge badge-success">{confirmedTicket.status}</span></div>
                  <div className="ticket-field"><label>Total Fare</label><span>Rs. {confirmedTicket.amount}</span></div>
                </div>

                <div className="ticket-passengers-block">
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--primary-navy)' }}>Booked Passenger Manifest</h4>
                  <ul style={{ paddingLeft: '18px', lineHeight: 1.8 }}>
                    {confirmedTicket.passengers.map((p, idx) => (
                      <li key={idx}><strong>{idx + 1}. {p.name}</strong> (Age {p.age}) — <span>Seat {p.seatNo}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ticket-actions-row">
                <button className="btn btn-secondary" onClick={() => window.print()}>Print Ticket</button>
                <button className="btn btn-danger" onClick={() => handleCancelTicket(confirmedTicket.pnr)}>Cancel Ticket</button>
                <button className="btn btn-primary" onClick={() => setScreen('search')}>Book Another Journey</button>
              </div>
            </div>
          </section>
        )}

        
        {screen === 'history' && (
          <section className="app-screen">
            <div className="card">
              <div className="history-header">
                <h2>My Booking History</h2>
                <p className="subtitle-text">Track, download, or cancel your active railway bookings</p>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>PNR</th>
                      <th>Train Details</th>
                      <th>Journey Date</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!user ? (
                      <tr>
                        <td colSpan={7} className="text-center" style={{ padding: '30px' }}>
                          <p style={{ fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '10px' }}>Login Required</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px' }}>Please sign in to view your personalized booking history.</p>
                          <button className="btn btn-primary btn-sm" onClick={() => setAuthModalOpen(true)}>Sign In / Register</button>
                        </td>
                      </tr>
                    ) : bookingHistory.length === 0 ? (
                      <tr><td colSpan={7} className="text-center" style={{ padding: '24px' }}>No booking records found for your account.</td></tr>
                    ) : (
                      bookingHistory.map(b => (
                        <tr key={b.pnr}>
                          <td><strong>{b.pnr}</strong></td>
                          <td>{b.trainName}<br/><small style={{ color: 'var(--text-muted)' }}>{getStationName(b.from)} to {getStationName(b.to)}</small></td>
                          <td>{b.date}</td>
                          <td>{b.seats.join(', ')}</td>
                          <td>Rs. {b.amount}</td>
                          <td><span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                          <td>
                            {b.status === 'Confirmed' ? (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleCancelTicket(b.pnr)}>Cancel Ticket</button>
                            ) : (
                              <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '12px' }}>Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        
        {screen === 'admin' && user && user.role === 'admin' && (
          <section className="app-screen">
            <div className="section-header-card">
              <div>
                <h2>System Administration Dashboard</h2>
                <p className="subtitle-text">Manage train schedules, view system bookings and revenue analytics</p>
              </div>
              <span className="admin-badge">Admin Mode</span>
            </div>

            <div className="admin-metrics-grid">
              <div className="card metric-box">
                <div><h4>{adminMetrics.bookings}</h4><p>Total Bookings</p></div>
              </div>
              <div className="card metric-box">
                <div><h4>Rs. {adminMetrics.revenue.toLocaleString()}</h4><p>Total System Revenue</p></div>
              </div>
              <div className="card metric-box">
                <div><h4>{adminMetrics.trains}</h4><p>Active Trains</p></div>
              </div>
            </div>

            <div className="booking-grid">
              <div className="card">
                <h3>Add New Train Schedule</h3>
                <form onSubmit={handleAddTrainSubmit}>
                  <div className="form-row">
                    <div className="form-group"><label>Train Number</label><input type="text" placeholder="e.g. 12953" value={newTrain.id} onChange={(e) => setNewTrain({ ...newTrain, id: e.target.value })} required /></div>
                    <div className="form-group"><label>Train Name</label><input type="text" placeholder="e.g. August Kranti Exp" value={newTrain.name} onChange={(e) => setNewTrain({ ...newTrain, name: e.target.value })} required /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>From Station</label>
                      <select value={newTrain.from} onChange={(e) => setNewTrain({ ...newTrain, from: e.target.value })} required>
                        <option value="" disabled>Select Origin</option>
                        {stations.map(stn => <option key={stn.code} value={stn.code}>{stn.name} ({stn.code})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>To Station</label>
                      <select value={newTrain.to} onChange={(e) => setNewTrain({ ...newTrain, to: e.target.value })} required>
                        <option value="" disabled>Select Destination</option>
                        {stations.map(stn => <option key={stn.code} value={stn.code}>{stn.name} ({stn.code})</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Departure Time</label><input type="text" placeholder="17:40" value={newTrain.departure} onChange={(e) => setNewTrain({ ...newTrain, departure: e.target.value })} required /></div>
                    <div className="form-group"><label>Arrival Time</label><input type="text" placeholder="10:15" value={newTrain.arrival} onChange={(e) => setNewTrain({ ...newTrain, arrival: e.target.value })} required /></div>
                  </div>
                  <div className="form-group"><label>Ticket Price (Rs.)</label><input type="number" placeholder="850" value={newTrain.price} onChange={(e) => setNewTrain({ ...newTrain, price: e.target.value })} required /></div>
                  <button type="submit" className="btn btn-primary btn-block">Add Train to System</button>
                </form>
              </div>

              <div className="card">
                <h3>All System Reservations</h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr><th>PNR</th><th>Train Name</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {bookingHistory.map(b => (
                        <tr key={b.pnr}>
                          <td><strong>{b.pnr}</strong></td>
                          <td>{b.trainName}</td>
                          <td>{b.date}</td>
                          <td>Rs. {b.amount}</td>
                          <td><span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      
      <div id="chatbot-wrapper">
        {chatbotOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div className="chatbot-title">
                <div><strong>RailBot Assistant</strong><span className="online-status">● Live AI Support</span></div>
              </div>
              <button className="chat-close-icon" onClick={() => setChatbotOpen(false)}>&times;</button>
            </div>

            <div className="chat-messages-area">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-msg ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                  {msg.text.split('\n').map((line, lIdx) => <React.Fragment key={lIdx}>{line}<br/></React.Fragment>)}
                </div>
              ))}
              <div className="chat-chips-container">
                <button className="chat-chip" onClick={() => { setChatInput('Check PNR Status'); handleChatSubmit({ preventDefault: () => {} }); }}>Check PNR</button>
                <button className="chat-chip" onClick={() => { setChatInput('Train Schedules'); handleChatSubmit({ preventDefault: () => {} }); }}>Schedules</button>
                <button className="chat-chip" onClick={() => { setChatInput('Refund Policy'); handleChatSubmit({ preventDefault: () => {} }); }}>Refund Rules</button>
                <button className="chat-chip" onClick={() => { setChatInput('How to book'); handleChatSubmit({ preventDefault: () => {} }); }}>Booking Guide</button>
              </div>
            </div>

            <form onSubmit={handleChatSubmit} className="chat-input-row">
              <input type="text" placeholder="Ask a question or enter PNR..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </div>
        )}

        <button className="chatbot-fab-btn" onClick={() => setChatbotOpen(!chatbotOpen)}>
          <span className="fab-label">RailBot AI Support</span>
        </button>
      </div>

      
      {authModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-auth-box">
            <div className="modal-header-row">
              <h3>Account Access</h3>
              <button className="chat-close-icon" onClick={() => setAuthModalOpen(false)}>&times;</button>
            </div>

            <div className="payment-tabs" style={{ marginBottom: '18px' }}>
              <button type="button" className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Login</button>
              <button type="button" className={`tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>Register</button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group"><label>Email Address</label><input type="email" placeholder="e.g. vinay@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></div>
                <div className="form-group"><label>Password</label><input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required /></div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Sign In</button>
                <p className="help-text" style={{ marginTop: '14px', textAlign: 'center' }}>Admin Demo: <code>admin@rail.com</code> | <code>admin</code></p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group"><label>Full Name</label><input type="text" placeholder="Vinay Kumar" value={regName} onChange={(e) => setRegName(e.target.value)} required /></div>
                <div className="form-group"><label>Email Address</label><input type="email" placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
                <div className="form-group"><label>Password</label><input type="password" placeholder="Create password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required /></div>
                <div className="form-group">
                  <label>Account Type</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                    <option value="customer">Passenger / Customer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Create Account</button>
              </form>
            )}
          </div>
        </div>
      )}

      
      {alertModal.open && (
        <div className="modal-overlay">
          <div className="card modal-popup-box text-center">
            <h2>{alertModal.title}</h2>
            <p>{alertModal.message}</p>
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={() => setAlertModal({ open: false, title: '', message: '' })}>OK, Got it</button>
          </div>
        </div>
      )}

      
      {confirmModal.open && (
        <div className="modal-overlay">
          <div className="card modal-popup-box text-center">
            <h2>{confirmModal.title}</h2>
            <p>{confirmModal.message}</p>
            <div className="modal-btn-row">
              <button className="btn btn-danger btn-block" onClick={() => { const cb = confirmModal.onConfirm; setConfirmModal({ open: false, title: '', message: '', onConfirm: null }); if (cb) cb(); }}>Yes, Confirm</button>
              <button className="btn btn-secondary btn-block" onClick={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      
      {logoutModal.open && (
        <div className="modal-overlay">
          <div className="card modal-popup-box text-center">
            <h2>Successfully Logged Out</h2>
            <p>{logoutModal.message}</p>
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={() => setLogoutModal({ open: false, message: '' })}>OK, Continue</button>
          </div>
        </div>
      )}

      
      {loader.open && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <p>{loader.message}</p>
          </div>
        </div>
      )}

      <footer className="main-footer">
        <div className="container footer-container">
          <p>&copy; 2026 RailBooker Technologies. Indian Railways Authorized Partner System.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Passenger Rights</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
