import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get_veri_code } from '../Api/player'; 

function SignUpDashboard() {
  const navigate = useNavigate(); // 使用 useNavigate 鉤子獲取 navigate 函式
  const { eventId } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState([{ name: "", verificationCode: "" }]);

  const handleTable = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);

    if (index === rows.length - 1 && value.trim() !== "") {
      setRows([...newRows, { name: "", verificationCode: "" }]);
    }
  };

  const handleConfirm = async (index) => {
    const name = rows[index].name.trim();

    if (!name) {
      setErrorMessage("Name cannot be empty");
      return;
    }
    try {
        const response = await get_veri_code(name, eventId); // 呼叫 API 獲取驗證碼
        const newRows = [...rows]; // 複製 rows
        newRows[index].verificationCode = response.veri_code; // 將 unique_number 賦值到對應行
        setRows(newRows); // 更新狀態
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
      
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }}></th>
            <th style={{ border: "1px solid black" }}>Name</th>
            <th style={{ border: "1px solid black" }}>Verification Code</th>
            <th style={{ border: "1px solid black" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid black", textAlign: "center" }}>{index + 1}</td> {/* 行數 */}
              <td style={{ border: "1px solid black" }}>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleTable(index, "name", e.target.value)}
                  placeholder="Enter name"
                />
              </td>
              <td style={{ border: "1px solid black" }}>
                <input
                  type="text"
                  value={row.verificationCode}
                  readOnly
                  placeholder="Verification code"
                />
              </td>
              <td style={{ border: "1px solid black" }}>
                <button onClick={() => handleConfirm(index)}>Confirm</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* 新增開始按鈕 */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Start
        </button>
      </div>

    </div>
  );
}

export default SignUpDashboard;