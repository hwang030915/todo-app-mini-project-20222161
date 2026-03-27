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

  // --- [추가] Todo 관련 상태 ---
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');

  // 1. GET: 통합 데이터 불러오기 (영화 예매와 Todo 구분)
  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      // title이 '{'로 시작하면 영화 예매 데이터, 아니면 Todo 데이터로 분류
      const movies = res.data.filter(item => item.title.trim().startsWith('{'));
      const todoItems = res.data.filter(item => !item.title.trim().startsWith('{'));
      
      setMyReservations(movies);
      setTodos(todoItems);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPeople = counts.professor + counts.p_student + counts.colleger;
  const totalPrice = (counts.professor * 15000) + (counts.p_student * 12000) + (counts.colleger * 8000);

  const safeParse = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
  };

  // --- [Todo 기능] CRUD 로직 ---

  // Todo 등록 (Create)
  const handleAddTodo = async () => {
    if (!todoInput.trim()) return;
    try {
      const res = await axios.post(API_URL, { title: todoInput, completed: false });
      setTodos(prev => [res.data, ...prev]);
      setTodoInput('');
    } catch (err) { alert("할 일 등록 실패"); }
  };

  // Todo 상태 업데이트 (Update)
  const toggleTodo = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      setTodos(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) { alert("상태 업데이트 실패"); }
  };

  // Todo 삭제 (Delete)
  const deleteTodo = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) { alert("삭제 실패"); }
  };

  // --- [영화 예매 기능] 기존 로직 유지 ---

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
      if (res.status === 200 || res.status === 201) {
        setMyReservations(prev => [res.data, ...prev]);
        setCounts({ professor: 0, p_student: 0, colleger: 0 });
        setSelectedSeats([]);
        setView('history');
        setTimeout(() => alert("예매가 정상적으로 완료되었습니다! 🎟️"), 100);
      }
    } catch (err) {
      alert("결제 처리 중 오류가 발생했습니다.");
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

  const MovieCard = ({ movie }) => {
    const [isHover, setIsHover] = useState(false);
    return (
      <div style={styles.movieCard} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} 
           onClick={() => { setSelectedMovie(movie); setCounts({professor:0, p_student:0, colleger:0}); setSelectedSeats([]); setView('seat'); }}>
        <div style={styles.posterWrapper}>
          <img src={movie.poster} alt={movie.title} style={{...styles.posterImg, transform: isHover ? 'scale(1.05)' : 'scale(1)'}} />
          <span style={{...styles.ageBadge, backgroundColor: movie.age === 'All' ? '#2ecc71' : '#fbba00'}}>{movie.age}</span>
          <div style={{...styles.hoverOverlay, opacity: isHover ? 1 : 0, pointerEvents: 'none'}}>
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
    <div style={{fontFamily: 'sans-serif'}}>
      {/* 상단 네비게이션 탭 */}
      <div style={styles.tabContainer}>
        <button style={{...styles.tabBtn, borderBottom: view === 'movie' ? '3px solid #e71a0f' : 'none'}} onClick={() => setView('movie')}>영화 예매</button>
        <button style={{...styles.tabBtn, borderBottom: view === 'todo' ? '3px solid #e71a0f' : 'none'}} onClick={() => setView('todo')}>체크리스트</button>
        <button style={{...styles.tabBtn, borderBottom: view === 'history' ? '3px solid #e71a0f' : 'none'}} onClick={() => setView('history')}>나의 내역</button>
      </div>

      {/* 1. 영화 목록 뷰 */}
      {view === 'movie' && (
        <div style={styles.darkBg}>
          <header style={styles.listHeader}>
            <h2 style={{fontSize: '32px', margin: 0}}>🎬 BOX OFFICE</h2>
          </header>
          <div style={styles.movieGrid}>
            {MOVIES.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      )}

      {/* 2. 좌석 선택 뷰 */}
      {view === 'seat' && (
        <div style={styles.seatContainer}>
          <header style={styles.seatHeader}>
            <div style={styles.movieInfoMini}>
              <span style={styles.ageBadgeSmall}>{selectedMovie?.age}</span>
              <strong>{selectedMovie?.title}</strong>
            </div>
            <button style={styles.closeBtn} onClick={() => setView('movie')}>✕</button>
          </header>
          
          <div style={styles.countSelectionArea}>
            {['professor', 'p_student', 'colleger'].map(t => (
              <div key={t} style={styles.countBox}>
                <span style={styles.countLabel}>{t === 'professor' ? '교수님' : t === 'p_student' ? '대학원생' : '대학생'}</span>
                <div style={styles.counter}>
                  <button style={styles.countBtn} onClick={() => {
                    const n = Math.max(0, counts[t]-1); 
                    setCounts({...counts, [t]:n}); 
                    if(selectedSeats.length > (totalPeople-1)) setSelectedSeats([]);
                  }}>-</button>
                  <span style={styles.countNum}>{counts[t]}</span>
                  <button style={styles.countBtn} onClick={() => setCounts({...counts, [t]:counts[t]+1})}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.screenArea}><div style={styles.screenLine}>SCREEN</div></div>
          
          <div style={styles.seatGrid}>
            {['A', 'B', 'C'].map(row => (
              <div key={row} style={styles.seatRow}>
                <span style={styles.rowLabel}>{row}</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => {
                  const sid = `${row}${col}`, isS = selectedSeats.includes(sid), isR = getReservedSeats().includes(sid);
                  return (
                    <div key={col} 
                      onClick={() => { 
                        if(isR) return; 
                        if(isS) setSelectedSeats(selectedSeats.filter(s=>s!==sid)); 
                        else if(selectedSeats.length < totalPeople) setSelectedSeats([...selectedSeats, sid]);
                      }}
                      style={{...styles.seatIcon, backgroundColor: isR ? '#555' : (isS ? '#e71a0f' : '#333'), cursor: isR ? 'default' : 'pointer'}}
                    >
                      {col}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <footer style={styles.paymentBar}>
            <div style={styles.paymentInner}>
              <div style={styles.priceContainer}>
                <span style={styles.priceLabel}>좌석: {selectedSeats.join(', ') || '미선택'}</span>
                <span style={styles.priceNum}>{totalPrice.toLocaleString()}원</span>
              </div>
              <button 
                style={{...styles.payBtn, opacity: (totalPeople > 0 && selectedSeats.length === totalPeople && !isSubmitting) ? 1 : 0.5}} 
                disabled={!(totalPeople > 0 && selectedSeats.length === totalPeople) || isSubmitting} 
                onClick={handlePayment}
              >
                {isSubmitting ? '처리 중...' : '결제하기'}
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* 3. 예매 내역 뷰 */}
      {view === 'history' && (
        <div style={styles.lightBg}>
          <div style={styles.historyHeader}>
            <h2 style={{fontSize: '24px', margin: 0}}>나의 예매 내역</h2>
            <button style={styles.backBtn} onClick={() => setView('movie')}>영화 목록으로</button>
          </div>
          {myReservations.map(res => {
            const data = safeParse(res.title);
            if(!data) return null;
            return (
              <div key={res._id} style={styles.historyCard}>
                <img src={data.poster} style={styles.historyPoster} alt="poster" />
                <div style={styles.historyContent}>
                  <div style={styles.historyTitle}>
                    <span style={styles.ageBadgeSmall}>{data.age}</span> <strong>{data.movieTitle}</strong>
                    {res.completed && <span style={styles.cancelBadge}>취소됨</span>}
                  </div>
                  <p style={styles.historyText}>좌석: <strong>{data.seats.join(', ')}</strong></p>
                  <p style={styles.historyText}>결제금액: {data.price.toLocaleString()}원</p>
                  <p style={styles.historyText}>일시: {data.date}</p>
                  <div style={{marginTop: '15px'}}>
                    {!res.completed ? <button style={styles.textBtn} onClick={() => cancelReservation(res._id)}>예매취소</button> 
                    : <button style={styles.deleteBtn} onClick={() => deleteReservation(res._id)}>내역 삭제</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Todo List 뷰 */}
      {view === 'todo' && (
        <div style={styles.todoBg}>
          <div style={styles.todoCard}>
            <h2 style={{textAlign:'center', color:'#333'}}>🍿 영화관 체크리스트</h2>
            <div style={styles.todoInputBox}>
              <input 
                style={styles.todoInput} 
                placeholder="관람 전 할 일을 입력하세요" 
                value={todoInput} 
                onChange={(e) => setTodoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <button style={styles.todoAddBtn} onClick={handleAddTodo}>등록</button>
            </div>
            <div style={styles.todoList}>
              {todos.map(t => (
                <div key={t._id} style={styles.todoItem}>
                  <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                    <input type="checkbox" checked={t.completed} onChange={() => toggleTodo(t._id, t.completed)} />
                    <span style={{textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#aaa' : '#333'}}>
                      {t.title}
                    </span>
                  </div>
                  <button style={styles.todoDelBtn} onClick={() => deleteTodo(t._id)}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles (Todo 스타일 추가됨) ---
const styles = {
  tabContainer: { display: 'flex', justifyContent: 'center', backgroundColor: '#fff', borderBottom: '1px solid #ddd' },
  tabBtn: { padding: '15px 30px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  darkBg: { backgroundColor: '#111', minHeight: '100vh', padding: '60px 20px', color: '#fff' },
  listHeader: { display:'flex', justifyContent:'center', alignItems:'center', maxWidth:'1000px', margin:'0 auto 40px' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' },
  movieCard: { cursor: 'pointer' },
  posterWrapper: { position: 'relative', height: '320px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#222' },
  posterImg: { width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' },
  ageBadge: { position: 'absolute', top: '12px', left: '12px', color: '#000', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 },
  hoverOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', transition: '0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' },
  hoverDesc: { color: '#ddd', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' },
  hoverReserveBtn: { backgroundColor: '#e71a0f', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  movieInfo: { marginTop: '15px', textAlign: 'center' },
  movieTitle: { fontSize: '18px', fontWeight: 'bold' },
  moviePrice: { fontSize: '14px', color: '#888' },
  seatContainer: { backgroundColor: '#000', minHeight: '100vh', color: '#fff' },
  seatHeader: { backgroundColor: '#fff', color: '#000', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  movieInfoMini: { display: 'flex', alignItems: 'center', gap: '10px' },
  ageBadgeSmall: { backgroundColor: '#fbba00', padding: '2px 4px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  countSelectionArea: { display: 'flex', justifyContent: 'center', gap: '30px', padding: '20px', borderBottom: '1px solid #222' },
  countBox: { display: 'flex', alignItems: 'center', gap: '8px' },
  countLabel: { fontSize: '13px', color: '#aaa' },
  counter: { display: 'flex', alignItems: 'center', border: '1px solid #444', borderRadius: '4px' },
  countBtn: { width: '30px', height: '30px', backgroundColor: '#222', color: '#fff', border: 'none', cursor: 'pointer' },
  countNum: { width: '30px', textAlign: 'center' },
  screenArea: { margin: '30px auto', width: '50%', textAlign: 'center' },
  screenLine: { borderTop: '2px solid #444', color: '#444', paddingTop: '5px', fontSize: '11px', letterSpacing: '5px' },
  seatGrid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom:'150px' },
  seatRow: { display: 'flex', alignItems: 'center', gap: '5px' },
  rowLabel: { color: '#666', width: '20px', fontSize: '12px' },
  seatIcon: { width: '24px', height: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px' },
  paymentBar: { position: 'fixed', bottom: 0, width: '100%', height: '90px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'center', borderTop: '1px solid #333' },
  paymentInner: { width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' },
  priceContainer: { display: 'flex', flexDirection: 'column' },
  priceLabel: { fontSize: '12px', color: '#888' },
  priceNum: { color: '#e71a0f', fontSize: '24px', fontWeight: 'bold' },
  payBtn: { backgroundColor: '#e71a0f', color: '#fff', border: 'none', padding: '12px 50px', fontSize: '18px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' },
  lightBg: { backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '50px 20px', color: '#333' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto 30px' },
  historyCard: { display: 'flex', gap: '20px', maxWidth: '800px', margin: '0 auto 15px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  historyPoster: { width: '100px', height: '140px', borderRadius: '4px', objectFit: 'cover' },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: '18px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
  historyText: { fontSize: '14px', color: '#666', margin: '4px 0' },
  backBtn: { padding: '8px 15px', border: '1px solid #333', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px' },
  cancelBadge: { backgroundColor: '#ff4d4d', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  textBtn: { background: 'none', border: 'none', color: '#e71a0f', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  // Todo전 전용 스타일
  todoBg: { backgroundColor: '#eee', minHeight: '100vh', padding: '40px 20px' },
  todoCard: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  todoInputBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  todoInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
  todoAddBtn: { backgroundColor: '#333', color: '#fff', padding: '0 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  todoList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  todoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' },
  todoDelBtn: { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px' }
};

export default App;