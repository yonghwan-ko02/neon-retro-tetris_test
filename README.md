# 🕹️ NEON ARCADE - Retro Game Platform

> **HTML5, CSS3, Vanilla JavaScript**로 구현된 고품질 다크 네온 테마의 레트로 아케이드 게임 플랫폼입니다.
> 하나의 아름다운 네온 로비 인터페이스 안에서 **테트리스(Tetris)**와 **네온 러너(Neon Runner)** 두 가지 명작 아케이드 게임을 선택해 즉석에서 플레이할 수 있습니다.

---

## ✨ Core Features (플랫폼 핵심 기능)

1.  **Neon Lobby (게임 선택창)**:
    *   3D 호버 트렌디 글로우 카드 인터페이스가 포함된 세련된 게임 로비 화면.
    *   완만하고 스무스한 CSS 화면 페이드인/페이드아웃 트랜지션 제공.
2.  **🕹️ Game 1: Tetris Neon**:
    *   클래식 테트리스 규칙(SRS 벽차기 오차보정, 7-Bag 랜덤 분배) 탑재.
    *   전략적이고 입체적인 재미를 더해주는 블록 보관(Hold) 시스템 및 Next 블록 캔버스 프리뷰.
    *   블록 하드 드롭 시의 타격감 넘치는 화면 흔들림(Screen Shake) 효과 및 줄 클리어 플래시.
3.  **🏃 Game 2: Neon Runner (신규!)**:
    *   크롬의 명작 오프라인 공룡 러너 게임을 사이버펑크 감성으로 오마주한 횡스크롤 장애물 회피 러너.
    *   **점프(Jump)**뿐만 아니라 머리 위 전선 장애물을 숙여 피하는 **슬라이딩(Slide)** 기믹 추가.
    *   거리 이동 속도에 비례한 점진적 가속 물리 모델 및 레트로 신스웨이브(Synthwave) 그라데이션 패럴랙스 격자 배경 렌더링.
4.  **Web Audio API Synth**:
    *   네온 아케이드 전체 사운드는 고가의 음원 로딩 리소스 대신 브라우저 자체 음원 합성 엔진(**Web Audio API**)을 코딩해 구현했습니다.
    *   이동, 회전, 추락, 점프, 충돌, 스코어 돌파, 레벨업, 게임오버 등 각 동작 주파수를 수학적으로 설계해 아날로그 8비트 오디오 효과음을 완벽히 연출했습니다.
5.  **Global Mute & LocalStorage**:
    *   전역 사운드 음소거 설정 및 게임별 최고 기록(High Score, Max Distance)을 브라우저 로컬 저장소에 영구 보존합니다.

---

## 🕹️ Controls (게임별 조작법)

### 1. Tetris Neon (테트리스 조작)

| 입력 키 | 기능 | 설명 |
|:---:|:---|:---|
| `←` / `→` | **좌우 이동** | 블록을 왼쪽/오른쪽으로 한 칸 이동 (`A` / `D` 겸용) |
| `↑` | **블록 회전** | 시계방향 90도 회전 (벽 근처에서 벽차기 보정 작동) (`W` 겸용) |
| `↓` | **소프트 드롭** | 블록 하강을 가속시킵니다. (`S` 겸용) |
| `Space` | **하드 드롭** | 딜레이 없이 바닥에 즉시 블록을 꽂으며 강력한 타격 진동을 발생시킵니다. |
| `C` | **홀드 (Hold)** | 현재 조각을 보관하거나 보관된 조각과 맞바꿉니다. (한 턴당 1회) |
| `P` / `Esc` | **일시정지** | 플레이 도중 게임 흐름을 일시 중단 및 재개합니다. |

### 2. Neon Runner (네온 러너 조작)

| 입력 키 | 기능 | 설명 |
|:---:|:---|:---|
| `Space` / `↑` | **점프 (Jump)** | 지상의 핑크 네온 선인장을 뛰어넘습니다. (`W` 겸용, 모바일/마우스 화면 터치 시에도 작동!) |
| `↓` | **슬라이드 (Slide)** | 공중의 노란 네온 전선 장애물을 아래로 숙여서 회피합니다. (`S` 겸용) |

---

## 🛠️ Tech Stack (기술 스택)

*   **Languages**: HTML5 Semantic markup, CSS3 Variables, Vanilla JavaScript (ES6+)
*   **Renderer**: HTML5 Canvas 2D Context API (Glow Shader, Rounded Rects, 3D Perspective Lines)
*   **Audio Synthesis**: Web Audio API (OscillatorNode, GainNode, Exponential Gain Decay Ramps)
*   **Persistence**: Web Storage API (LocalStorage)
*   **Icons & Web Fonts**: Google Fonts (Outfit), FontAwesome 6 Icons

---

## 🚀 Getting Started (실행 방법)

이 프로젝트는 무겁고 복잡한 빌드 과정이나 프레임워크가 필요 없는 **순수 정적 프론트엔드 프로젝트**입니다.

1. 본 레포지토리를 복제(Clone)합니다.
   ```bash
   git clone https://github.com/yonghwan-ko02/neon-retro-tetris_test.git
   ```
2. 다운로드된 디렉토리 내의 **`index.html`** 파일을 마우스로 더블클릭해 아무 웹 브라우저(Chrome, Safari, Edge 등)로 열어 실행합니다.
3. 네온 광원 카드 로비 화면에서 플레이하고 싶은 게임을 클릭해 무한 질주와 짜릿한 손맛을 즐기세요!
