import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get_event_info, create_new_event } from '../Api/event'
import socket from '../socket';
import ManageEvent from './Event/ManageEvent';

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [creating, setCreating] = useState(false); // 控制按鈕狀態
  const [creatResult, setCreatResult] = useState({});
  const [eventList, setEventList] = useState([]); // 用於儲存活動資訊列表
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getEventInfo = async () => {
    try {
      const a_id = 'admin' || ''; // 根據用戶資訊獲取 a_id
      const response = await get_event_info(a_id); // 調用 API 獲取資料
      setEventList(response || []); // 如果 response 是 null，則設為空陣列
    } catch (error) {
      console.error("Failed to fetch event info:", error.message);
    }
  };
  useEffect(() => {
    getEventInfo(); // 組件載入時自動調用
  }, []);


  const createEvent = async () => {
    if (!eventName.trim()) {
      setErrorMessage('Event name cannot be empty');
      return;
    }

    setCreating(true);
    try {
      const a_id = 'admin'; // 假設 a_id 是固定的
      const response = await create_new_event(eventName, a_id); // 呼叫 API 建立新活動
      console.log(`Event created successfully: `, response);
      
      if (response.e_id) {
        await getEventInfo(); // 重新獲取活動列表
        navigate(`/sign-up-dashboard/${response.e_id}`); // 成功後跳轉到新活動頁面
      } else {
        throw new Error('Invalid response: e_id is missing');
      }
      
      setCreating(false);
    } catch (error) {
      console.error("Failed to create event:", error.message);
      setErrorMessage('Failed to create event. Please try again.');
      setCreating(false);
    }
  };
  useEffect(() => {
    setErrorMessage(''); // 清除錯誤訊息
  }, [eventName]);
  

  const handleSignUp = async () => {
    navigate(`/sign-up`);
  }

  

  if (!user) return null; // 防止未登入時直接訪問

  return (
    <div>
      <div>
        <h1>Organizer Dashboard</h1>
      </div>

      <div>
        <h2>Event List</h2>
          {Array.isArray(eventList) && eventList.length > 0 ? (
          eventList.map((event, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{event.name}</strong> <span>(ID: {event.e_id})</span>
              <br />
              日期：{event.date}
              <br />
              狀態：{event.champ_name === null ? '進行中' : '已完成'}
              <hr />
            </div>
          ))
        ) : (
          <p>No events available.</p>
        )}
      </div>
      <div>
        <h2>Create New Event</h2>
        <input
          type="text"
          placeholder="Enter event name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <button onClick={createEvent} disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button onClick={handleLogout}>Logout</button>
      </div>
      <button onClick={handleLogout}>Logout</button>

      <ManageEvent eventId={1} eventName={'Annual Dance Battle'}/>
    </div>
  );
}

export default OrganizerDashboard;
