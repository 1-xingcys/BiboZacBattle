import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get_veri_code } from '../Api/player';

function SignUpDashboard() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState([]); // 初始化為空表格
  const [inputName, setInputName] = useState(""); // 單獨的輸入欄位

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

  const handleStart = () => {
    navigate('/organizer'); // 跳轉到 OrganizerDashboard 頁面
  };

  return (
    <div>
      <h1>Sign Up Dashboard</h1>
      <h2>Event Id: {eventId}</h2>

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
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>{index + 1}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{row.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{row.verificationCode}</td>
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
