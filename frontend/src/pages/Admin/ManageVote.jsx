import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import socket from '../../socket';

function ManageVote() {
  const { eventId, roundId, eventName } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/organizer/event/${eventId}/${eventName}`);
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
      <p>Event Name: {eventName}</p>
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