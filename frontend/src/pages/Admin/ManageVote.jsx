import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import socket from '../../socket';
import styles from './ManageEvent.module.css';
import RoundLive from '../Component/RoundLive';

function ManageVote() {
  const { eventId, roundId, eventName } = useParams();
  const navigate = useNavigate();
  const [ roundStatus, setRoundStatus ] = useState({});
  const [ curVotes, setCurVotes ] = useState(null);

  useEffect(() => {
    socket.on('inform_event_status', (data) => {
      console.log(data);
      setRoundStatus(data);
      if(data.res !== "new" && data.res !== "end"){
        socket.emit('request_vote_status', {eventId, roundId});
      }
    });
    socket.on('response_vote_status', (data) => {
      setRoundStatus((prevRoundStatus) => {
        if (Object.keys(prevRoundStatus).length !== 0) {
          var filtered = data.filter((player) =>
            player.p_name !== prevRoundStatus.red_name &&
            player.p_name !== prevRoundStatus.blue_name
          );
          console.log("get vote status: ", filtered, data, prevRoundStatus);
          setCurVotes(filtered);
        } else {
          console.log("roundStatus is still empty, delaying processing...");
          setTimeout(() => socket.emit("request_vote_status", { eventId, roundId }), 100);
        }
        return prevRoundStatus;
      });
    });

    return () => {
      socket.off('response_vote_status');
      socket.off('inform_event_status');
      socket.off('response_vote_round');
      socket.off('response_compute_vote');
      socket.emit('request_event_status', { eventId });
    };
  }, []);

  const handleBack = () => {
    navigate(`/organizer/event/${eventId}/${eventName}`);
  }
  const handleStartVote = () => {
    console.log('handle start vote');
    socket.on('response_vote_round', (data) => {
      console.log(`From response_vote_round ${data}`);
      socket.emit('request_event_status', { eventId, roundId });
    });
    socket.emit('request_vote_round', { eventId, roundId });
  }
  const handleCompute = () => {
    console.log('handle compute');
    socket.on('response_compute_vote', (data) => {
      console.log(`From response_compute_vote ${data.isSuccess} ${data.result}`);
      socket.emit('request_event_status', { eventId });
    });
    socket.emit('request_compute_vote', { eventId, roundId });
  }
  const handleRestart = () => {
    socket.off('response_start_round');
    console.log(`Starting round ${roundId}`);
    
    // 發送事件到後端
    socket.emit('request_start_round', { r_id: roundId, eventId: eventId });

    // 接收後端回應
    socket.on('response_start_round', (data) => {
      console.log(`Round ${roundId} started:`, data);
      socket.emit('request_event_status', { eventId });
    });
  }
  const handleCheck = () => {
    console.log(`Check round ${roundId}`);
    socket.emit('request_check_round_result', { roundId: roundId, eventId: eventId });
  }
  const handleNext = () => {
    console.log('handle next');
  }

  return (
    <div>
      <p>Event ID: {eventId}</p>
      <p>Event Name: {eventName}</p>
      <p>Round ID: {roundId}</p>
      <p>{roundStatus.battling && `${roundStatus.red_name} v.s ${roundStatus.blue_name}`}</p>
      <div className={styles.cardButtonGroup}>
        <button onClick={handleBack} 
          className={styles.cardButton}
          disabled={roundStatus.battling && roundStatus.status === 'checking'}>
            返回
        </button>
        <button onClick={handleStartVote} 
          className={styles.cardButton} 
          disabled={!(roundStatus.battling && roundStatus.status === 'inProgress')}>
            開始投票
        </button>
        <button onClick={handleCompute} 
          className={styles.cardButton} 
          disabled={!(roundStatus.battling && roundStatus.status === 'voting')}>
            結束投票
        </button>
        <button onClick={handleCheck} 
          className={styles.cardButton} 
          disabled={!(roundStatus.battling && roundStatus.status === 'checking')}>
            確認結果
        </button>
        <button onClick={handleRestart} 
          className={styles.cardButton} 
          disabled={roundStatus.battling && roundStatus.status !== 'checking'}>
            重新開始
        </button>
        <button onClick={handleNext}
          className={styles.cardButton}
          disabled={roundStatus.battling}>
            下一個
        </button>
      </div>

      <RoundLive curRound={roundStatus} curVotes={curVotes}/>
    </div>
  );
}

export default ManageVote;