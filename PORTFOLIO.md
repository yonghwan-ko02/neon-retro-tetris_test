# 📂 Project Portfolio: NEON ARCADE PLATFORM

> **Project Name**: NEON ARCADE (Retro Synth Arcade Platform)  
> **Development Period**: 2026.05.30 (Agile Sprint Expansion II)  
> **Developer**: Antigravity AI & Developer Collaboration  
> **Tech Stack**: HTML5, CSS3, Vanilla JS, Web Audio API, Canvas 2D API  

---

## 📌 1. 프로젝트 개요 & 기획 의도

본 프로젝트는 레트로 다크 네온과 글래스모피즘 비주얼로 마감된 웹 게임 허브 공간 **"NEON ARCADE"**의 2차 메이저 업그레이드 결과물입니다. 
기존의 **테트리스(Tetris)**와 **네온 러너(Neon Runner)**에 이어, 튕김 조작의 재미와 파괴의 통쾌한 이펙트를 고스란히 담은 자체 설계 게임 **"NEON BREAKER (네온 벽돌깨기)"**를 추가 탑재함으로써, 3대 명작 캐주얼 아케이드를 모두 품은 풍성하고 완전한 정적 게임 포탈 사이트를 구현했습니다.

---

## 🛠️ 2. 시스템 아키텍처 & 다중 모듈 구조

최상위 브릿지 컨트롤러(`platform.js`)가 브라우저의 화면 전환 및 활성 게임의 라이프사이클을 안전하게 교대하며, 독립된 3대 엔진이 오디오 코어(`audio.js`) 및 로컬 디바이스 저장소(`LocalStorage`)를 상호 간섭 없이 분리 활용합니다.

```mermaid
graph TD
    index.html[index.html <br> 멀티 스크린 레이아웃] --> style.css[style.css <br> 3단 로비 카드 및 광원]
    index.html --> platform.js[platform.js <br> 화면 스위칭 및 루프 관리]
    
    platform.js -->|게임 활성화 / 중지| tetris.js[tetris.js <br> 테트리스 엔진]
    platform.js -->|게임 활성화 / 중지| runner.js[runner.js <br> 네온 러너 물리 엔진]
    platform.js -->|게임 활성화 / 중지| breaker.js[breaker.js <br> 벽돌깨기 물리 엔진]
    
    tetris.js -->|플레이 사운드| audio.js[audio.js <br> 실시간 오디오 신디사이저]
    runner.js -->|플레이 사운드| audio.js
    breaker.js -->|플레이 사운드| audio.js
    
    tetris.js -->|기록 저장| LocalStorage[LocalStorage]
    runner.js -->|기록 저장| LocalStorage
    breaker.js -->|기록 저장| LocalStorage
```

---

## 📋 3. 태스크 진행 과정 (Task Progress Timeline)

1.  **3단 확장형 로비 그리드 개편 (Lobby Screen 3-Card layout)**
    *   `style.css`에서 가로 그리드를 `repeat(3, 1fr)`로 확장하고, 기기 해상도에 맞춰 1단/2단/3단으로 자동 유동 배치되는 반응형 중단점 설계.
    *   벽돌 깨기 프리뷰용 이미지 자산 `breaker_preview.png`를 AI로 생성하여 썸네일 배치.
2.  **벽돌깨기 물리 및 렌더링 엔진 구축 (`breaker.js`)**
    *   공-벽 충돌, 구체-사각형 패들 튕김, 다층 네온 벽돌 격자 레이아웃 구성.
    *   마우스 커서의 미세 움직임을 1:1로 부드럽게 추적하는 마우스 좌표 트래킹 및 드래그 보정.
3.  **파편 이미터 파티클 시스템 설계**
    *   블록이 깨질 때의 충격 지점 벡터를 분해하여 10개의 발광 구체 파편이 중력의 영향을 받아 흩날리며 사라지는 입자 시스템 설계.
4.  **오디오 합성 주파수 추가 개발 (`audio.js`)**
    *   패들 튕김음, 벽돌 폭파음, 라이프 유실음 및 미션 성공 팡파레 주파수 아르페지오 세팅.
5.  **버튼 바인딩 및 최종 원격 업로드**
    *   로비 이동 시 `window.NeonBreaker.stop()` 처리를 통해 브레이커 게임의 `requestAnimationFrame` 루프를 soft-kill하고 메모리 사용량을 원천 차단.
    *   깃허브 원격 동기화 완수.

---

## 🚀 4. 추가 기술적 챌린지 및 극복 과정 (Engineering Challenges)

### 챌린지 1: 사각형 패들 표면의 충돌 위치에 따른 구체 반사 각도 기하학 연산
*   **문제 상황**: 일반적인 벽돌 깨기 게임처럼 공이 패들에 부딪혔을 때 입사각 그대로 단순히 Y축 반사(`dy = -dy`)만 시키면, 공이 항상 단조로운 각도(45도 등)로만 반복 왕복하여 플레이어가 공을 원하는 방향으로 유도하거나 꺾어 칠 수 없는 매우 단조롭고 지루한 게임성이 연출되는 한계가 있었습니다.
*   **해결 방안**: 패들의 중심점으로부터 공이 충돌한 상대적 위치 오프셋인 **Hit Point**를 구하여 반사 각도를 계산하는 정밀 기하 알고리즘을 설계했습니다.
    *   수식: `HitPoint = (Ball.x - (Paddle.x + Paddle.width / 2)) / (Paddle.width / 2)` (결과값: -1.0 ~ 1.0)
    *   반사각: `BounceAngle = HitPoint * (Math.PI / 3.2)` (최대 반사각 약 56도 제한)
    *   최종 벡터: `dx = sin(BounceAngle) * speed`, `dy = -cos(BounceAngle) * speed`
    이 삼각함수 물리식을 탑재하여, 플레이어가 패들의 가장자리로 공을 비껴 칠수록 공이 수평에 가깝게 날카롭고 빠르게 꺾여 올라가도록 구현함으로써 아케이드 게임 본연의 조작성과 피지컬적 재미를 비약적으로 높였습니다.

### 챌린지 2: Canvas 기반 고성능 네온 파편 파티클 이미터(Neon Shards Emitter) 최적화
*   **문제 상황**: 네온 벽돌이 파괴될 때 비주얼 임팩트를 주기 위해 너무 많은 파티클을 렌더링하거나 무거운 그래픽 연산을 도입하면, 정적 싱글 스레드 환경에서 프레임 드랍(Lag)이 생기며 게임 플레이가 끊겨 보이는 품질 저하 현상이 발생할 수 있었습니다.
*   **해결 방안**: 프레임마다 수학적인 소멸 법칙과 가벼운 2D 드로잉 연산만을 처리하는 **경량 파티클 이미터**를 코딩했습니다.
    *   각 파편 입자마다 고유의 감쇄 상수(`decay`)와 중력(`gravity = 0.1`)을 부여하고, 매 루프 프레임마다 `y`축 속도 벡터에 중력을 누적하여 포물선 궤적으로 낙하시켰습니다.
    *   `alpha -= decay` 식을 통해 서서히 투명해지도록 처리하고 `alpha <= 0`이 되는 즉시 배열에서 즉각 삭제(`splice`)해 브라우저 가비지 컬렉터의 부하를 덜어 주었습니다.
    *   더불어 `shadowBlur = 6` 과 고유 색상을 이용한 짧은 발광 쉐이더만을 입혀, CPU 자원을 거의 소모하지 않으면서도 불꽃놀이처럼 찬란하게 네온 파편이 튀다 사라지는 고해상도 그래픽 효과를 완벽하게 유지했습니다.

---

## 📈 5. 최종 프로젝트 평가 및 기대 효과

*   **풍성해진 아케이드 포탈 사이트**: 테트리스, 무한 러너, 벽돌깨기라는 고전 아케이드의 3대 핵심 기둥을 모두 아름다운 단일 플랫폼 속에 빌드해 웹게임으로서의 완벽한 상업적 프리미엄 패키지 구조를 갖췄습니다.
*   **완벽한 리소스 해제 연동**: 세 게임이 로비 복귀 시 완벽하게 동작 루프를 탈출하도록 코딩되어, 브라우저가 장시간 켜져 있어도 전혀 과열되거나 리소스를 소모하지 않는 안전한 소프트웨어 아키텍처를 증명했습니다.
