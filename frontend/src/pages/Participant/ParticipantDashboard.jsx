import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import styles from './Participant.module.css';

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
      <h2 className={styles.h2}>{eventName}</h2>
      <h3 className={styles.h3}>您好！{user.username}</h3>
      <div className={styles.contentContainer}>
        {curRound.battling && 
          <p>{`${curRound.red_name} v.s ${curRound.blue_name}`}</p>
        }
        <RenderStatus curRound={curRound} />
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>

  );
}


function RenderStatus({ curRound }) {
  if(!curRound.battling) return <ShowWatingRound/>;
  else if(curRound.status === 'inProgress') return <ShowBattling/>;
  else if(curRound.status === 'voting') return <ShowVoting curRound={curRound}/>;
  else if(curRound.status === 'checking') return <ShowVoteResult/>;
  else return <p>不知道</p>;
}

function ShowWatingRound() {
  return (
    <div>等待對戰中...</div>
  );
}

function ShowBattling() {

  return (
    <div>正在對戰中</div>
  );
}

function ShowVoting({ curRound }) {
  const { user } = useAuth();
  const [isVote, setIsVote] = useState(false);
  const { eventId } = useParams();

  const handleVote = (side) => {
    setIsVote(true);
    socket.off('response_player_vote');
    socket.emit('reqest_player_vote', {eventId: eventId, roundId: curRound.r_id, username: user.username, side: side});
    socket.on('response_player_vote', (data) => {
      console.log(data);
      if(!data) setIsVote(false);
    });
  }

  return (
    <div>
      {!isVote ? (
        <>
          <button className={styles.voteButton} onClick={() => handleVote('red')} disabled={isVote}>{curRound.red_name}</button>
          <button className={styles.voteButton} onClick={() => handleVote('blue')} disabled={isVote}>{curRound.blue_name}</button>
          <button className={styles.voteButton} onClick={() => handleVote('tie')} disabled={isVote}>TIE</button>
        </>
      ) : (
        <p>您已投票，感謝您的參與！</p>
      )}
    </div>
  );
}

function ShowVoteResult() {
  return (
    <div>投票結果</div>
  );
}

export default ParticipantDashboard;
