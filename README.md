# 📚 일본어 단어장

일본어 단어와 문법을 효과적으로 학습할 수 있는 웹 기반 플래시카드 애플리케이션입니다.

https://hyunjungil.github.io/japan_word_memorizing_app/

## ✨ 주요 기능

### 📖 학습 모드
- **평가하기 모드**: 플래시카드 방식으로 단어를 학습하고 평가
  - 문제 유형 선택 (일본어→한국어, 한국어→일본어)
  - 가중치 기반 반복 학습 (틀린 문제는 더 자주 출제)
  - 실시간 통계 (트라이 횟수별 분석)
  - 음성 재생 기능 (Web Speech API)
  
- **공부하기 모드**: 테이블 형식으로 모든 단어를 한눈에 확인
  - ID 기준 정렬 (오름차순/내림차순)
  - 컬럼별 보임/숨김 토글
  - 개별 셀 클릭으로 텍스트 숨기기
  - 클립보드 복사 (긴 누름)

### 📊 통계 분석
- 완료된 문제의 트라이 횟수 분포 시각화
- 평균 트라이 횟수 계산
- 트라이 횟수별 상세 테이블 제공
- 막대 그래프로 직관적인 분석

### 🎯 가중치 시스템
- 정답 시 가중치 감소 (최소 0)
- 오답 시 가중치 증가 (최대 5)
- 가중치에 비례한 출제 확률
- 최근 5개 단어 중복 출제 방지

### 🎨 사용자 인터페이스
- 반응형 디자인 (모바일/태블릿/데스크톱 지원)
- 직관적인 그라데이션 UI
- 버튼 정렬 커스터마이징 (왼쪽/중앙/오른쪽)
- 애니메이션 효과

## 🚀 설치 및 실행

### 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)
- 로컬 웹 서버 (ES6 모듈 사용으로 인해 필요)

### 실행 방법

1. **저장소 클론**
```bash
git clone <repository-url>
cd japan_study
```

2. **로컬 서버 실행**

Python 3:
```bash
python -m http.server 8000
```

Node.js (http-server):
```bash
npx http-server -p 8000
```

VS Code Live Server 확장 사용 시:
- `index.html` 파일을 열고 "Go Live" 클릭

3. **브라우저에서 접속**
```
http://localhost:8000
```

## 📁 프로젝트 구조

```
japan_study/
├── index.html                    # 메인 HTML 파일
├── css/
│   └── styles.css               # 전체 스타일시트
├── js/
│   ├── main.js                  # 애플리케이션 진입점
│   ├── App.js                   # 메인 애플리케이션 클래스
│   ├── config.js                # 설정 상수
│   │
│   ├── models/                  # 데이터 모델
│   │   ├── Word.js             # 단어 모델
│   │   ├── WordSet.js          # 단어셋 모델
│   │   └── Question.js          # 문제 모델
│   │
│   ├── services/                # 비즈니스 로직
│   │   ├── WordSetService.js   # 단어셋 로드 서비스
│   │   ├── WeightService.js    # 가중치 관리
│   │   └── StatisticsService.js # 통계 계산
│   │
│   ├── managers/                # 상태 관리
│   │   ├── StudySessionManager.js  # 학습 세션 관리
│   │   ├── HistoryManager.js       # 히스토리 관리
│   │   └── VoiceManager.js         # 음성 재생 관리
│   │
│   ├── modes/                   # 학습 모드
│   │   ├── QuizMode.js         # 평가하기 모드
│   │   └── StudyMode.js        # 공부하기 모드
│   │
│   ├── ui/                      # UI 컴포넌트
│   │   ├── FileSelectionUI.js  # 파일 선택 화면
│   │   ├── FlashcardUI.js      # 플래시카드 화면
│   │   ├── StudyTableUI.js     # 공부하기 테이블
│   │   ├── StatisticsUI.js     # 통계 화면
│   │   └── components/
│   │       └── TableComponent.js  # 재사용 가능한 테이블
│   │
│   └── utils/                   # 유틸리티
│       ├── ClipboardUtils.js   # 클립보드 복사
│       ├── DOMUtils.js         # DOM 조작 헬퍼
│       └── SortUtils.js        # 정렬 알고리즘
│
├── results/                     # 단어 데이터 (JSON)
│   ├── page_01.json ~ page_29.json
│   └── grammar_01.json ~ grammar_04.json
│
└── README.md                    # 이 파일
```

## 🎮 사용 방법

### 1. 파일 선택
- 학습 모드 선택: **평가하기** 또는 **공부하기**
- 원하는 단어 파일 선택 (page_XX.json, grammar_XX.json)
- 평가하기 모드의 경우 문제 유형 선택 (일본어→한국어, 한국어→일본어)

### 2. 평가하기 모드
- **?** 버튼: 정답 확인
- **◀** 버튼: 이전 카드로 이동
- **▶** 버튼: 다음 카드로 이동 (정답 확인 후 활성화)
- **O** 버튼: 정답 처리 (가중치 감소)
- **X** 버튼: 오답 처리 (가중치 증가)
- **⚙** 버튼: 버튼 정렬 변경 (왼쪽/중앙/오른쪽)
- **▶ 아이콘**: 발음 재생

### 3. 공부하기 모드
- 테이블의 각 컬럼 헤더 클릭: 해당 컬럼 전체 보임/숨김
- 개별 셀 클릭: 해당 셀만 보임/숨김
- 셀을 길게 누름: 클립보드에 복사
- ID 헤더 클릭: 정렬 순서 변경

### 4. 통계 확인
- 평가하기 모드에서 하단의 통계 영역 확인
- 트라이 횟수별 라벨 클릭: 상세 테이블 토글

## 💾 데이터 형식

단어 데이터는 JSON 형식으로 저장됩니다:

```json
{
  "words": [
    {
      "id": 1,
      "japanese": "～でなくてもよければ",
      "pronunciation": "~でなくてもよければ",
      "meaning": "~가 아니라도 좋다면",
      "sent_jp": "今日でなくてもよければ買い物に付き合える。",
      "sent_kr": "오늘이 아니라도 좋다면 쇼핑에 같이 갈 수 있다."
    }
  ]
}
```

- `id`: 고유 식별자
- `japanese`: 일본어 표기
- `pronunciation`: 발음 (히라가나/가타카나)
- `meaning`: 한국어 의미
- `sent_jp`: 일본어 예문 (선택적)
- `sent_kr`: 한국어 예문 (선택적)

### 📁 파일 관리

새로운 JSON 파일을 `results/` 폴더에 추가했다면, `manifest.json`을 업데이트해야 합니다.

#### 방법 1: Git Hooks로 자동화 (추천)

커밋 시 자동으로 `manifest.json`이 업데이트됩니다:

```bash
# 1. Git hooks 설치 (최초 1회만)
./setup-hooks.sh

# 2. 이후 평소처럼 커밋
git add results/page_30.json
git commit -m "Add page 30"
# → manifest.json이 자동으로 업데이트되어 같이 커밋됩니다!
```

#### 방법 2: 수동 업데이트

```bash
# manifest.json 자동 업데이트
python3 update_manifest.py
```

**update_manifest.py 스크립트는:**
- `results/` 폴더의 모든 `.json` 파일을 자동으로 스캔
- `manifest.json`을 최신 상태로 업데이트
- 파일 타입별(page, grammar, 기타) 통계 출력

애플리케이션은 `manifest.json`을 읽어서 동적으로 모든 파일을 로드합니다.

## 🛠 기술 스택

- **Frontend**: Vanilla JavaScript (ES6+)
- **아키텍처**: 클래스 기반 모듈 설계
- **스타일링**: CSS3 (그라데이션, 애니메이션)
- **API**: Web Speech API (음성 재생)
- **모듈 시스템**: ES6 Modules

## 📝 주요 특징

### 모듈화된 아키텍처
- **관심사의 분리**: UI, 비즈니스 로직, 데이터 관리 명확히 분리
- **재사용성**: 컴포넌트와 유틸리티의 재사용
- **확장성**: 새로운 기능 추가가 용이한 구조
- **유지보수성**: 각 모듈의 독립적인 수정 가능

### 성능 최적화
- Fisher-Yates 셔플 알고리즘 사용
- 최근 단어 중복 방지 메커니즘
- 가중치 기반 효율적인 반복 학습

### 사용자 경험
- 반응형 디자인으로 모든 기기 지원
- 직관적인 UI/UX
- 실시간 피드백 및 통계
- 키보드 단축키 지원 계획

## 🔄 업데이트 내역

### v2.0.0 (리팩토링)
- 단일 파일에서 모듈화된 구조로 전면 리팩토링
- 16개의 전역 변수를 클래스 기반으로 캡슐화
- 코드 재사용성 및 유지보수성 대폭 향상
- 상수 관리 시스템 도입
- 이벤트 핸들러를 이벤트 리스너로 전환

### v1.0.0 (초기 버전)
- 기본 플래시카드 기능
- 평가하기/공부하기 모드
- 가중치 시스템

## 📄 라이선스

이 프로젝트는 개인 학습용으로 제작되었습니다.

## 👤 작성자

개인 일본어 학습 프로젝트

## 📞 문의

프로젝트 관련 문의 사항이 있으시면 이슈를 생성해 주세요.

---

**Happy Learning! 📚✨**

