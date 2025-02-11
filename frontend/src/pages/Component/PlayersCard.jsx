import React from "react";
import styles from "./PlayerCard.module.css";

function PlayerCard({ players }) {
  return (
    <div className={styles["player-container"]}>
      {players.map((player) => (
        <div
          key={player.name}
          className={`${styles["player-card"]} ${
            player.online ? styles["online"] : styles["offline"]
          }`}
        >
          <span>{player.name}</span> {/* 靠左顯示 */}
          <span>{player.online ? "🟢 上線中" : "⚪ 離線"}</span> {/* 靠右顯示 */}
        </div>
      ))}
    </div>
  );
}

export default PlayerCard;
