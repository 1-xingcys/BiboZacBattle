import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VotePage from './Vote/VotePage';
import { get_event } from '../Api/event';

function ParticipantDashboard() {
  const { eventId } = useParams();
  const [ eventInfo, setEventInfo ] = useState({});
  const [ errorMessage, SetErrorMessage ] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const Get_event = async () => {
      try {
        const result = await get_event(eventId);
        setEventInfo(result.event);
      } catch (error) {
        SetErrorMessage(error.message || "Failed to fetch event data");
      }
    };
    if (eventId) {
      Get_event();
    }
  }, []); // 加入 eventId 作為依賴

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Id: {eventId}</h2>
      <VotePage event_id={eventId} eventInfo={eventInfo}/>
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>

  );
}

export default ParticipantDashboard;
