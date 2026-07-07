# Ignite Advance - Frontend

Welcome to the frontend repository for **Ignite Advance**, a comprehensive event management and check-in platform. This application provides a seamless experience for attendees to discover and manage events, for event organizers to manage their events and scan attendee QR codes, and for super administrators to oversee the entire platform.

## Features

This application supports multiple user roles, each with its own set of dedicated features:

### 🧑‍💻 Attendee (User)
* **Authentication**: Secure Login, Signup, and Password Reset.
* **Dashboard**: Personalized overview of upcoming and past events.
* **Discover Events**: Browse and search for new events to attend.
* **My Events**: Manage event registrations and tickets.
* **Notifications**: Stay updated with the latest event announcements.
* **Profile**: Manage personal information and preferences.

### 🏢 Organization Admin (Event Organizer)
* **Org Dashboard**: View analytics and statistics about events using interactive charts.
* **Event Management**: Create, update, and manage event details.
* **Check-In Scanner**: Built-in QR code scanner to seamlessly check-in attendees at the venue using a device's camera.

### 🛡️ Super Admin
* **Platform Dashboard**: High-level overview of all platform activity.
* **User Management**: View, manage, and moderate all users on the platform.
* **Global Event Management**: Oversee all events created across all organizations.

## Tech Stack

* **Core**: [React 19](https://react.dev/)
* **Routing**: [React Router DOM v7](https://reactrouter.com/)
* **API Requests**: [Axios](https://axios-http.com/)
* **Data Visualization**: [Recharts](https://recharts.org/)
* **QR Code Scanning & Generation**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) & [qrcode.react](https://github.com/zpao/qrcode.react)
* **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   Copy `.env.example` to `.env` (if provided) and fill in the necessary API keys and backend URLs.
   ```bash
   cp .env.example .env
   ```
   *Note: The app expects the backend API to run on `http://localhost:5000` by default (as set in the proxy configuration).*

### Running the Application

To start the development server, run:
```bash
npm start
```
The app will open automatically in your browser at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits.

### Building for Production

To build the app for production to the `build` folder, run:
```bash
npm run build
```
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

## Project Structure
* `src/pages/` - Main page components (Dashboard, Discover Events, etc.)
* `src/components/` - Reusable UI components (Modals, Forms, Navigation, etc.)
* `src/admin/` - Super Admin specific views and components
* `src/context/` - React Context providers for global state (User, Theme, Events, Toast)
* `src/services/` & `src/api/` - Backend API integration and services
* `src/hooks/` - Custom React hooks

## Testing

Launch the test runner in the interactive watch mode:
```bash
npm test
```
