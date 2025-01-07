import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

function ManageVote() {
  const { eventId, roundId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/organizer`);
  }
  const handleCompute = () => {
    console.log('handle compute');
  }
  const handleNext = () => {
    console.log('handle next');
  }

  return (
    <div>
      <p>Event ID: {eventId}</p>
      <p>Round ID: {roundId}</p>
      <button onClick={handleBack}>
          返回
      </button>
      <button onClick={handleCompute}>
          結束投票
      </button>
      <button onClick={handleNext}>
          下一個
      </button>
    </div>
  );
}

export default ManageVote;