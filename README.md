# 🎮 TETRIS NEON - Modern Retro Arcade

> **HTML5, CSS3, Vanilla JavaScript**로 제작한 감각적인 다크 네온 테마의 웹 테트리스 게임입니다.
> 8비트 사운드 신디사이저, 홀드 시스템, 화면 진동 효과 등 풍부한 타격감과 편의 기능을 담았습니다.

---

## ✨ Key Features (주요 기능)

*   **Glassmorphism & Neon UI**: 반투명 유리 질감의 패널 디자인과 블록 고유의 네온 발광 효과(Neon Glow)를 구현했습니다.
*   **Web Audio API Synth**: 별도의 대용량 음원 파일 없이, 웹 브라우저 자체 음원 합성 엔진을 구축하여 레트로 8비트 효과음을 즉석에서 실시간 생성합니다.
*   **Hold & Next System**: 전략적인 플레이를 위한 블록 보관(Hold, `C` 키) 기능과 다음에 나올 블록(Next)의 미니 뷰포트를 탑재했습니다.
*   **Ghost Piece**: 현재 조각이 일직선 아래로 떨어질 안착 지점을 미리 얇은 네온 테두리선으로 보여주어 안정적인 고속 플레이를 돕습니다.
*   **Dynamic Speed & Scoring**: 줄을 많이 제거할수록 레벨이 상승하고 낙하 속도가 가속화됩니다. `localStorage`를 연동하여 최고 점수(High Score)를 브라우저에 자동 영구 저장합니다.
*   **Impact Animation**: 하드 드롭 시의 보드 흔들림(Screen Shake)과 라인 클리어 시의 화면 플래시 이펙트로 최고의 몰입감과 타격감을 선사합니다.

---

## 🕹️ Controls (조작 가이드)

| 입력 키 | 기능 | Description |
|:---:|:---|:---|
| `←` / `→` | **좌우 이동** | 블록을 왼쪽 혹은 오른쪽으로 한 칸씩 이동시킵니다. (`A` / `D` 겸용) |
| `↑` | **블록 회전** | 시계 방향으로 회전시킵니다. 회전이 막히는 구석에서는 **Wall Kick**이 작동합니다. (`W` 겸용) |
| `↓` | **소프트 드롭** | 블록을 빠르게 아래로 떨어뜨립니다. (`S` 겸용) |
| `Space` | **하드 드롭** | 딜레이 없이 바닥에 즉시 블록을 안착시키며 타격 효과가 발생합니다. |
| `C` | **홀드 (Hold)** | 현재 블록을 보관하거나 보관된 블록을 꺼냅니다. (한 턴에 한 번 작동) |
| `P` / `Esc` | **일시정지** | 게임을 언제든 멈추고 재개할 수 있습니다. |

---

## 🛠️ Tech Stack (기술 스택)

*   **Language**: Vanilla JavaScript (ES6+), HTML5 Semantic markup, CSS3
*   **Audio Engine**: Web Audio API (OscillatorNode, GainNode, Exponential Volume Envelope)
*   **Render Engine**: HTML5 Canvas 2D API (ShadowBlur, Custom Rounded Rects)
*   **Font & Icons**: Google Fonts (Outfit), FontAwesome 6

---

## 🚀 Getting Started (실행 방법)

본 프로젝트는 설치나 의존성 설정이 전혀 필요 없는 **정적 프론트엔드 프로젝트**입니다.

1. 본 레포지토리를 클론(Clone)하거나 다운로드합니다.
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   ```
2. 프로젝트 디렉토리에 있는 `index.html` 파일을 브라우저로 엽니다 (더블클릭 또는 VS Code Live Server 이용).
3. **Start Game** 버튼을 누르거나 **Space / Enter**를 입력해 즉시 게임을 플레이하세요!
