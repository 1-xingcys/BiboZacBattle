#!/bin/sh

# 執行資料庫初始化腳本
echo "Running database initialization..."
python db_init.py

# 啟動主應用
echo "Starting the application..."
python app.py
