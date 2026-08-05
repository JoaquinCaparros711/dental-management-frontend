# Dental Management Mobile App (React Native + Expo) 🦷📱

A modern, cross-platform mobile application for dentists to manage patient directories, schedule appointments, and maintain digital clinical histories on the go. Developed as the **Client** in a **Client/Server** architecture connecting to a Java Spring Boot REST API. 

This project was built for the **Programming II** and **Security Informatics I** courses at **Universidad de Mendoza (UM)**.

---

## 🎯 Project Overview & Problem Solved

Traditional dental practices often rely on physical paper charts and manual appointment books, causing data fragmentation, scheduling overlaps, and difficulty tracking patient history over time.

This mobile application digitizes and centralizes clinic operations into a secure, intuitive mobile workflow:
* **Centralized Agenda:** Real-time visibility into daily and weekly appointments.
* **Instant History Access:** Immediate consultation of patient treatment evolutions.
* **Mobile-First Convenience:** Full clinic management from any iOS or Android device.

---

## 🛡️ Security & Information Pillars (CIA Triad)

Aligned with **Security Informatics** principles:
* **Confidentiality:** Mandatory authentication via JSON Web Tokens (JWT). Tokens are stored in hardware-encrypted native storage using `expo-secure-store`. Automatic session invalidation occurs upon 401 Unauthorized responses.
* **Integrity:** Strict input validation (regex checks for DNI, phone, and names), query cache invalidation on mutations, and backend synchronization prevent corrupted records or overlapping appointments.
* **Availability:** Server state caching via TanStack Query optimizes network data retrieval, enabling fast screen renders and resilient data availability.

---

## 🚀 Key Features & App Modules

1. **Authentication Flow:**
   - Dentist registration and secure login.
   - Encrypted local token storage (`expo-secure-store`) with automated auth guard routing.

2. **Dashboard (`HomeScreen`):**
   - Summary overview of daily scheduled turnos.
   - Quick navigation shortcuts to patient registration, appointment creation, and directory search.

3. **Patient Directory (`PatientDirectoryScreen`):**
   - Real-time debounced searching by Patient Name or DNI.
   - Per-dentist isolated patient records.
   - Quick access cards leading to patient details, edits, or clinical history.

4. **Patient Management & Form Validation (`PatientFormScreen`):**
   - Add and edit patient details with real-time UI field validation (border color indicators and submit locking for invalid states).

5. **Interactive Calendar & Appointment Management (`AppointmentCalendarScreen` & `AppointmentFormScreen`):**
   - Interactive date selector and agenda schedule.
   - Schedule new appointments with date/time pickers and patient selection.
   - Change appointment status (`SCHEDULED`, `CANCELLED`, `COMPLETED`).
   - Completing an appointment opens a completion modal to record evolution notes, automatically generating a new `ClinicalRecord` on the backend.

6. **Digital Clinical History (`PatientClinicalHistoryScreen`):**
   - Timeline view of a patient's historical medical evolutions and treatment notes.
   - Ability to add manual evolution entries at any time.

---

## 🛠️ Tech Stack & Dependencies

* **Framework:** React Native 0.81.5 with **Expo SDK 54** (React 19)
* **Routing:** **Expo Router 6** (File-based routing with `(auth)` and `(protected)` layout groups)
* **State Management & Caching:** **TanStack Query v5** (React Query)
* **HTTP Client:** **Axios** with request token interceptors and response auth handlers
* **Styling:** **NativeWind v4** (Tailwind CSS 3.4 for React Native)
* **Secure Storage:** `expo-secure-store`
* **Icons & Fonts:** `@expo/vector-icons`, `@expo-google-fonts/montserrat`

---

## 📁 Project Architecture

```text
src/
├── api/          # Axios instance configured with base URL & JWT interceptors
├── app/          # Expo Router page layouts ((auth), (protected), _layout.tsx)
├── components/   # Reusable UI components (TextField, Cards, Modals, Buttons)
├── hooks/        # Custom React Query hooks (usePatients, useAppointments, etc.)
├── navigation/   # Auth guard navigation handlers & routing helpers
├── screens/      # Feature screens (Login, Home, Directory, Calendar, History)
├── services/     # API endpoint service layer calls
├── storage/      # Secure store wrapper for JWT persistence
└── types/        # TypeScript interfaces and data models
```

---

## 🏁 Getting Started & Setup

### Prerequisites
* **Node.js** (LTS recommended, version 18+).
* **Expo Go** app installed on your physical device (iOS/Android) OR an Android Emulator / iOS Simulator.
* **Backend running:** Ensure the Java Spring Boot backend (`dental-management-backend`) is up and running on port `8080`.

### Installation Steps

1. **Clone the repository and install dependencies:**
   ```bash
   cd dental-management-frontend
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   By default, the app targets `http://localhost:8080/api/v1` (or `http://10.0.2.2:8080/api/v1` when running on Android Emulator).
   To specify a custom backend URL, create a `.env` file:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8080/api/v1
   ```

3. **Start the Expo Development Server:**
   ```bash
   npm run start
   ```
   Or run directly on target platform:
   ```bash
   # For Android Emulator
   npm run android

   # For iOS Simulator
   npm run ios

   # For Web preview
   npm run web
   ```

4. **Scan the QR Code:**
   Scan the terminal QR code using the **Expo Go** app on your physical mobile device connected to the same Wi-Fi network.