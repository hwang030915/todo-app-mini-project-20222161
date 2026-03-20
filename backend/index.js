const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 5000;

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공!'))
  .catch((err) => console.error('❌ MongoDB 연결 실패:', err));

app.get('/', (req, res) => {
  res.send('서버와 DB가 연결되었습니다.');
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});