# 🚆 RailBooker — Train Ticket Booking & AI Support System

A modern, full-stack Indian Railway reservation portal and intelligent support system built using **React**, **Node.js**, **Express**, and **MongoDB**.

---

## 🌟 Key Features

- **Train Search & Live Schedules**: Search schedules across 25+ major Indian railway stations with customizable dates and quota filters (General, Tatkal, Ladies, Senior Citizen).
- **Realistic Sleeper & AC Coach Layout**: Visual compartment bay layout matching Indian Railways coach structures with Lower (LB), Middle (MB), Upper (UB), Side Lower (SL), and Side Upper (SU) berth badges and a central aisle corridor.
- **Strict Authentication Guard**: Seamless search for guests with login-protected ticket booking and automatic workflow resumption after signing in.
- **Dynamic Passenger Booking & e-Tickets**: Real-time seat locking, dynamic passenger forms, simulated payment gateway (Card / UPI), and printable e-Ticket generation with unique PNR numbers.
- **Smart PNR Status Tracking**: Real-time PNR lookups with smart prefix normalization and dynamic verification fallback.
- **Booking History & Cancellations**: Track previous bookings with instant one-click ticket cancellation and automated refund handling.
- **RailBot AI Virtual Assistant**: Built-in interactive chatbot widget to check PNR status, explain cancellation/refund rules, and lookup schedules.
- **Admin Dashboard**: Manage active train routes, view system revenue metrics, and inspect all user reservations.
- **Resilient Database Architecture**: Powered by MongoDB via Mongoose ODM with an automatic in-memory fallback mechanism.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Modern CSS (Design System Variables, Flexbox/Grid)
- **Backend**: Node.js, Express.js (REST API architecture)
- **Database**: MongoDB with Mongoose ODM
- **Bundler & Tooling**: Vite, npm

---

## 📁 Project Structure

```text
Railway Project/
├── index.html          # HTML entry point
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite build & API proxy setup
├── server.js           # Express REST API, MongoDB connection & static routing
├── dist/               # Compiled React production bundle
└── src/
    ├── main.jsx        # React root initializer & ErrorBoundary
    ├── App.jsx         # Core React SPA (Auth, Booking, Search, RailBot)
    └── styles/
        └── App.css     # Design system stylesheet
