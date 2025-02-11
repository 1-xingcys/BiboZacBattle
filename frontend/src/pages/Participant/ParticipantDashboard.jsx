import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import MenuBar from './Component/MenuBar';
import RoundLive from '../Component/RoundLive';
import { offline } from '../../Api/player';

function ParticipantDashboard() {
  
  const { eventId, eventName } = useParams();
  const { user, logout } = useAuth();
  const [ curRound, setCurRound ] = useState('');
  const [ curVotes, setCurVotes ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('response_join', (data) => {
      console.log(data);
    });
    socket.on('response_vote_status', (data) => {
      console.log('get vote status: ', data);
      setCurVotes(data);
    });

    socket.emit('request_join', { eventId });

    socket.on('inform_event_status',  (data) => {
      console.log(data);
      setCurRound(data);
      if(data.status === 'checking'){
        socket.emit('request_vote_status', {eventId, roundId : data.r_id});      
      }
    })
    
    return () => {
      socket.off('response_vote_status');
      socket.off('response_join');
      socket.off('response_leave');
      socket.off('inform_event_status');
      socket.emit('request_event_status', { eventId });
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    socket.emit('request_leave', { eventId });
    try {
      await offline(eventId, user.username);
      logout();
      navigate(`/participant/${eventId}/${eventName}`);
    } catch (error){
      alert(`Logout FAIL: ${error}`);
    }
  };

  if (!user) return null; // 防止未登入時直接訪問

  return (
    <div>
      <MenuBar username={user.username} eventName={eventName} onLogout={handleLogout}/>
      <RoundLive curRound={curRound} curVotes={curVotes}/>
    </div>

  );
}

export default ParticipantDashboard;
