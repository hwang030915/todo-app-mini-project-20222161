require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');

   const app = express();
   app.use(cors());
   app.use(express.json());

   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('MongoDB 연결 성공'))
     .catch(err => console.log(err));

   // Todo 스키마
   const todoSchema = new mongoose.Schema({
     title: { type: String, required: true },
     completed: { type: Boolean, default: false }
   });
   const Todo = mongoose.model('Todo', todoSchema);

   // API 엔드포인트
   app.get('/api/todos', async (req, res) => {
     const todos = await Todo.find();
     res.json(todos);
   });

   app.post('/api/todos', async (req, res) => {
     const newTodo = new Todo({ title: req.body.title });
     await newTodo.save();
     res.json(newTodo);
   });

   app.put('/api/todos/:id', async (req, res) => {
     const todo = await Todo.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
     res.json(todo);
   });

   app.delete('/api/todos/:id', async (req, res) => {
     await Todo.findByIdAndDelete(req.params.id);
     res.json({ message: '삭제 완료' });
   });

   // 로컬 환경에서만 서버를 직접 실행하고, 배포 환경(Vercel)에서는 실행하지 않음
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
}

// 핵심: Vercel이 이 app 객체를 가져가서 자기 방식대로 실행할 수 있게 내보냅니다.
module.exports = app;