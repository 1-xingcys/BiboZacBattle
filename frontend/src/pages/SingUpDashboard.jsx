import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get_veri_code } from '../Api/player';
import socket from '../socket';

function SignUpDashboard() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState([]); // 初始化為空表格
  const [inputName, setInputName] = useState(""); // 單獨的輸入欄位

  // 函式：自動載入參賽者資料
  const manage = (eventId) => {
    socket.off('response_player_info'); // 確保不重複綁定事件
    socket.emit('get_player', { eventId: eventId });

    socket.on('response_player_info', (data) => {
      console.log(`Event ${eventId} players:`, data);
      const formattedRows = data.map((player, index) => ({
        name: player.p_name,
        verificationCode: player.veri_code,
      }));
      setRows(formattedRows); // 更新表格內容
    });
  };

  // 使用 useEffect 在頁面載入時自動呼叫 manage
  useEffect(() => {
    manage(eventId);
  }, [eventId]); // 依賴 eventId，當 eventId 改變時重新執行

  // 手動新增參賽者
  const handleAddRow = async () => {
    const name = inputName.trim();

    if (!name) {
      setErrorMessage("Name cannot be empty");
      return;
    }

    try {
      const response = await get_veri_code(name, eventId); // 呼叫 API 獲取驗證碼
      setRows([...rows, { name, verificationCode: response.veri_code }]); // 將新資料加入表格
      setInputName(""); // 清空輸入欄位
      setErrorMessage(""); // 清除錯誤訊息
    } catch (error) {
      setErrorMessage("Failed to fetch verification code");
    }
  };

  const handleDeleteRow = (playerName) => {
    socket.emit('delete_player_info', { eventId, playerName });

    socket.on('response_delete_player', (data) => {
      if (data.success) {
        // 過濾掉已刪除的玩家資料，更新表格
        setRows((prevRows) => prevRows.filter((row) => row.name !== playerName));
      } else {
        console.error('Failed to delete player:', data.message);
      }
    });
  };

  const handleStart = () => {
    navigate('/organizer'); // 跳轉到 OrganizerDashboard 頁面
  };

  return (
    <div>
      <h1>Sign Up Dashboard</h1>
      <h2>Event Id: {eventId}</h2>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>

      {/* 姓名/綽號輸入欄 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Enter name/nickname"
          style={{ padding: '10px', fontSize: '16px', width: '300px' }}
        />
        <button
          onClick={handleAddRow}
          style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}
        >
          Enter
        </button>
      </div>

      {/* 表格 */}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>#</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Verification Code</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>{index + 1}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{row.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{row.verificationCode}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteRow(row.name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* 開始按鈕 */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Start
        </button>
      </div>
    </div>
  );
}

export default SignUpDashboard;
