import React, { useState, useEffect } from 'react';
import axios from 'axios';
import myPosterImage1 from './assets/SE1.jpg';
import myPosterImage2 from './assets/SE2.jpg';
import myPosterImage3 from './assets/SE3.jpg';
import myPosterImage4 from './assets/SE4.jpg';

const API_URL = '/api/todos';

const MOVIES = [
  { id: 1, title: '컴퓨터네트워크', age: '19+', desc: '논리 설계 종강 후, 다시 설계를 위한 대학생들의 사투.', poster: myPosterImage1 },
  { id: 2, title: '네트워크프로그래밍', age: '19+', desc: '컴퓨터공학과 학생이 3학년으로 올라가며 시작되는 강의.', poster: myPosterImage2 },
  { id: 3, title: '소프트웨어공학', age: '19+', desc: '소프트웨어 공학을 학습할 새로운 터전을 찾아 55516으로 떠나는 이야기.', poster: myPosterImage3 },
  { id: 4, title: '알고리즘', age: '19+', desc: '문제를 팀원들과 어떻게 해결할지 토론을 하는 거대한 논쟁.', poster: myPosterImage4 },
];

const App = () => {
  const [view, setView] = useState('movie');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [myReservations, setMyReservations] = useState([]);
  const [counts, setCounts] = useState({ professor: 0, p_student: 0, colleger: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');

  // JSON 여부를 확인하는 헬퍼 함수
  const isJsonString = (str) => {
    try {
      const obj = JSON.parse(str);
      return (obj && typeof obj === 'object' && obj.movieTitle); // 영화 정보 객체인지 확인
    } catch (e) {
      return false;
    }
  };

  const safeParse = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
  };

  // 1. 데이터 불러오기 (영화 예매와 Todo 완벽 분리)
  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      
      // 서버 데이터를 두 그룹으로 엄격히 분리
      const movieReservations = res.data.filter(item => isJsonString(item.title));
      const pureTodos = res.data.filter(item => !isJsonString(item.title));
      
      setMyReservations(movieReservations);
      setTodos(pureTodos);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPeople = counts.professor + counts.p_student + counts.colleger;
  const totalPrice = (counts.professor * 15000) + (counts.p_student * 12000) + (counts.colleger * 8000);

  // --- [Todo CRUD 로직] ---
  const handleAddTodo = async () => {
    if (!todoInput.trim()) return;
    try {
      const res = await axios.post(API_URL, { title: todoInput, completed: false });
      // 영화 예매가 아닌 일반 할 일 목록(setTodos)에만 추가
      setTodos(prev => [res.data, ...prev]);
      setTodoInput('');
    } catch (err) { alert("등록 실패"); }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      setTodos(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) { alert("상태 변경 실패"); }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("이 할 일을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) { alert("삭제 실패"); }
  };

  // --- [영화 예매 로직] ---
  const getReservedSeats = () => {
    if (!selectedMovie) return [];
    return myReservations
      .filter(res => {
        const data = safeParse(res.title);
        return data && data.movieTitle === selectedMovie.title && !res.completed;
      })
      .flatMap(res => safeParse(res.title)?.seats || []);
  };

  const handlePayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const info = {
      movieTitle: selectedMovie.title,
      poster: selectedMovie.poster,
      age: selectedMovie.age,
      seats: selectedSeats,
      price: totalPrice,
      date: new Date().toLocaleString()
    };

    try {
      const res = await axios.post(API_URL, { title: JSON.stringify(info), completed: false });
      // 체크리스트(todos)가 아닌 예매 내역(setMyReservations)에만 추가
      setMyReservations(prev => [res.data, ...prev]);
      setCounts({ professor: 0, p_student: 0, colleger: 0 });
      setSelectedSeats([]);
      setView('history');
      setTimeout(() => alert("예매가 완료되었습니다!"), 100);
    } catch (err) {
      alert("결제 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm("예매를 취소하시겠습니까?")) return;
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: true });
      setMyReservations(prev => prev.map(item => item._id === id ? res.data : item));
    } catch (err) { alert("취소 실패"); }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm("내역을 완전히 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMyReservations(prev => prev.filter(item => item._id !== id));
    } catch (err) { alert("삭제 실패"); }
  };

  // 영화 카드 컴포넌트 (동일)
  const MovieCard = ({ movie }) => {
    const [isHover, setIsHover] = useState(false);
    return (
      <div style={styles.movieCard} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} 
           onClick={() => { setSelectedMovie(movie); setCounts({professor:0, p_student:0, colleger:0}); setSelectedSeats([]); setView('seat'); }}>
        <div style={styles.posterWrapper}>
          <img src={movie.poster} alt={movie.title} style={{...styles.posterImg, transform: isHover ? 'scale(1.05)' : 'scale(1)'}} />
          <span style={{...styles.ageBadge, backgroundColor: movie.age === 'All' ? '#2ecc71' : '#fbba00'}}>{movie.age}</span>
          <div style={{...styles.hoverOverlay, opacity: isHover ? 1 : 0}}>
            <p style={styles.hoverDesc}>{movie.desc}</p>
            <button style={styles.hoverReserveBtn}>예매하기</button>
          </div>
        </div>
        <div style={styles.movieInfo}>
          <h3 style={styles.movieTitle}>{movie.title}</h3>
          <p style={styles.moviePrice}>15,000원 ~</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
      {/* 탭 네비게이션 */}
      <div style={styles.tabContainer}>
        <button style={{...styles.tabBtn, borderBottom: view === 'movie' ? '3px solid #e71a0f' : 'none', color: view === 'movie' ? '#e71a0f' : '#555'}} onClick={() => setView('movie')}>영화 예매</button>
        <button style={{...styles.tabBtn, borderBottom: view === 'todo' ? '3px solid #e71a0f' : 'none', color: view === 'todo' ? '#e71a0f' : '#555'}} onClick={() => setView('todo')}>체크리스트</button>
        <button style={{...styles.tabBtn, borderBottom: view === 'history' ? '3px solid #e71a0f' : 'none', color: view === 'history' ? '#e71a0f' : '#555'}} onClick={() => setView('history')}>나의 내역</button>
      </div>

      {/* 1. 영화 목록 */}
      {view === 'movie' && (
        <div style={styles.darkBg}>
          <header style={styles.listHeader}><h2>🎬 BOX OFFICE</h2></header>
          <div style={styles.movieGrid}>
            {MOVIES.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      )}

      {/* 2. 좌석 선택 */}
      {view === 'seat' && (
        <div style={styles.seatContainer}>
          <header style={styles.seatHeader}>
            <div><strong>{selectedMovie?.title}</strong></div>
            <button style={styles.closeBtn} onClick={() => setView('movie')}>✕</button>
          </header>
          <div style={styles.countSelectionArea}>
            {['professor', 'p_student', 'colleger'].map(t => (
              <div key={t} style={styles.countBox}>
                <span>{t === 'professor' ? '교수' : t === 'p_student' ? '대학원생' : '대학생'}</span>
                <div style={styles.counter}>
                  <button onClick={() => setCounts({...counts, [t]: Math.max(0, counts[t]-1)})}>-</button>
                  <span>{counts[t]}</span>
                  <button onClick={() => setCounts({...counts, [t]: counts[t]+1})}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.screenArea}>SCREEN</div>
          <div style={styles.seatGrid}>
            {['A', 'B', 'C'].map(row => (
              <div key={row} style={styles.seatRow}>
                <span style={{width: '20px'}}>{row}</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => {
                  const sid = `${row}${col}`, isS = selectedSeats.includes(sid), isR = getReservedSeats().includes(sid);
                  return (
                    <div key={col} 
                      onClick={() => { 
                        if(isR) return; 
                        if(isS) setSelectedSeats(selectedSeats.filter(s=>s!==sid)); 
                        else if(selectedSeats.length < totalPeople) setSelectedSeats([...selectedSeats, sid]);
                      }}
                      style={{...styles.seatIcon, backgroundColor: isR ? '#555' : (isS ? '#e71a0f' : '#333')}}
                    >{col}</div>
                  );
                })}
              </div>
            ))}
          </div>
          <footer style={styles.paymentBar}>
            <div style={styles.priceNum}>{totalPrice.toLocaleString()}원</div>
            <button style={styles.payBtn} disabled={selectedSeats.length !== totalPeople || totalPeople === 0} onClick={handlePayment}>결제하기</button>
          </footer>
        </div>
      )}

      {/* 3. 예매 내역 */}
      {view === 'history' && (
        <div style={styles.lightBg}>
          <h2 style={{textAlign:'center'}}>나의 예매 내역</h2>
          {myReservations.map(res => {
            const data = safeParse(res.title);
            if(!data) return null;
            return (
              <div key={res._id} style={styles.historyCard}>
                <img src={data.poster} style={styles.historyPoster} alt="p" />
                <div style={{flex:1}}>
                  <div style={{fontWeight:'bold'}}>{data.movieTitle} {res.completed && '(취소됨)'}</div>
                  <div style={{fontSize:'13px', color:'#666'}}>{data.seats.join(', ')} | {data.price.toLocaleString()}원</div>
                  <div style={{fontSize:'12px', color:'#999'}}>{data.date}</div>
                  {!res.completed ? <button style={styles.textBtn} onClick={() => cancelReservation(res._id)}>취소</button> 
                  : <button style={styles.deleteBtn} onClick={() => deleteReservation(res._id)}>삭제</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Todo List (영화 예매 정보 제외) */}
      {view === 'todo' && (
        <div style={styles.todoBg}>
          <div style={styles.todoCard}>
            <h2 style={{textAlign:'center', marginBottom: '20px'}}>🍿 영화관 체크리스트</h2>
            <div style={styles.todoInputBox}>
              <input style={styles.todoInput} placeholder="할 일을 입력하세요" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()} />
              <button style={styles.todoAddBtn} onClick={handleAddTodo}>등록</button>
            </div>
            <div style={styles.todoList}>
              {todos.map(t => (
                <div key={t._id} style={{...styles.todoItem, backgroundColor: t.completed ? '#f8f9fa' : '#fff'}} onClick={() => toggleTodo(t._id, t.completed)}>
                  <div style={{display:'flex', alignItems:'center', gap: '10px', flex: 1}}>
                    <div style={{...styles.customCheck, backgroundColor: t.completed ? '#e71a0f' : 'transparent'}}>
                      {t.completed && '✓'}
                    </div>
                    <span style={{
                      textDecoration: t.completed ? 'line-through' : 'none',
                      color: t.completed ? '#bbb' : '#333',
                      fontSize: '16px'
                    }}>{t.title}</span>
                  </div>
                  <button style={styles.todoDelBtn} onClick={(e) => { e.stopPropagation(); deleteTodo(t._id); }}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles (동일) ---
const styles = {
  tabContainer: { display: 'flex', justifyContent: 'center', backgroundColor: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 100 },
  tabBtn: { padding: '15px 25px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
  darkBg: { backgroundColor: '#111', minHeight: '100vh', padding: '40px 20px', color: '#fff' },
  listHeader: { textAlign: 'center', marginBottom: '40px' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', maxWidth: '1000px', margin: '0 auto' },
  movieCard: { cursor: 'pointer', textAlign: 'center' },
  posterWrapper: { position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' },
  posterImg: { width: '100%', height: '300px', objectFit: 'cover', transition: '0.3s' },
  ageBadge: { position: 'absolute', top: '10px', left: '10px', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  hoverOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.3s', padding: '15px' },
  hoverDesc: { fontSize: '13px', color: '#ccc', marginBottom: '15px' },
  hoverReserveBtn: { padding: '8px 20px', backgroundColor: '#e71a0f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  movieInfo: { color: '#fff' },
  movieTitle: { fontSize: '16px', margin: '5px 0' },
  moviePrice: { fontSize: '14px', color: '#888' },
  seatContainer: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '20px' },
  seatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  countSelectionArea: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' },
  countBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
  counter: { display: 'flex', border: '1px solid #444', borderRadius: '4px' },
  screenArea: { width: '80%', margin: '0 auto 40px', borderTop: '2px solid #444', textAlign: 'center', color: '#444', paddingTop: '10px' },
  seatGrid: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
  seatRow: { display: 'flex', gap: '5px', alignItems: 'center' },
  seatIcon: { width: '25px', height: '25px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', cursor: 'pointer' },
  paymentBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '20px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  priceNum: { fontSize: '24px', color: '#e71a0f', fontWeight: 'bold' },
  payBtn: { padding: '12px 40px', backgroundColor: '#e71a0f', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' },
  lightBg: { maxWidth: '600px', margin: '40px auto', padding: '0 20px' },
  historyCard: { display: 'flex', gap: '15px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  historyPoster: { width: '70px', height: '100px', objectFit: 'cover', borderRadius: '5px' },
  textBtn: { border: 'none', background: 'none', color: '#e71a0f', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  deleteBtn: { padding: '5px 10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  todoBg: { padding: '40px 20px' },
  todoCard: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  todoInputBox: { display: 'flex', gap: '10px', marginBottom: '25px' },
  todoInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
  todoAddBtn: { padding: '0 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  todoList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  todoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '10px', border: '1px solid #eee', cursor: 'pointer', transition: '0.2s' },
  customCheck: { width: '20px', height: '20px', border: '2px solid #e71a0f', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '12px' },
  todoDelBtn: { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }
};

export default App;