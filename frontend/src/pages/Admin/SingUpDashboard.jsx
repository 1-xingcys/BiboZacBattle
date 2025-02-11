import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get_veri_code } from '../../Api/player';
import socket from '../../socket';

function SignUpDashboard() {
  const navigate = useNavigate();
  const { eventId, eventName } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState([]); // 初始化為空表格
  const [inputName, setInputName] = useState(""); // 單獨的輸入欄位

  // 函式：自動載入參賽者資料
  const manage = (eventId) => {
    socket.off('response_players'); // 確保不重複綁定事件
    socket.emit('request_players', { eventId: eventId });

    socket.on('response_players', (data) => {
      console.log(`Event ${eventId} players:`, data);
      const formattedRows = data.map((player, index) => ({
        name: player.name,
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
      <h1>報名表格</h1>
      <h2>活動名稱：{eventName}</h2>
      <h2>活動編號：{eventId}</h2>

      {/* 姓名/綽號輸入欄 */}
      <div style={{ marginBottom: '20px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // 防止頁面重新載入
            handleAddRow();
          }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="輸入名字／綽號"
            style={{ padding: "10px", fontSize: "16px", width: "300px" }}
          />
          <button
            type="submit" // 設定為提交按鈕
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368">
              <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
            </svg>
          </button>
        </form>
      </div>

      {/* 表格 */}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>#</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>名字／綽號</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>驗證碼</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>刪除</th>
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
        <button
          onClick={handleStart}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368">
            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SignUpDashboard;