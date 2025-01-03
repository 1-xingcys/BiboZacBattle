import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { io } from 'socket.io-client';
import { colors, fontStyles, layoutStyles } from './chartStyle';

// 註冊 Chart.js 必需的組件
ChartJS.register(ChartDataLabels, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const socket = io('http://localhost:5002');

function VoteChart({ event_id, eventInfo }) {
  const [voteCount, setVoteCount] = useState(eventInfo.votes || {});
  const [battleResult, setBattleResult] = useState({});

  useEffect(() => {
    socket.on('voteUpdate', (data) => {
      console.log('Received vote update:', data);
      setVoteCount(data);
    });

    socket.on('voteEnd', (res) => {
      console.log('Vote End: ', res);
      setBattleResult(res);
    });

    return () => {
      socket.off('voteUpdate');
      socket.off('voteEnd');
      socket.emit('enter', { event_id });
    };
  }, []);

  const renderBattleContent = () => {
    if (labels.length === 0) {
      return <p>Loading votes...</p>;
    }
  
    if (battleResult.result) {
      if(battleResult.result === "TIE") return <h2>TIE!</h2>;
      return <h2>{`${battleResult.winner} Win!`}</h2>;
    } 
    return <Bar data={data} options={options} />;
  };

  // 確保 labels 和 data 不會因 voteCount 為空而出錯
  const labels = Object.keys(voteCount || {});
  const dataValues = Object.values(voteCount || {});

  const data = {
    labels,
    datasets: [
      {
        label: 'Votes',
        data: dataValues,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    layout: layoutStyles, // 使用模組化的佈局配置
    plugins: {
      title: {
        display: false,
        text: 'Real-Time Voting Results',
        font: fontStyles.defaultFont, // 使用模組化的字體配置
      },
      legend: {
        display: false,
        position: 'top',
      },
      datalabels: {
        display: true, // 顯示數據標籤
        color: '#000', // 標籤文字顏色
        anchor: 'middle', // 將標籤定位在 bar 的末端
        align: 'center', // 將標籤對齊到 bar 的上方
        font: {
          size: 100,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: fontStyles.defaultFont.color,
          font: fontStyles.defaultFont,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
          color: '#e0e0e0',
          lineWidth: 1,
        },
        ticks: {
          display: false,
          color: fontStyles.defaultFont.color,
          font: fontStyles.defaultFont,
        },
      },
    },
  };

  return (
    <div>
      {renderBattleContent()}
    </div>
  );
}

export default VoteChart;
