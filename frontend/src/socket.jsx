import { io } from 'socket.io-client';

const socket = io('http://localhost:5002'); // 初始化 WebSocket 連線
export default socket; // 導出單例
