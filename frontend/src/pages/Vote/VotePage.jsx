import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import VoteChart from './VoteChart';


// 初始化 WebSocket 連線
const socket = io('http://localhost:5002'); // 後端 WebSocket 伺服器的地址

function VotePage({ event_id, eventInfo }) {
  const [voted, setVoted] = useState(false);

  const handleVote = (option) => {
    if (!voted) {
      socket.emit('vote', { option, event_id }); // 發送投票請求到後端
      setVoted(true); // 標記用戶已投票
    } else {
      alert('You have already voted!');
    }
  };

  return (
    <div>
      <h1>{`${eventInfo.red_side} v.s ${eventInfo.blue_side}`}</h1>
      <div>
        {!voted && <button onClick={() => handleVote(eventInfo.red_side)}>Vote for {eventInfo.red_side}</button>}
        {!voted && <button onClick={() => handleVote(eventInfo.blue_side)}>Vote for {eventInfo.blue_side}</button>}
      </div>
      <VoteChart event_id={event_id} eventInfo={eventInfo}/> {/* 嵌入圖表 */}
    </div>
  );
}

export default VotePage;
