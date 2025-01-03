import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { creat_battle_event } from '../Api/event';
import socket from '../socket';

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [blue_side, setBlue_side] = useState('');
  const [red_side, setRed_side] = useState('');
  
  const [creatResult, setCreatResult] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVoteEnd = () => {
    const event_id = creatResult.event_id;
    socket.emit('end', { event_id });
  }

  const creatBattleEvent = async (e) => {
    e.preventDefault();
    try {
      const result = await creat_battle_event(eventName, red_side, blue_side);
      if(result.success) setCreatResult(result);
    } catch(error) {
      setCreatResult(`fail ${error}`);
    }
  }

  const handleCreate7ToSmoke = () => {
    navigate('/create-event');
  };

  if (!user) return null; // 防止未登入時直接訪問

  return (
    <div>
      <div>
        <h1>Organizer Dashboard</h1>
          <h2>Create Battle</h2>
          <form onSubmit={creatBattleEvent}>
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="Red side"
            value={red_side}
            onChange={(e) => setRed_side(e.target.value)}
          />
          v.s
          <input
            type="text"
            placeholder="Blue side"
            value={blue_side}
            onChange={(e) => setBlue_side(e.target.value)}
          />
          <br />
          <button type="submit">Create Battle Event</button>
        </form>
        {creatResult && <p>{`id: ${creatResult.event_id} url: ${creatResult.event_url}`}</p>}
        <button onClick={handleVoteEnd}>vote end</button>
      </div>
      <div>
        <button onClick={handleCreate7ToSmoke}>Create 7 to Smoke Event</button>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default OrganizerDashboard;