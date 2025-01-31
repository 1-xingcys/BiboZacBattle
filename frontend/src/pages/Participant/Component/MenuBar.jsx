import React from "react";
import styles from "./MenuBar.module.css";

const MenuBar = ({ username, eventName, onLogout }) => {
  return (
    <div>
      <nav className={styles.nav}>
        <input type="checkbox" id="sidebar-active" className={styles.sidebar_active}/>
        <label htmlFor="sidebar-active" className={styles.open_sidebar_buttom}>
          <svg className={styles.sidebar_buttom_svg} xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#5f6368"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>   
        </label>

        <label className={styles.overlay} htmlFor="sidebar-active"></label>
        <div className={styles.links_container}>
          <label htmlFor="sidebar-active" className={styles.close_sidebar_buttom}>
            <svg className={styles.sidebar_buttom_svg} xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#5f6368"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </label>

          <a className={styles.home_link} href="#">{eventName}</a>
          <a className={styles.general_link} href="#">個人資料（{username}）</a>
          <a className={styles.general_link} href="#">比賽結果</a>
          <a onClick={onLogout} className={styles.general_link}>離開</a>
        </div>
      </nav>
    </div>
  );
};

export default MenuBar;
