import { useState, useEffect } from 'react';
import axios from 'axios';

const MOVIES = [
  { id: 1, title: '어벤져스: 엔드게임', poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&h=600&fit=crop', age: '12', description: '인류의 절반이 사라진 후, 남은 어벤져스 멤버들이 타노스와 벌이는 최후의 전쟁.' },
  { id: 2, title: '기생충 (Parasite)', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&h=600&fit=crop', age: '15', description: '전원 백수 가족인 기택네 장남 기우가 고액 과외 면접을 가며 시작되는 걷잡을 수 없는 사건.' },
  { id: 3, title: '인터스텔라 (Interstellar)', poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&h=600&fit=crop', age: 'All', description: '붕괴해가는 지구를 대신할 인류의 새로운 터전을 찾아 광활한 우주로 떠나는 탐험가들의 이야기.' },
];

function App() {
  const [step, setStep] = useState('movie'); 
  const [selectedMovie, setSelectedMovie] = useState('');
  const [myReservations, setMyReservations] = useState([]); 
  const [selectedSeats, setSelectedSeats] = useState([]); 
  const [counts, setCounts] = useState({ adult: 0, teen: 0, child: 0 });

  const API_URL = 'http://localhost:5000/api/todos';

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setMyReservations(res.data);
    } catch (err) { console.error("데이터 로딩 실패:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const currentMovieReservedSeats = myReservations.reduce((acc, item) => {
    if (item.title && item.title.includes(selectedMovie)) {
      const match = item.title.match(/SEATS:\[(.*?)\]/);
      if (match) {
        const seats = match[1].split(',').map(s => s.trim());
        return [...acc, ...seats];
      }
    }
    return acc;
  }, []);

  const handleMovieSelect = (title) => {
    setSelectedMovie(title);
    setSelectedSeats([]);
    setCounts({ adult: 0, teen: 0, child: 0 });
    setStep('seat');
  };

  const handleSeatClick = (seatId) => {
    if (currentMovieReservedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const updateCount = (type, val) => {
    const totalSelected = selectedSeats.length;
    const currentTotal = counts.adult + counts.teen + counts.child;
    if (val > 0 && currentTotal >= totalSelected) return;
    setCounts({ ...counts, [type]: Math.max(0, counts[type] + val) });
  };

  const handleReserve = async () => {
    const total = counts.adult + counts.teen + counts.child;
    if (total !== selectedSeats.length || total === 0) {
      alert("좌석 수와 인원 수를 정확히 맞춰주세요.");
      return;
    }
    try {
      const seatStr = selectedSeats.sort().join(',');
      const peopleStr = `성인:${counts.adult}, 청소년:${counts.teen}, 유아:${counts.child}`;
      const combinedTitle = `MOVIE:${selectedMovie} :: SEATS:[${seatStr}] :: INFO:${peopleStr}`;

      await axios.post(API_URL, { title: combinedTitle, completed: false });
      alert("🎉 예약이 완료되었습니다!");
      fetchData(); 
      setStep('confirm'); 
    } catch (err) { alert("예약 실패"); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      fetchData();
    } catch (err) { console.error("업데이트 실패:", err); }
  };

  const handleDelete = async (id) => {
    if(confirm('정말 예약을 취소하시겠습니까?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchData();
      } catch (err) { console.error("삭제 실패:", err); }
    }
  };

  const rows = ['A','B','C','D','E','F','G','H','I'];
  const cols = [1,2,3,4,5,6,7,8,9,10,11,12];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      <header className="py-12 flex flex-col items-center border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50 shadow-2xl">
        <h1 className="text-5xl font-black tracking-[0.2em] uppercase cursor-pointer transition-colors hover:text-amber-400" onClick={() => setStep('movie')}>
          CINEMA RESERVE
        </h1>
        <button onClick={() => setStep('confirm')} className="mt-8 text-sm font-black bg-amber-400 text-black px-12 py-3 rounded-full hover:bg-white hover:scale-105 transition-all uppercase shadow-lg shadow-amber-400/20">
          Check My Tickets
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-10 pb-40 flex flex-col items-center">
        
        {step === 'movie' && (
          <div className="mt-24 flex flex-col gap-14">
            {MOVIES.map(movie => (
              <div key={movie.id} onClick={() => handleMovieSelect(movie.title)} 
                className="group cursor-pointer flex items-center bg-zinc-900 hover:bg-zinc-800 rounded-[2rem] border-2 border-zinc-800 hover:border-amber-400 w-[850px] h-[350px] transition-all duration-300 overflow-hidden shadow-2xl">
                <div className="w-[240px] h-full overflow-hidden border-r-2 border-zinc-800">
                  <img src={movie.poster} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt=""/>
                </div>
                <div className="flex-1 p-14">
                  <span className="text-sm bg-amber-400 text-black px-4 py-1.5 rounded-full font-black uppercase tracking-wider">Age {movie.age}</span>
                  <h3 className="text-5xl font-black mt-6 group-hover:text-amber-400 transition-colors leading-tight">{movie.title}</h3>
                  <p className="text-zinc-400 mt-6 text-lg leading-relaxed line-clamp-2">{movie.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'seat' && (
          <div className="mt-24 w-full max-w-5xl p-16 bg-zinc-900 rounded-[3rem] border-2 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-4xl font-black text-center mb-16 text-amber-400 tracking-tight uppercase italic underline decoration-zinc-700 underline-offset-8">{selectedMovie}</h2>
            
            <div className="flex flex-col gap-6 mb-16">
              <div className="flex flex-col items-center mb-10">
                <div className="w-full h-2 bg-zinc-800 rounded-full mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]"></div>
                <div className="bg-zinc-800 px-20 py-2 rounded-b-3xl border-x border-b border-zinc-700">
                    <span className="text-zinc-400 font-black tracking-[1.5em] uppercase text-xs pl-[1.5em]">SCREEN</span>
                </div>
              </div>

              {rows.map(row => (
                <div key={row} className="flex justify-center gap-3 items-center">
                  <span className="w-10 text-zinc-600 text-xl font-black">{row}</span>
                  {cols.map(col => {
                    const id = row + col;
                    const isReserved = currentMovieReservedSeats.includes(id);
                    const isSelected = selectedSeats.includes(id);
                    return (
                      <button 
                        key={id} 
                        disabled={isReserved} 
                        onClick={() => handleSeatClick(id)} 
                        style={{ backgroundColor: isSelected ? '#fbbf24' : '' }} // 인라인 스타일로 노란색 강제
                        className={`w-12 h-12 rounded-xl text-xs font-black border-2 transition-all duration-200 flex items-center justify-center
                        ${isReserved 
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed' 
                          : isSelected 
                            ? 'border-amber-400 text-black scale-110 shadow-[0_0_20px_rgba(251,191,36,0.6)] cursor-pointer' 
                            : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white cursor-pointer'
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {selectedSeats.length > 0 && (
              <div className="flex flex-col items-center gap-10 mb-16 py-12 border-y-2 border-zinc-800">
                <div className="flex gap-16">
                  {['adult', 'teen', 'child'].map(type => (
                    <div key={type} className="flex flex-col items-center gap-5">
                      <span className="text-sm font-black text-zinc-500 uppercase tracking-widest">{type === 'adult' ? '성인' : type === 'teen' ? '청소년' : '유아'}</span>
                      <div className="flex items-center gap-6 bg-black px-6 py-3 rounded-2xl border-2 border-zinc-800">
                        <button onClick={() => updateCount(type, -1)} className="text-3xl font-light hover:text-amber-400 cursor-pointer">-</button>
                        <span className="text-3xl font-black w-10 text-center">{counts[type]}</span>
                        <button onClick={() => updateCount(type, 1)} className="text-3xl font-light hover:text-amber-400 cursor-pointer">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-amber-400 font-black text-xl tracking-tighter italic">Total {selectedSeats.length} Seats Selected</p>
              </div>
            )}
            
            <div className="text-center">
              <button onClick={handleReserve} 
                className={`px-24 py-6 rounded-2xl font-black text-2xl transition-all shadow-2xl
                ${selectedSeats.length > 0 && (counts.adult + counts.teen + counts.child === selectedSeats.length) 
                ? 'bg-amber-400 text-black cursor-pointer hover:scale-105 shadow-amber-400/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
                COMPLETE RESERVATION
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="mt-24 w-full max-w-4xl space-y-10 text-left">
            <h2 className="text-5xl font-black mb-16 italic border-b-8 border-amber-400 inline-block uppercase tracking-tighter">My Tickets</h2>
            {myReservations.length === 0 ? (
              <p className="text-zinc-600 py-32 text-center font-black text-2xl uppercase tracking-widest border-2 border-dashed border-zinc-800 rounded-[2rem]">No tickets found.</p>
            ) : (
              myReservations.map(res => {
                const raw = res.title || "";
                const movieTitle = raw.includes("MOVIE:") ? raw.split("MOVIE:")[1].split(" ::")[0] : "정보 없음";
                const seatInfo = raw.includes("SEATS:[") ? raw.split("SEATS:[")[1].split("]")[0] : "좌석 없음";
                const peopleInfo = raw.includes("INFO:") ? raw.split("INFO:")[1] : "";

                return (
                  <div key={res._id} className="relative bg-zinc-900 border-2 border-zinc-800 rounded-[2.5rem] overflow-hidden flex shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.01]">
                    <div className={`w-6 h-full absolute left-0 ${res.completed ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                    <div className="flex-1 pl-16 p-12 flex justify-between items-center">
                      <div className="space-y-6">
                        <p className="text-amber-400 font-black text-xl tracking-tight uppercase italic">🎬 {movieTitle.trim()}</p>
                        <h4 className="text-7xl font-black tracking-tighter text-white uppercase italic leading-none">SEAT: {seatInfo}</h4>
                        <div className="flex items-center gap-4 pt-2">
                           <span className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em]">Details:</span>
                           <p className="text-zinc-200 text-lg font-black bg-zinc-800 px-6 py-2 rounded-full border-2 border-zinc-700">{peopleInfo.trim()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-6 items-end">
                        <button onClick={() => handleToggleStatus(res._id, res.completed)} 
                          className={`text-sm font-black px-8 py-3 rounded-xl border-2 transition-all shadow-lg cursor-pointer
                          ${res.completed ? 'bg-green-600 border-green-500 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white hover:border-amber-400'}`}>
                          {res.completed ? '✅ CHECKED IN' : '🎟️ UNUSED'}
                        </button>
                        <button onClick={() => handleDelete(res._id)} className="text-zinc-600 hover:text-red-500 text-sm font-black underline decoration-2 underline-offset-4 cursor-pointer">CANCEL TICKET</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div className="pt-20 text-center">
              <button onClick={() => setStep('movie')} className="text-zinc-500 hover:text-white font-black text-sm uppercase tracking-[0.3em] cursor-pointer transition-colors">
                ← Go back to movie selection
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;