# Dental Management Mobile (React Native + Expo)
This mobile application is a professional management tool designed for odontologists to digitize clinical records and optimize appointment scheduling. Developed as a **Client** within a **Client/Server** architecture, it integrates seamless communication with a Java Spring Boot backend.

## 🏥 Project Overview
The project aims to solve the inefficiency of manual paper-based scheduling and fragmented medical records. [cite_start]By centralizing information, the system enhances the **Availability** and **Integrity** of patient data[cite: 44, 53].

### 🛡️ Security Pillars (CIA Triad)
Following the principles of **Security Informatics I**, this app implements:
* **Confidentiality**: Secure login ensures that medical information is only accessible to authorized professionals.
* **Integridad**: Strict data validation prevents overlapping appointments and ensures accurate clinical notes.
* [cite_start]**Disponibilidad**: A mobile-first approach provides 24/7 access to the professional agenda[cite: 53].

## 🚀 Key Features
* **Interactive Appointment Calendar**: Visual management of daily and weekly schedules.
* **Digital Clinical Records**: Centralized history of treatments and consultation notes.
* **Real-time Patient Search**: Quick access to patient profiles via Name or DNI.
* **Internal Agenda Notifications**: Morning summaries of the day's scheduled patients.

## 🛠️ Tech Stack
* **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/).
* **State Management**: React Hooks (`useState`, `useEffect`).
* **Navigation**: React Navigation for seamless screen transitions.
* **Communication**: REST API using JSON for data exchange.

## 🏁 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (LTS version recommended).
* [Expo Go](https://expo.dev/go) app installed on your mobile device.

### 🏗️ Architecture
* The application follows the MVC pattern (View layer) and is based on a Component-driven design.