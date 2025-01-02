import React, { useEffect, useState } from 'react';
import socket from '../../socket';
import VoteChart from './VoteChart';


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
