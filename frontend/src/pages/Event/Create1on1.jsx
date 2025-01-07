import React, { useState, useEffect } from 'react';
import styles from './ManageEvent.module.css';

function Create1on1( { info1on1, setInfo1on1, players, handleSubmit, createMessage } ) {
  const handleChange = (field, value) => {
    setInfo1on1((prev) => ({ ...prev, [field]: value }));
  };

  return (
   <div className={styles.formContainer}>
      <label>
        紅方選手：
        <select
          value={info1on1.red_name}
          onChange={(e) => handleChange('red_name', e.target.value)}
        >
          <option value="">請選擇選手</option>
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
          <option value="">請選擇選手</option>
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
  );
}

export default Create1on1;