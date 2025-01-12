import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Admin/Login';
import OrganizerDashboard from './pages/Admin/OrganizerDashboard'
import ParticipantDashboard from './pages/Participant/ParticipantDashboard';
import ParticipantLogin from './pages/Participant/ParticipantLogin';
import SignUpDashboard from './pages/Admin/SingUpDashboard';
import ManageEvent from './pages/Admin/ManageEvent';
import ManageVote from './pages/Admin/ManageVote';

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
        <Route path="/sign-up-dashboard/:eventId/:eventName" element={<SignUpDashboard />} />
        <Route 
          path="/organizer/event/:eventId/:eventName/round/:roundId" element={
            <ProtectedRoute role="organizer">
              <ManageVote/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/organizer/event/:eventId/:eventName" element={
            <ProtectedRoute role="organizer">
              <ManageEvent/>
            </ProtectedRoute>
          } 
        />
        <Route path="/participant/:eventId/:eventName" element={<ParticipantLogin />} />
        <Route path="/participant/:eventId/:eventName/:username" element={<ParticipantDashboard />} />
      </Routes>
    </Router>
  );
}


export default App;
