import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import styles from "./VoteChart.module.css";

// 註冊 Chart.js 必要元件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const VoteChart = ({ votes, curRound }) => {
  // 計算投票數量
  const voteCount = { blue: 0, red: 0, tie: 0 };
  const voteDetails = { blue: [], red: [], tie: [] };
  const playerHasNotVote = { name: [], online: [] };

  votes.forEach(({ p_name, online, side }) => {
    if (voteCount[side] !== undefined) {
      voteCount[side]++;
      voteDetails[side].push(p_name);
    }
    else if (side === 'empty') {
      playerHasNotVote['name'].push(p_name);
      playerHasNotVote['online'].push(online)
    }
  });

  // 設定 Chart.js 資料
  const chartData = {
    labels: [curRound.red_name, curRound.blue_name, "Tie"],
    datasets: [
      {
        label: "Votes",
        data: [voteCount.red, voteCount.blue, voteCount.tie],
        backgroundColor: ["#E74C3C", "#4A90E2", "#F1C40F"],
        borderRadius: 8, // 設定圓角
        barThickness: 100, // 設定 Bar 的固定寬度
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // 隱藏圖例 (Legend)
      tooltip: { enabled: true }, // 啟用 Tooltip
      datalabels: {
        anchor: "center", // 讓數值顯示在 Bar 的中間
        align: "center",
        color: "#333", // 設定數值顏色
        font: {
          weight: "bold",
          size: 30,
        },
        formatter: (value, context) => {
          // 取得 X 軸標籤
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`; // 顯示標籤名稱 + 票數
        },
      },
    },
    scales: {
      x: {
        ticks: { align : "center", color: "#333", font: { size: 14 }, offset : true },
        grid: { display: false }, // 隱藏 X 軸的網格線
      },
      y: {
        display : false
      },
    },
  };

  return (
    <div className={styles.container}>

      {/* 圖表 */}
      <div className={styles.chart}>
        <Bar data={chartData} options={options} />
      </div>

      {/* 投票詳細資訊 */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>投票者</th>
              <th>陣營</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(voteDetails).map(([side, players]) =>
              players.map((player, index) => (
                <tr key={`${side}-${index}`}>
                  <td>{player}</td>
                  <td className={styles[side]}>{side.toUpperCase()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>未投票</th>
            </tr>
          </thead>
          <tbody>
          {playerHasNotVote.name.length > 0 ? (
            playerHasNotVote.name.map((playerName, index) => (
              <tr key={index}>
                <td >
                  {playerName}
                  {playerHasNotVote.online[index] ? "（在線）" : "（離線）"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">所有玩家皆已投票 🎉</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoteChart;
