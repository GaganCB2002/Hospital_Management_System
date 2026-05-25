# CurePulse - Smart Hospital Management System

CurePulse is a premium hospital management dashboard built with **React 19**, **Vite 8**, and **Tailwind CSS v4**. It simulates real-time data flow for four distinct user roles, persisting all changes directly to browser `localStorage`.

---

## 🔑 Quick Demo Credentials

Log in with any of the demo profiles below:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Admin** | `admin@curepulse.com` | `demo123` | Full control: revenue, scheduling, inventory |
| **Doctor** | `doctor@curepulse.com` | `demo123` | Patients list, appointments, AI Diagnostic Assistant |
| **Receptionist** | `receptionist@curepulse.com` | `demo123` | Manage online bookings, registrations, admissions |
| **Patient** | `patient@curepulse.com` | `demo123` | Live telemetry, medication tracking, clinic room |

*Note: You can also register a new patient account using the **Sign Up** tab on the login screen.*

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Run the App
```bash
# 1. Install dependencies
npm install

# 2. Start the hot-reloading dev server
npm run dev

# 3. Build for production compilation
npm run build
```
Once started, the application runs locally at `http://localhost:5173`.

---

## 🌟 Key Workspaces

- **🏥 Patient Portal**: Check daily pill compliance, symptom checkers, telehealth clinics, relative ECG monitors, and doctor lookup.
- **🥼 Doctor Portal**: View appointments queue, log patient prescriptions, and use the AI clinical summaries and prescription assistants.
- **🛎️ Receptionist Portal**: Fast check-in walk-ins, triage online appointment requests, and manage bed maps.
- **👑 Admin Portal**: Track financial revenue collections, adjust staff shifts, review audit logs, and dispatch emergency alerts.

---

## 📁 Key File Structure

```
src/
├── app/layouts/      # Global Layout Shells (Sidebar, Navbar, Dashboard shell)
├── context/          # React State Providers (Auth, Theme, Hospital Data, Notifications)
├── modules/          # Feature Pages (Dashboard views, login screen panels, landing)
├── routes/           # Router configurations and role-based route guards
└── services/         # Mock API (persists data with 120-240ms network latency simulation)
```

---

## 🔄 Project Data Flow

The following visual diagram tracks how a user request flows from routing to database simulation:

```mermaid
graph TD
    User([User / Browser]) -->|Routes request| Router[React Router AppRoutes]
    Router -->|Validates session| Guard{ProtectedRoute}
    Guard -->|Not authenticated| Login[Unified Login Panel]
    Guard -->|Authenticated| Shell[Dashboard Shell Layout]
    Shell -->|Injects state variables| DataContext[HospitalContext Provider]
    DataContext -->|Reads / Writes| MockAPI[hospitalApi REST Sim]
    MockAPI -->|Persists client data| Storage[(Browser localStorage)]
```

### Simplified Flow Explained:
1. **Authentication Guard**: Visiting a URL passes through a `ProtectedRoute`. The session is verified with `AuthContext`.
2. **Dashboard Shell & Layout**: Logged-in users load `DashboardLayout.jsx`, which wraps the `Sidebar` and dynamic sub-route `Outlet` page contents.
3. **Reactive Global State**: Page actions (like booking a slot or adding a prescription) invoke handlers inside `HospitalContext.jsx`.
4. **Mock API Storage**: State alterations flow to `hospitalApi.js`, simulating database latency, before saving to `localStorage`.

---

## 🔄 Core Project Workflows

Here is the operational workflow path for each of the four role actors:

```mermaid
graph TD
    Start([User Landing Page]) --> Select{Choose Portal}
    Select -->|Sign In / Sign Up| Auth[Unified login/signup screen]
    
    Auth -->|Role: Patient| P_Flow[Patient Workflow]
    Auth -->|Role: Doctor| D_Flow[Doctor Workflow]
    Auth -->|Role: Receptionist| R_Flow[Receptionist Workflow]
    Auth -->|Role: Admin| A_Flow[Admin Workflow]

    subgraph P_Flow ["Patient Operations"]
        P1[Dashboard Vitals] --> P2[Book Appointment]
        P2 --> P3[Check Medication Taken]
        P3 --> P4[AI Symptom Checker]
        P4 --> P5[Virtual Clinic Video Consult]
    end

    subgraph D_Flow ["Doctor Operations"]
        D1[Appointment Queue] --> D2[AI Diagnostic Assistant]
        D2 --> D3[Smart Prescribing]
        D3 --> D4[Save Consultation PDF]
    end

    subgraph R_Flow ["Receptionist Operations"]
        R1[Online Bookings Triage] --> R2[Confirm/Reject Booking]
        R2 --> R3[Walk-in Registration]
        R3 --> R4[Assign Available Bed]
    end

    subgraph A_Flow ["Admin Operations"]
        A1[Track Financial Revenue] --> A2[Doctor Shift Scheduling]
        A2 --> A3[Pharmacy Stock Levels]
        A3 --> A4[Active Emergency Alerts]
    end
```

