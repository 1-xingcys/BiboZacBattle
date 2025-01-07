import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import styles from './ManageEvent.module.css';
import Create1on1 from './Create1on1';

function ManageEvent( {eventId, eventName} ) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rounds, setRounds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [info1on1, setInfo1on1] = useState({'red_name': '', 'blue_name': '', 'type': ''});


  const [createResult, setCreateResult] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);

  // 確定是否有 "inProgress" 的 round
  const isInProgress = rounds.some((round) => round.status === 'inProgress');

  useEffect(() => {
    socket.on('response_round', (data) => {
      console.log('Received round:', data);
      setRounds(data);
    });

    socket.on('response_players', (data) => {
      console.log('Received players:', data);
      setPlayers(data);
    });

    return () => {
      socket.off('response_round');
      socket.off('response_players');
      socket.emit('request_rounds', { eventId });
      socket.emit('request_players', { eventId});
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
    navigate(`/organizer/event/:${eventId}/round/:${roundId}`);
  };

  const handleSubmitCreate1on1 = () => {
    socket.off('response_create1on1');
    console.log('Create 1on1 :', info1on1);
    socket.emit('request_create1on1', { info1on1, eventId });
    socket.on('response_create1on1', (data) =>{
      console.log('Received create 1on1 response:', data);
      setCreateResult(data);
      if(data){
        setCreateMessage({ type: 'success', text: '提交成功！' });
      } else {
        setCreateMessage({ type: 'error', text: '提交失敗，請重試。' });
      }
    })
    setInfo1on1({'red_name': '', 'blue_name': '', 'type': ''})
    // 設置定時器，3 秒後清除訊息
    setTimeout(() => setCreateMessage(null), 3000);
  }

  return (
    <div>
      <h1>{`${user.username} ${eventName} 控制中心`}</h1>
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
        <div className={styles.toggleContainer}>
          {/* 隱藏的 checkbox 控制開關 */}
          <input type="checkbox" id="toggle1on1" className={styles.toggleCheckbox} />
          {/* 按鈕標籤連結到 checkbox */}
          <label htmlFor="toggle1on1" className={styles.toggleButton}>
            新增 1on1 對戰組合
          </label>
          {/* 要顯示/隱藏的內容 */}
          <div className={styles.toggleContent}>
            <Create1on1 info1on1={info1on1} setInfo1on1={setInfo1on1} players={players} handleSubmit={handleSubmitCreate1on1} createMessage={createMessage}/>
          </div>
        </div>

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
  if (round.status === 'inProgress') {
    return (
      <div className={styles.buttonGroup}>
        {/* 暫停按鈕 */}
        <button
          className={styles.cardButton}
          onClick={() => handleStop(round.r_id, eventId)}
        >
          取消
        </button>

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