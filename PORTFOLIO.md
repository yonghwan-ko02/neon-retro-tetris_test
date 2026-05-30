# 📂 Project Portfolio: NEON ARCADE PLATFORM

> **Project Name**: NEON ARCADE (Retro Synth Arcade Platform)  
> **Development Period**: 2026.05.30 (Agile Sprint Expansion)  
> **Developer**: Antigravity AI & Developer Collaboration  
> **Tech Stack**: HTML5, CSS3, Vanilla JS, Web Audio API, Canvas 2D API  

---

## 📌 1. 프로젝트 개요 & 기획 의도

기존에 제작된 고품질 단일 테트리스 게임을 바탕으로, 여러 레트로 아케이드 게임들을 기호에 맞게 선택하여 즐길 수 있는 **종합 정적 게임 아케이드 플랫폼 "NEON ARCADE"**로 전면 확장했습니다. 
추가로 크롬의 공룡 게임을 사이버펑크 감성으로 재해석한 **"NEON RUNNER"**를 결합하여, 단순한 코딩 과제를 넘어 완성도 높은 프리미엄 웹 아케이드 포탈 사이트를 구축하는 것을 목표로 기획되었습니다.

---

## 🛠️ 2. 시스템 아키텍처 & 다중 모듈 구조

플랫폼 전환 제어 모듈(`platform.js`)을 최상위 브릿지로 구축하고, 각 게임 독립 엔진(`tetris.js`, `runner.js`) 및 오디오 코어 신디사이저(`audio.js`)가 단방향 상태 제어를 따르도록 설계했습니다.

```mermaid
graph TD
    index.html[index.html <br> 멀티 스크린 레이아웃] --> style.css[style.css <br> 네온 카드 및 페이드 트랜지션]
    index.html --> platform.js[platform.js <br> 화면 스위칭 및 라이프사이클 총괄]
    
    platform.js -->|게임 활성화 / 중지| tetris.js[tetris.js <br> 테트리스 엔진]
    platform.js -->|게임 활성화 / 중지| runner.js[runner.js <br> 네온 러너 물리 엔진]
    platform.js -->|Mute 상태 싱크| audio.js[audio.js <br> 실시간 오디오 신디사이저]
    
    tetris.js -->|플레이 사운드| audio.js
    runner.js -->|플레이 사운드| audio.js
    
    tetris.js -->|기록 저장| LocalStorage[LocalStorage <br> tetris_high_score]
    runner.js -->|기록 저장| LocalStorage[LocalStorage <br> runner_high_score]
```

---

## 📋 3. 태스크 진행 과정 (Task Progress Timeline)

1.  **플랫폼 기획 및 다중 스크린 설계 (Lobby & Game Screens)**
    *   화면 페이드 트랜지션을 위한 다중 뷰 마크업 수립.
    *   3D 호버 트렌디 글로우 카드 인터페이스 로비 기획.
2.  **러너 게임 전용 횡스크롤 물리 엔진 구축 (`runner.js`)**
    *   중력, 점프 가속도, AABB 충돌 상자 검사 로직 개발.
    *   장애물 스폰 주기 밸런싱(속도에 따른 가속 밸런스).
3.  **사운드 신디사이저 확장 (`audio.js`)**
    *   공룡 점프 사운드(상승형 주파수 스윕), 장애물 충격 사운드(톱니파 하향 노이즈), 100m 돌파 기념음 합성 함수 추가.
4.  **브릿지 컨트롤러 코딩 (`platform.js`)**
    *   게임 실행 중 로비로 돌아갈 때 백그라운드 루프를 제거하는 라이프사이클 설계.
    *   전역 사운드 토글 상태 통합 싱크.
5.  **테스트, 디버깅 및 자동 배포**
    *   러너 점프 연속 입력 방지 및 슬라이딩 시 아바타 박스 크기 보정 검증.
    *   깃허브 원격 저장소(`yonghwan-ko02/neon-retro-tetris_test`) 연동 및 완전 업로드.

---

## 🚀 4. 추가 기술적 챌린지 및 극복 과정 (Engineering Challenges)

### 챌린지 1: 게임 전환 시 백그라운드 리소스 누수 및 충돌 방지
*   **문제 상황**: 단일 페이지 내에서 여러 스크린을 숨기고 드러내는 라우팅 구조를 구현하면서, 플레이어가 테트리스나 러너 게임을 즐기다가 로비("Home") 버튼을 누르고 나왔을 때, 게임 루프(`requestAnimationFrame`)가 중단되지 않고 백그라운드에서 CPU를 심각하게 점유하며 불필요한 사운드 이벤트가 겹쳐서 트리거되는 치명적인 메모리 누수 위험이 발생했습니다.
*   **해결 방안**: 각 독립 게임 모듈(`tetris.js`, `runner.js`) 내부에 `stop()` 헬퍼 메소드를 장착하고, 이를 전역 `window.TetrisGame` 및 `window.NeonRunner` 네임스페이스에 바인딩했습니다. `platform.js`에서 로비 화면으로 전환할 때 이 `stop()` 메소드를 호출하여 `cancelAnimationFrame` 처리 및 활성 플래그를 정지(`false`)시키고 캔버스 잔여 버퍼를 깔끔하게 리셋함으로써, CPU 점유율을 0%로 만들고 메모리 누수를 원천 차단했습니다.

### 챌린지 2: 러너 슬라이딩 조작 시의 동적 판정 경계 조정
*   **문제 상황**: 플레이어가 `↓` (또는 `S`) 키를 눌러 슬라이딩을 할 때 단순히 아바타의 세로 길이(`height`)만 줄이면, 물리 축의 바닥 접지 위치가 흐트러져 공중에 붕 뜨거나 땅 밑으로 파고들어 벽에 부딪힌 것으로 오판되어 죽는 지오메트리 계산 오차가 있었습니다.
*   **해결 방안**: 슬라이딩 입력 시 높이를 `50px`에서 `25px`로 반감시키는 즉시 아바타의 Y 좌표를 바닥 접지선(`GROUND_Y - 25px`)으로 정확히 스위칭하고, 키를 뗄 때는 원래 좌표(`GROUND_Y - 50px`)로 복원하도록 설계했습니다. 충돌 연산 또한 이 가변 박스 정보를 실시간으로 계산하는 AABB(Axis-Aligned Bounding Box) 경계 연산을 사용해 기믹이 완벽히 판정되도록 해결했습니다.

### 챌린지 3: 원근감이 느껴지는 레트로 신스웨이브(Synthwave) 패럴랙스 그리드 렌더링
*   **문제 상황**: 평면적인 2D 캔버스에서 횡스크롤 러너 게임이 진행될 때, 공간감과 역동적인 질주감이 부족하여 비주얼이 밋밋해 보였습니다.
*   **해결 방안**: 3D 격자 무늬(Perspective Lines) 원근 구도를 구현하기 위해, 지평선(`GROUND_Y`)에서 바닥(`CANVAS_HEIGHT`)까지 퍼지는 사선의 기하학적 수식을 도입했습니다. x좌표의 중심에서 1.5배 스케일로 바닥에 떨어지는 직선을 수학적으로 정의하여 투영시켰으며, 시간 경과에 따른 가속값(`obstacleSpeed * 0.8`)을 프레임의 델타타임에 맞춰 누적하여 지평선이 빠른 속도로 뒤로 스쳐 지나가는 격조 높은 패럴랙스 격자를 완성했습니다.

---

## 📈 5. 최종 프로젝트 평가 및 기대 효과

*   **매우 가볍고 유연한 무의존성 구조**: 별도의 React나 Vue, Next.js와 같은 무거운 웹 프레임워크나 외부 번들러 없이, 순수 브라우저 API(바닐라 JS)로만 고품질 다중 게임 라우터와 오디오 매니저를 구현하여 극도의 경량화와 빠른 로딩 속도를 유지했습니다.
*   **성공적인 깃허브 원격 동기화**: 프로젝트 진행 상황을 완전히 버전 관리(Commit)하여 GitHub 원격 레포지토리에 깨끗하게 푸시했으며, 정적 웹 배포 및 대외 포트폴리오용으로 완벽한 인프라를 마련했습니다.
