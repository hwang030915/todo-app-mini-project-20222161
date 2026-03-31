# todo-app-mini-project-20222161
<!-- 
  PROJECT: 미니 프로젝트: 풀스택 Todo 리스트 앱 만들기 & Vercel 배포
  이름 : 황왕석
  학번 : 20222161
  DATE: 2026. 04. 10
  DESCRIPTION: 소프트웨어공학 미니 프로젝트 최종 결과 보고서
-->

<div align="center">
  <h1>🎬 Full-Stack Movie Booking & Todo Integrated App</h1>
  <p><strong>React + Node.js + MongoDB Atlas + Vercel Deployment</strong></p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=Vercel&logoColor=white" />
</div>

<hr />

## 1. 개요 및 배경 (Introduction & Background)

### 1.1 개발 배경 및 필요성
웹 프로그래밍의 기초인 **Todo List**는 단순 CRUD를 익히기에 최적화되어 있지만, 실제 서비스 환경에서는 여러 도메인의 데이터가 혼재되는 경우가 많습니다. 본 프로젝트는 단순한 할 일 관리를 넘어, **영화 예매 시스템**이라는 복잡한 비즈니스 로직을 결합하여 하나의 DB 엔드포인트 내에서 성격이 다른 데이터를 어떻게 효율적으로 식별하고 관리할 수 있는지 탐구하기 위해 시작되었습니다.

### 1.2 목적 및 목표
<ul>
  <li><strong>MERN Stack 실전 적용</strong>: React(Vite), Node.js, Express, MongoDB Atlas의 완전한 통합 및 서버리스 배포 성공.</li>
  <li><strong>복합 데이터 설계</strong>: 단일 컬렉션 내에서 <code>String</code>(Todo)과 <code>JSON Serialization</code>(Booking) 데이터를 식별하는 알고리즘 구현.</li>
  <li><strong>풀스택 파이프라인 이해</strong>: 로컬 개발 환경에서 클라우드 배포까지의 소프트웨어 생명 주기(SDLC) 경험.</li>
</ul>

---

## 2. 개발 내용 및 방법 (Development Content & Methods)

### 2.1 시스템 아키텍처 (Architecture)
<ul>
  <li><strong>Frontend</strong>: React (Vite) - SPA 구조로 탭 기반의 빠른 화면 전환 구현.</li>
  <li><strong>Backend</strong>: Node.js / Express - RESTful API 서버 설계 및 Vercel Serverless Function 최적화.</li>
  <li><strong>Database</strong>: MongoDB Atlas - 클라우드 NoSQL 기반 실시간 데이터 동기화.</li>
</ul>

### 2.2 상세 구현 로직 (Technical Implementation)

#### ⚡ [핵심] Axios를 이용한 Todo CRUD 및 백엔드 연동
<code>src/App.jsx</code>에서 <code>axios</code> 라이브러리를 사용하여 백엔드 API(<code>/api/todos</code>)와 직접 통신하며 데이터의 영속성을 확보했습니다.

<table width="100%">
  <thead>
    <tr>
      <th width="20%">기능</th>
      <th width="15%">Method</th>
      <th width="65%">상세 구현 방식 및 코드 로직</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><strong>목록 불러오기</strong></td>
      <td align="center"><code>GET</code></td>
      <td><code>useEffect</code>를 통해 앱 로드 시 <code>fetchData</code> 함수 실행. 서버 응답 데이터 중 <code>startsWith('{')</code> 검사를 통해 영화 예매 데이터와 일반 할 일을 분리하여 각각 <code>setMyReservations</code>와 <code>setTodos</code>에 할당함.</td>
    </tr>
    <tr>
      <td align="center"><strong>할 일 추가</strong></td>
      <td align="center"><code>POST</code></td>
      <td>사용자가 입력한 <code>todoInput</code>을 서버에 전송. <code>setTodos(prev => [res.data, ...prev])</code> 로직을 통해 새로고침 없이 리스트 최상단에 새 항목을 즉시 렌더링함.</td>
    </tr>
    <tr>
      <td align="center"><strong>상태 변경 (체크)</strong></td>
      <td align="center"><code>PUT</code></td>
      <td>할 일 클릭 시 <code>completed</code> 값을 반전시켜 서버에 요청. <code>prev.map(t => t._id === id ? res.data : t)</code>을 사용하여 해당 ID의 항목만 부분적으로 업데이트하여 성능을 최적화함.</td>
    </tr>
    <tr>
      <td align="center"><strong>항목 삭제</strong></td>
      <td align="center"><code>DELETE</code></td>
      <td><code>axios.delete</code> 호출 후 <code>filter()</code>를 사용하여 UI에서 즉시 제거. <code>window.confirm</code>을 통해 사용자 실수를 방지하는 안전장치를 마련함.</td>
    </tr>
  </tbody>
</table>

#### ⚡ 영화 예매 및 좌석 점유 로직
<ul>
  <li><strong>인원별 가변 가격</strong>: 교수(15,000원), 대학원생(12,000원), 대학생(8,000원) 인원에 따른 실시간 합계 금액 산출.</li>
  <li><strong>데이터 직렬화 저장</strong>: 영화명, 포스터, 좌석 배열 등을 하나의 객체로 묶어 <code>JSON.stringify()</code>로 변환 후 DB의 <code>title</code> 필드에 저장.</li>
  <li><strong>실시간 좌석 필터링</strong>: <code>getReservedSeats</code> 함수가 DB의 직렬화된 데이터를 역직렬화(<code>safeParse</code>)하여, 이미 예약된 좌석을 찾아 선택 불가능하게 비활성화 처리.</li>
</ul>

---

## 3. 문제점 및 대응 방안 (Issues & Solutions)

### 3.1 [Troubleshooting] 인프라 및 배포 이슈
*   <strong>Vercel 서버리스 배포 장애</strong>: 로컬 환경과 달리 배포 후 API 경로를 찾지 못하는 현상이 발생했습니다. <code>vercel.json</code> 설정을 통해 라우팅을 맞추고, <code>module.exports = app;</code> 구조로 백엔드를 수정하여 Vercel 핸들러가 Express를 정상 인식하도록 해결했습니다.
*   <strong>MongoDB 접속 정보 분실</strong>: <code>.env</code> 파일 관리 중 URI 정보를 분실하여 한동안 DB 접속이 차단되었습니다. 이 과정을 통해 데이터베이스 보안 설정과 중요한 접속 정보를 안전하게 기록해두는 습관의 중요성을 뼈저리게 느꼈습니다.

### 3.2 [UI/UX] 디자인의 고충과 깨달음
*   <strong>문제점</strong>: "기능만 구현하면 된다"는 생각으로 시작했지만, 실제 사용자가 보기에 직관적이고 '영화관 다운' 느낌을 주는 UI를 만드는 과정이 가장 힘들었습니다. 
*   <strong>해결</strong>: 디자인 분야 종사자분들에 대한 존경심이 생길 정도로 레이아웃 한 칸, 색상 하나 정하는 것이 어려웠으나, Gemini AI의 조언을 받아 다크 모드 기반의 레드 포인트 컬러 테마를 적용하여 시각적 완성도를 높였습니다.

---

## 4. 향후 계획 및 결론 (Future Plan & Conclusion)

### 4.1 학습자 관점의 느낀점 (Reflection)
<blockquote>
  "Todolist만 하기에는 아쉬워 영화관 앱을 추가하며 과한 욕심을 부렸나 싶을 정도로 구현 과정이 험난했습니다. 하지만 이 과정을 통해 단순히 코드를 짜는 법을 넘어, 프론트와 백엔드가 어떻게 유기적으로 데이터를 주고받는지, 그리고 Vercel과 MongoDB Atlas라는 현대적인 툴을 사용하여 실제 서비스를 배포하는 방법까지 완벽하게 익힐 수 있었습니다. 웹프로그래밍 수업에서 배운 기초를 토대로 한 단계 더 성장한 기분입니다."
</blockquote>

### 4.2 종합 결론
본 프로젝트는 요구사항 정의부터 최종 배포까지 소프트웨어 공학의 전 과정을 충실히 이행하였습니다. 특히 생성형 AI(Gemini)를 단순한 정답지로서가 아니라, 복잡한 로직을 검토받고 디자인 피드백을 주고받는 <strong>지능형 페어 프로그래밍 파트너</strong>로 활용한 점이 이번 프로젝트 성공의 핵심이었습니다.

---
<div align="right">
  <p><strong>제출자: 황왕석</strong></p>
  <p><strong>학번: 20222161</strong></p>
  <p>제출일: 2026. 04. 10</p>
</div>