import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import styles from './ManageEvent.module.css';
import Create1on1 from './Create1on1';

function ManageEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { eventId, eventName } = useParams();

  const [rounds, setRounds] = useState([]);
  const [players, setPlayers] = useState([]);


  // 確定是否有 "inProgress" 的 round
  const isInProgress = rounds.some((round) => round.status === 'inProgress' || round.status === 'voting');

  useEffect(() => {
    socket.on('response_join', (data) => {
      console.log(data);
    });

    socket.emit('request_join', { eventId });

    socket.on('response_round', (data) => {
      console.log('Received round:', data);
      setRounds(data);
    });

    socket.on('response_players', (data) => {
      console.log('Received players:', data);
      setPlayers(data);
    });

    return () => {
      socket.off('response_join');
      socket.off('response_leave');
      socket.off('response_round');
      socket.off('response_players');
      
      socket.emit('request_rounds', { eventId });
      socket.emit('request_players', { eventId });
    };
  }, []);

  const handleStart = (roundId, eventId) => {
    socket.off('response_start_round');
    console.log(`Starting round ${roundId}`);
    
    // 發送事件到後端
    socket.emit('request_start_round', { r_id: roundId, eventId: eventId });

    // 接收後端回應
    socket.on('response_start_round', (data) => {
      console.log(`Round ${roundId} started:`, data);
    });
  };

  const handleStop = (roundId, eventId) => {
    socket.off('response_stop_round');
    socket.emit('request_stop_round', { r_id: roundId, eventId: eventId });

    socket.on('response_stop_round', (data) => {
      console.log(`Round ${roundId} stopped:`, data);
    });
  };
  
  const handleManage = (roundId, eventId) => {
    console.log(`Managing round ${roundId} in event ${eventId}`);
    // 跳轉到管理頁面或執行管理邏輯
    navigate(`/organizer/event/${eventId}/${eventName}/round/${roundId}`);
  };

  const handleBack = () => {
    socket.on('response_leave', (data) => {
      console.log(data);
    });
    socket.emit('request_leave', { eventId });
    navigate(`/organizer`);
  };

  return (
    <div>
      <label onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#5f6368"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
      </label>
      <span>{user.username}</span>

      <h1>{`${eventName} 控制中心`}</h1>
      <div className={styles.cardContainer}>
        {rounds.map((round, index) => (
          <div key={round.r_id} className={styles.card}>
            <div className={styles.cardContent}>
              <p>
                {`${index +1}. ${round.type}`}
              </p>
              <span>
                {` ${round.red_name} ${round.res === 'red' ? '(Win)' : ''} v.s 
                  ${round.blue_name} ${round.res === 'blue' ? '(Win)' : ''} ${round.res === 'tie' ? '  TIE' : ''}`}
              </span>
            </div>
            {renderButtons(round, eventId, isInProgress, handleStart, handleStop, handleManage)}
          </div>
        ))}
      </div>
      
      <div className={styles.buttonGroup}>
        <Create1on1 players={players}/>

        <div className={styles.toggleContainer}>
          <input type="checkbox" id="toggle7ToSmoke" className={styles.toggleCheckbox} />
          <label htmlFor="toggle7ToSmoke" className={styles.toggleButton}>
            新增 7 To Smoke
          </label>
          <div className={styles.toggleContent}>
            <p>開發中</p>
          </div>
        </div>

        <div className={styles.toggleContainer}>
          <input type="checkbox" id="toggleLive" className={styles.toggleCheckbox} />
          <label htmlFor="toggleLive" className={styles.toggleButton}>
          即時戰況
          </label>
          <div className={styles.toggleContent}>
            <p>開發中</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderButtons(round, eventId, isInProgress, handleStart, handleStop, handleManage) {
  if (round.status === 'inProgress' || round.status === 'voting') {
    return (
      <div className={styles.cardButtonGroup}>
        {/* 暫停按鈕 */}
        {round.status === 'inProgress' && <button
          className={styles.cardButton}
          onClick={() => handleStop(round.r_id, eventId)}
        >
          取消
        </button>}

        {/* 管理按鈕 */}
        <button
          className={styles.cardButton}
          onClick={() => handleManage(round.r_id, eventId)}
        >
          管理
        </button>
      </div>
    );
  } else {
    return (
      <button
        className={styles.cardButton}
        onClick={() => handleStart(round.r_id, eventId)}
        disabled={isInProgress && round.status !== 'inProgress'}
      >
        {round.res === 'nan' ? '開始' : '重新開始'}
      </button>
    );
  }
};

export default ManageEvent;