# Dental Management Mobile (React Native + Expo)

This mobile application is a professional management tool designed for dentists to digitize clinical records and optimize appointment scheduling. Developed as a **Client** within a **Client/Server** architecture, it integrates seamless communication with a Java Spring Boot backend.

## 🏥 Project Overview
The project aims to solve the inefficiency of manual paper-based scheduling and fragmented medical records. By centralizing information, the system enhances the **Availability** and **Integrity** of patient data.

### 🛡️ Security Pillars (CIA Triad)
Following the principles of **Security Informatics I**, this app implements:
* **Confidentiality**: Secure login ensures that medical information is only accessible to authorized professionals.
* **Integrity**: Strict data validation prevents overlapping appointments and ensures accurate clinical notes.
* **Availability**: A mobile-first approach provides 24/7 access to the professional agenda.

## 🚀 Key Features
* **Interactive Appointment Calendar**: Visual management of daily and weekly schedules.
* **Digital Clinical Records**: Centralized history of treatments and consultation notes.
* **Patient Directory (US02)**: Real-time debounced searches by Name or DNI restricted to the logged-in dentist.
* **Patient CRUD Operations**: Full creations, details, modifications, and deletions with local inputs validations (Regex verification, border color validation states, and submit locking on invalid states).
* **State & Query Caching**: Server state integration using TanStack Query, optimizing data caching, loading statuses, and auto-invalidating query caches on successful modifications.

## 🛠️ Tech Stack
* **Framework**: React Native with Expo.
* **State Management**: TanStack Query (React Query) + Axios interceptors for authenticated REST requests.
* **Navigation**: Expo Router (protected stacks redirection context).
* **Styling**: NativeWind for responsive Tailwind CSS styling.

## 🏁 Getting Started

### Prerequisites
* Node.js (LTS version recommended).
* Expo Go app installed on your mobile device.

### Project Architecture
* **Routing**: Page-driven layout using Expo Router file structure (`(auth)`, `(protected)` stack contexts).
* **Screens & Components**: Screen behaviors mapped in `src/screens` and atomic reuse units (like `TextField`, `PatientCard`) in `src/components`.
* **Services & Queries**: Network actions defined under `src/services` and wrapped into custom hook queries inside `src/hooks`.