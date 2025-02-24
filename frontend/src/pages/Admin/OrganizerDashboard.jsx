import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { get_event_info, create_new_event, delete_event } from '../../Api/event';
import styles from './OrganizerDashboard.module.css'; // 匯入 CSS

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [creating, setCreating] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getEventInfo = async () => {
    const a_id = 'admin';
    const response = await get_event_info(a_id);
    setEventList(response || []);
  };

  useEffect(() => {
    getEventInfo();
  }, []);

  const createEvent = async () => {
    if (!eventName.trim()) {
      setErrorMessage('Event name cannot be empty');
      return;
    }

    setCreating(true);
    const a_id = 'admin';
    const response = await create_new_event(eventName, a_id);

    if (response.e_id) {
      await getEventInfo();
      handlePlayer(response.e_id, response.e_name);
    } else {
      setErrorMessage('Failed to create event. Please try again.');
      setCreating(false);
      return;
    }

    setEventName('');
    setCreating(false);
  };

  const deleteEvent = async (eventId) => {
    await delete_event(eventId);
    await getEventInfo();
  }

  const handlePlayer = (e_id, e_name) => {
    navigate(`/sign-up-dashboard/${e_id}/${e_name}`);
  };

  useEffect(() => {
    setErrorMessage('');
  }, [eventName]);

  if (!user) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Organizer Dashboard</h1>

      {/* Create New Event */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 防止頁面重新載入
          createEvent();
        }}
        style={{ marginBottom: "30px" }}
      >
        <h2>新增活動</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="輸入活動名稱"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "新增"}
          </button>
        </div>
        {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}
      </form>


      {/* Event List */}
      <div>
        <h2>管理活動</h2>
        {Array.isArray(eventList) && eventList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {eventList.map((event, index) => (
              <div className={styles.event_card} key={index}>
                <a
                  href={`/organizer/event/${event.e_id}/${event.name}`}
                >
                  {event.name}
                </a>
                <p>舉辦日期：{event.date}</p>
                <p>狀態：{event.champ_name === null ? '進行中' : '已完成'}</p>
                <p>
                  活動網址：
                  <a
                    href={`http://localhost:5173/participant/${event.e_id}/${event.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://localhost:5173/participant/{event.e_id}/{event.name}
                  </a>
                </p>
                <button onClick={() => handlePlayer(event.e_id, event.name)}>管理參賽者</button>
                <button onClick={() => deleteEvent(event.e_id)}>刪除活動</button>
              </div>
            ))}
          </div>
        ) : (
          <p>開始你的第一個活動😍</p>
        )}
      </div>

      {/* Logout Button */}
      <div>
        <button className={styles.logout_buttom} onClick={handleLogout}>
          登出
        </button>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
