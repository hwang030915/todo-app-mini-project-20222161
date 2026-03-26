import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  // 백엔드 주소 (로컬 테스트용)
  const API_URL = 'http://localhost:5000/api/todos';

  // [Read] 목록 가져오기
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // [Create] 추가하기
  const addTodo = async (e) => {
    e.preventDefault();
    if (!title) return;
    await axios.post(API_URL, { title });
    setTitle('');
    fetchTodos(); // 목록 새로고침
  };

  // [Update] 완료 체크 토글
  const toggleTodo = async (id, completed) => {
    await axios.put(`${API_URL}/${id}`, { completed: !completed });
    fetchTodos();
  };

  // [Delete] 삭제하기
  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTodos();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>📝 My Todo List</h1>
      <form onSubmit={addTodo} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="할 일을 입력하고 Enter!"
          style={{ padding: '10px', width: '250px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}>추가</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo._id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '10px', 
            borderBottom: '1px solid #eee' 
          }}>
            <input 
              type="checkbox" 
              checked={todo.completed} 
              onChange={() => toggleTodo(todo._id, todo.completed)} 
            />
            <span style={{ 
              flex: 1, 
              marginLeft: '15px', 
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#aaa' : '#333'
            }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;