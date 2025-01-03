import React, { useState } from 'react';
import { creat_7_to_smoke } from '../Api/event';

function Create7ToSmoke() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');

  const [creatResult, setCreatResult] = useState({});

  const handleAddParticipant = () => {
    if (name.trim()) {
      setParticipants([...participants, name]);
      setName('');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const result = await creat_7_to_smoke(participants);
      if(result.success) setCreatResult(result);
    } catch(error) {
      setCreatResult(`fail ${error}`);
    }
    
    console.log('Creating event with participants:', participants);
  };

  return (
    <div>
      <h1>Create 7 to Smoke Event</h1>
      <input
        type="text"
        value={name}
        placeholder="Enter participant name"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAddParticipant}>Add Participant</button>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <button onClick={handleCreateEvent}>Create Event</button>
      {creatResult && <p>{`url: ${creatResult.event_url}`}</p>}
    </div>
  );
}

export default Create7ToSmoke;
