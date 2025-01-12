import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ManageEvent.module.css';
import socket from '../../socket';

function Create1on1({ players }) {
  const [info1on1, setInfo1on1] = useState({ 'red_name': '', 'blue_name': '', 'type': '' });
  const [createMessage, setCreateMessage] = useState(null);
  const { eventId } = useParams();

  const handleChange = (field, value) => {
    setInfo1on1((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (info1on1.blue_name !== info1on1.red_name) {
      socket.off('response_create1on1');
      console.log('Create 1on1 :', info1on1);
      socket.emit('request_create1on1', { info1on1, eventId });
      socket.on('response_create1on1', (data) => {
        console.log('Received create 1on1 response:', data);
        if (data) {
          setCreateMessage({ type: 'success', text: '提交成功！' });
        } else {
          setCreateMessage({ type: 'error', text: '提交失敗，請重試。' });
        }
      })
    } else {
      setCreateMessage({ type: 'error', text: '雙方為同一個人，請重試。' });
    }
    setInfo1on1({ 'red_name': '', 'blue_name': '', 'type': '' })
    // 設置定時器，2 秒後清除訊息
    setTimeout(() => setCreateMessage(null), 2000);
  }

  return (
    <div className={styles.toggleContainer}>
      {/* 隱藏的 checkbox 控制開關 */}
      <input type="checkbox" id="toggle1on1" className={styles.toggleCheckbox} />
      {/* 按鈕標籤連結到 checkbox */}
      <label htmlFor="toggle1on1" className={styles.toggleButton}>
        新增 1on1 對戰組合
      </label>
      {/* 要顯示/隱藏的內容 */}
      <div className={styles.toggleContent}>
        <div className={styles.formContainer}>
          <label>
            紅方選手：
            <select
              value={info1on1.red_name}
              onChange={(e) => handleChange('red_name', e.target.value)}
            >
              <option value="">請選擇參賽者</option>
              {players.map((player) => (
                <option key={player.name} value={player.name}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            藍方選手：
            <select
              value={info1on1.blue_name}
              onChange={(e) => handleChange('blue_name', e.target.value)}
            >
              <option value="">請選擇參賽者</option>
              {players.map((player) => (
                <option key={player.name} value={player.name}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            比賽類型：
            <input
              type="text"
              value={info1on1.type}
              onChange={(e) => handleChange('type', e.target.value)}
              placeholder="輸入比賽類型"
            />
          </label>

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!info1on1.red_name || !info1on1.blue_name || !info1on1.type}
          >
            提交
          </button>
          {createMessage && (
            <div
              className={
                createMessage.type === 'success'
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {createMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}

export default Create1on1;