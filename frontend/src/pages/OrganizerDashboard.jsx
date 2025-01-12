import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get_event_info, create_new_event } from '../Api/event';
import './OrganizerDashboardCSS.css'; // 匯入 CSS

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [creating, setCreating] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getEventInfo = async () => {
    try {
      const a_id = 'admin';
      const response = await get_event_info(a_id);
      setEventList(response || []);
    } catch (error) {
      console.error('Failed to fetch event info:', error.message);
    }
  };

  useEffect(() => {
    getEventInfo();
  }, []);

  const createEvent = async () => {
    if (!eventName.trim()) {
      setErrorMessage('Event name cannot be empty');
      return;
    }

    setCreating(true);
    try {
      const a_id = 'admin';
      const response = await create_new_event(eventName, a_id);

      if (response.e_id) {
        await getEventInfo();
        handlePlayer(response.e_id, response.e_name);
      } else {
        throw new Error('Invalid response: e_name is missing');
      }

      setEventName('');
      setCreating(false);
    } catch (error) {
      console.error('Failed to create event:', error.message);
      setErrorMessage('Failed to create event. Please try again.');
      setCreating(false);
    }
  };

  const handlePlayer = (e_id, e_name) => {
    navigate(`/sign-up-dashboard/${e_id}/${e_name}`);
  };

  useEffect(() => {
    setErrorMessage('');
  }, [eventName]);

  if (!user) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Organizer Dashboard</h1>

      {/* Create New Event */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Create New Event</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <button onClick={createEvent} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
      </div>

      {/* Event List */}
      <div>
        <h2>Event List</h2>
        {Array.isArray(eventList) && eventList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {eventList.map((event, index) => (
              <div className="event-card" key={index}>
                <a
                  href={`/organizer/event/${event.e_id}/${event.name}`}
                >
                  {event.name}
                </a>
                <p>Date：{event.date}</p>
                <p>Status：{event.champ_name === null ? '進行中' : '已完成'}</p>
                <p>
                  活動網址：
                  <a
                    href={`http://localhost:5173/participant/${event.e_id}/${event.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://localhost:5173/participant/{event.e_id}/{event.name}
                  </a>
                </p>
                <button onClick={() => handlePlayer(event.e_id, event.name)}>管理參賽者</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No events available.</p>
        )}
      </div>

      {/* Logout Button */}
      <div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
