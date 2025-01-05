import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import OrganizerDashboard from './pages/OrganizerDashboard'
import ParticipantDashboard from './pages/ParticipantDashboard';
import Create7ToSmoke from './pages/Create7ToSmoke';
import SignUp from './pages/SingUpDashboard';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  return user && user.role === role ? children : <Navigate to="/" />;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute role="organizer">
              <Create7ToSmoke />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <ProtectedRoute role="organizer">
              <SignUp />
            </ProtectedRoute>
          }
        />
        <Route path="/event/:eventId" element={<ParticipantDashboard />} />
      </Routes>
    </Router>
  );
}


export default App;
