import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authentication } from '../Api/player';

function ParticipantLogin() {
  const { eventId, eventName } = useParams();
  const [ veriCode, setVeriCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authentication(eventId, veriCode);
      const userData = { username: response.name, role: 'participant' }; // 模擬用戶資訊
      login(userData);
      navigate(`/participant/${eventId}/${eventName}/${response.name}`);
    } catch (error){
      alert('Invalid verification code');
    }
  };

  return (
    <div>
      <h1>{eventName}</h1>
      <form onSubmit={handleLogin}>
        <p>請輸入驗證碼登入</p>
        <input
          type="text"
          placeholder="Verification Code（驗證碼）"
          value={veriCode}
          onChange={(e) => setVeriCode(e.target.value)}
        />
        <br />
        <button type="submit">確認</button>
      </form>
    </div>
  );
}

export default ParticipantLogin;