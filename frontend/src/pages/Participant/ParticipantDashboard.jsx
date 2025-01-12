import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';

function ParticipantDashboard() {
  const { eventId, eventName } = useParams();
  const [ errorMessage, SetErrorMessage ] = useState("");
  const { user, logout } = useAuth();
  const [ curRound, setCurRound] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('response_join', (data) => {
      console.log(data);
    });

    socket.emit('request_join', { eventId });

    socket.on('inform_event_status',  (data) => {
      console.log(data);
      setCurRound(data);
    })
    
    return () => {
      socket.off('response_join');
      socket.off('response_leave');
      socket.off('inform_event_status');
      socket.emit('request_event_status', { eventId });
    };
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    socket.emit('request_leave', { eventId });
    logout();
    navigate(`/participant/${eventId}/${eventName}`);
  };

  if (!user) return null; // 防止未登入時直接訪問

  return (
    <div>
      <h2>{eventName}</h2>
      <h3>您好！{user.username}</h3>
      <div>
        {curRound.battling && 
          <p>{`${curRound.red_name} v.s ${curRound.blue_name}`}</p>
        }
        <p>{RenderStatus({ curRound })}</p>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>

  );
}

function RenderStatus({ curRound }) {
  if(!curRound.battling) return '等待對戰開始...';
  else if(curRound.status === 'inProgress') return '對戰中';
  else if(curRound.status === 'voting') return '投票中';
  else if(curRound.status === 'checking') return '投票完成，等待確認中...';
  else return '不知道';
}

export default ParticipantDashboard;
