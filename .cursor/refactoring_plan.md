# 일본어 단어장 리팩토링 계획서

## 📋 개요

현재 `index.html` 파일은 3219줄의 단일 파일 구조로, HTML, CSS, JavaScript가 모두 포함되어 있습니다. 코드의 가독성, 유지보수성, 확장성을 향상시키기 위한 리팩토링 계획입니다.

## 🔍 현재 상태 분석

### 문제점

1. **단일 파일 구조**
   - HTML, CSS, JavaScript가 모두 하나의 파일에 포함 (3219줄)
   - 코드 탐색 및 수정이 어려움
   - 버전 관리 시 충돌 가능성 증가

2. **전역 변수 과다 사용**
   ```javascript
   let wordSets = [];
   let selectedWords = [];
   let selectedQuestions = [];
   let currentWordIndex = -1;
   let wordHistory = [];
   let currentQuestion = null;
   let answerShown = false;
   let weights = {};
   let studyMode = 'quiz';
   let buttonAlignment = 'center';
   let jaVoice = null;
   let longPressTimer = null;
   let longPressCompleted = false;
   let clickTimer = null;
   let idSortOrder = 'asc';
   let questionTryCounts = {};
   let completedTryCounts = {};
   ```
   - 16개의 전역 변수 사용
   - 상태 관리가 분산되어 있어 추적이 어려움
   - 네임스페이스 오염

3. **인라인 이벤트 핸들러**
   - HTML에 `onclick`, `onmousedown` 등 인라인 이벤트 사용
   - 이벤트 핸들러 관리가 어려움
   - 이벤트 위임 패턴 미사용

4. **함수 구조**
   - 모든 함수가 전역 스코프에 존재
   - 관련 기능이 분산되어 있음
   - 모듈화 부족

5. **매직 넘버/문자열**
   - 가중치 최대값: 5
   - 가중치 최소값: 0 (평가하기), 1 (공부하기)
   - 파일 개수: 99 (page_01~99, grammar_01~99)
   - 긴 누름 시간: 500ms
   - 클릭 지연: 100ms

6. **코드 중복**
   - 테이블 생성 로직이 공부하기 모드와 통계 상세 테이블에서 중복
   - 텍스트 보임/숨김 로직 중복
   - 클립보드 복사 로직 중복

## 🎯 리팩토링 목표

1. **코드 분리**: HTML, CSS, JavaScript를 별도 파일로 분리
2. **모듈화**: 기능별로 모듈 분리
3. **상태 관리 개선**: 전역 변수를 클래스 기반으로 캡슐화
4. **상수 관리**: 매직 넘버/문자열을 상수로 분리
5. **이벤트 핸들러 정리**: 인라인 핸들러를 이벤트 리스너로 변경
6. **코드 재사용성 향상**: 중복 코드 제거 및 공통 함수 추출

## 📁 제안하는 파일 구조

```
japan_study/
├── index.html                    # 메인 HTML 파일 (최소화)
├── css/
│   └── styles.css               # 모든 스타일
├── js/
│   ├── main.js                  # 진입점 및 초기화
│   ├── config.js                # 상수 정의
│   ├── models/
│   │   ├── WordSet.js           # 단어셋 모델
│   │   ├── Word.js              # 단어 모델
│   │   └── Question.js           # 문제 모델
│   ├── services/
│   │   ├── WordSetService.js    # 단어셋 로드 서비스
│   │   ├── WeightService.js     # 가중치 관리 서비스
│   │   └── StatisticsService.js  # 통계 관리 서비스
│   ├── managers/
│   │   ├── StudySessionManager.js    # 학습 세션 관리
│   │   ├── HistoryManager.js         # 히스토리 관리
│   │   └── VoiceManager.js           # 발음 재생 관리
│   ├── modes/
│   │   ├── QuizMode.js          # 평가하기 모드
│   │   └── StudyMode.js         # 공부하기 모드
│   ├── ui/
│   │   ├── FileSelectionUI.js   # 파일 선택 화면
│   │   ├── FlashcardUI.js        # 플래시카드 화면
│   │   ├── StudyTableUI.js      # 공부하기 테이블 화면
│   │   ├── StatisticsUI.js      # 통계 UI
│   │   └── components/
│   │       ├── TableComponent.js    # 테이블 컴포넌트
│   │       ├── CardComponent.js      # 카드 컴포넌트
│   │       └── ButtonComponent.js    # 버튼 컴포넌트
│   └── utils/
│       ├── ClipboardUtils.js    # 클립보드 유틸리티
│       ├── SortUtils.js          # 정렬 유틸리티
│       └── DOMUtils.js           # DOM 유틸리티
├── results/                      # 단어 데이터 (기존 유지)
└── README.md
```

## 📝 단계별 리팩토링 계획

### Phase 1: 준비 작업 (Foundation)

#### 1.1 상수 분리
- **파일**: `js/config.js`
- **작업 내용**:
  ```javascript
  export const CONFIG = {
    WEIGHTS: {
      MIN_QUIZ: 0,
      MAX: 5,
      MIN_STUDY: 1,
      DEFAULT: 1
    },
    TIMING: {
      LONG_PRESS: 500,  // ms
      CLICK_DELAY: 100  // ms
    },
    FILES: {
      MAX_PAGE: 99,
      MAX_GRAMMAR: 99
    },
    MODES: {
      QUIZ: 'quiz',
      STUDY: 'study'
    },
    SORT_ORDERS: {
      ASC: 'asc',
      DESC: 'desc',
      RANDOM: 'random'
    }
  };
  ```

#### 1.2 모델 클래스 생성
- **파일**: `js/models/WordSet.js`, `js/models/Word.js`, `js/models/Question.js`
- **작업 내용**:
  - 데이터 구조를 클래스로 캡슐화
  - 유효성 검증 메서드 추가
  - 직렬화/역직렬화 메서드 추가

### Phase 2: 서비스 레이어 분리

#### 2.1 WordSetService
- **파일**: `js/services/WordSetService.js`
- **작업 내용**:
  - `loadWordSet()` 함수 이동
  - `init()` 함수의 파일 로드 로직 이동
  - 에러 처리 개선

#### 2.2 WeightService
- **파일**: `js/services/WeightService.js`
- **작업 내용**:
  - 가중치 관리 로직 분리
  - 가중치 업데이트 규칙 캡슐화
  - 가중치 기반 랜덤 선택 로직

#### 2.3 StatisticsService
- **파일**: `js/services/StatisticsService.js`
- **작업 내용**:
  - 트라이 횟수 추적 로직
  - 통계 계산 로직
  - 완료된 문제 추적

### Phase 3: 매니저 클래스 생성

#### 3.1 StudySessionManager
- **파일**: `js/managers/StudySessionManager.js`
- **작업 내용**:
  - 학습 세션 상태 관리
  - 모드 전환 로직
  - 세션 초기화/종료

#### 3.2 HistoryManager
- **파일**: `js/managers/HistoryManager.js`
- **작업 내용**:
  - 히스토리 스택 관리
  - 이전/다음 네비게이션
  - 히스토리 상태 저장/복원

#### 3.3 VoiceManager
- **파일**: `js/managers/VoiceManager.js`
- **작업 내용**:
  - Web Speech API 관리
  - 음성 초기화
  - 발음 재생

### Phase 4: 모드별 클래스 분리

#### 4.1 QuizMode
- **파일**: `js/modes/QuizMode.js`
- **작업 내용**:
  - 평가하기 모드 전용 로직
  - 문제 생성 및 선택
  - 카드 표시 로직
  - 진행도 관리

#### 4.2 StudyMode
- **파일**: `js/modes/StudyMode.js`
- **작업 내용**:
  - 공부하기 모드 전용 로직
  - 테이블 렌더링
  - 정렬 관리
  - 보임/숨김 상태 관리

### Phase 5: UI 컴포넌트 분리

#### 5.1 FileSelectionUI
- **파일**: `js/ui/FileSelectionUI.js`
- **작업 내용**:
  - 파일 선택 화면 렌더링
  - 모드 선택 UI
  - 문제 유형 선택 UI

#### 5.2 FlashcardUI
- **파일**: `js/ui/FlashcardUI.js`
- **작업 내용**:
  - 플래시카드 화면 렌더링
  - 카드 내용 표시
  - 정답 표시/숨김
  - 진행도 배지 업데이트

#### 5.3 StudyTableUI
- **파일**: `js/ui/StudyTableUI.js`
- **작업 내용**:
  - 테이블 화면 렌더링
  - 테이블 생성 및 업데이트
  - 정렬 UI 관리

#### 5.4 StatisticsUI
- **파일**: `js/ui/StatisticsUI.js`
- **작업 내용**:
  - 통계 화면 렌더링
  - 막대 그래프 생성
  - 상세 테이블 표시

#### 5.5 공통 컴포넌트
- **파일**: `js/ui/components/`
- **작업 내용**:
  - TableComponent: 재사용 가능한 테이블 컴포넌트
  - CardComponent: 카드 컴포넌트
  - ButtonComponent: 버튼 컴포넌트

### Phase 6: 유틸리티 분리

#### 6.1 ClipboardUtils
- **파일**: `js/utils/ClipboardUtils.js`
- **작업 내용**:
  - 클립보드 복사 로직
  - 긴 누름 감지
  - 피드백 메시지 표시

#### 6.2 SortUtils
- **파일**: `js/utils/SortUtils.js`
- **작업 내용**:
  - 정렬 알고리즘 (Fisher-Yates 셔플 등)
  - 알파벳순 정렬
  - ID 정렬

#### 6.3 DOMUtils
- **파일**: `js/utils/DOMUtils.js`
- **작업 내용**:
  - DOM 조작 헬퍼 함수
  - 이벤트 바인딩 헬퍼
  - 클래스 토글 헬퍼

### Phase 7: 이벤트 핸들러 정리

#### 7.1 인라인 핸들러 제거
- **작업 내용**:
  - 모든 `onclick`, `onmousedown` 등 제거
  - 이벤트 리스너로 대체
  - 이벤트 위임 패턴 적용

#### 7.2 이벤트 관리 중앙화
- **작업 내용**:
  - 이벤트 바인딩을 한 곳에서 관리
  - 이벤트 핸들러 네이밍 일관성 확보

### Phase 8: CSS 분리

#### 8.1 스타일 파일 생성
- **파일**: `css/styles.css`
- **작업 내용**:
  - 모든 인라인 `<style>` 태그 내용 이동
  - CSS 변수 사용 (색상, 간격 등)
  - 미디어 쿼리 정리

### Phase 9: HTML 최소화

#### 9.1 HTML 구조 정리
- **파일**: `index.html`
- **작업 내용**:
  - 최소한의 HTML만 유지
  - 스크립트/스타일 링크 추가
  - 시맨틱 HTML 개선

### Phase 10: 테스트 및 검증

#### 10.1 기능 테스트
- **작업 내용**:
  - 모든 기능이 정상 작동하는지 확인
  - 평가하기 모드 테스트
  - 공부하기 모드 테스트
  - 통계 기능 테스트

#### 10.2 성능 테스트
- **작업 내용**:
  - 파일 로드 시간 측정
  - 렌더링 성능 확인
  - 메모리 사용량 확인

## 🔧 구체적인 개선 사항

### 1. 상태 관리 개선

**현재:**
```javascript
let wordSets = [];
let selectedWords = [];
let weights = {};
// ... 16개의 전역 변수
```

**개선 후:**
```javascript
class AppState {
  constructor() {
    this.wordSets = [];
    this.selectedWords = [];
    this.weights = {};
    this.currentSession = null;
    // ...
  }
  
  reset() { /* 초기화 */ }
  save() { /* 상태 저장 */ }
  load() { /* 상태 복원 */ }
}
```

### 2. 이벤트 핸들러 개선

**현재:**
```html
<button onclick="nextCard()">다음</button>
```

**개선 후:**
```javascript
// main.js
document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.addEventListener('click', () => {
    quizMode.nextCard();
  });
});
```

### 3. 중복 코드 제거

**현재:**
- 테이블 생성 로직이 `displayStudyTable()`과 `generateStatisticsDetailTable()`에 중복

**개선 후:**
```javascript
class TableComponent {
  constructor(config) {
    this.config = config;
  }
  
  render(data) {
    // 공통 테이블 렌더링 로직
  }
  
  update(data) {
    // 테이블 업데이트 로직
  }
}
```

### 4. 상수 관리

**현재:**
```javascript
if (weights[key] > 5) weights[key] = 5;  // 매직 넘버
setTimeout(() => { ... }, 500);  // 매직 넘버
```

**개선 후:**
```javascript
import { CONFIG } from './config.js';

if (weights[key] > CONFIG.WEIGHTS.MAX) {
  weights[key] = CONFIG.WEIGHTS.MAX;
}
setTimeout(() => { ... }, CONFIG.TIMING.LONG_PRESS);
```

## ⚠️ 주의사항

1. **기능 유지**: 리팩토링 중 기존 기능이 손상되지 않도록 주의
2. **점진적 리팩토링**: 한 번에 모든 것을 바꾸지 않고 단계적으로 진행
3. **테스트**: 각 단계마다 기능 테스트 수행
4. **백업**: 리팩토링 전 현재 코드 백업
5. **호환성**: 기존 데이터 형식과의 호환성 유지

## 📊 예상 효과

### 코드 품질
- ✅ 가독성 향상 (파일당 평균 200-300줄)
- ✅ 유지보수성 향상 (모듈화)
- ✅ 재사용성 향상 (컴포넌트화)
- ✅ 테스트 용이성 향상 (단위 테스트 가능)

### 개발 효율
- ✅ 버전 관리 개선 (파일별 변경 추적)
- ✅ 협업 효율 향상 (파일별 작업 분담)
- ✅ 디버깅 용이 (에러 위치 파악 쉬움)

### 성능
- ✅ 코드 분할로 인한 로딩 최적화 가능
- ✅ 불필요한 코드 제거로 파일 크기 감소

## 🗓️ 예상 일정

- **Phase 1-2**: 2-3일 (기초 구조)
- **Phase 3-4**: 3-4일 (핵심 로직)
- **Phase 5-6**: 3-4일 (UI 및 유틸리티)
- **Phase 7-9**: 2-3일 (정리 및 최적화)
- **Phase 10**: 1-2일 (테스트)

**총 예상 기간**: 11-16일

## 📌 우선순위

### High Priority
1. 상수 분리 (Phase 1.1)
2. 서비스 레이어 분리 (Phase 2)
3. 이벤트 핸들러 정리 (Phase 7)

### Medium Priority
4. 모드별 클래스 분리 (Phase 4)
5. UI 컴포넌트 분리 (Phase 5)

### Low Priority
6. CSS 분리 (Phase 8)
7. HTML 최소화 (Phase 9)

## 🔄 리팩토링 후 파일 구조 예시

### index.html (최소화)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>일본어 단어장</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <!-- 최소한의 HTML 구조만 -->
    </div>
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

### js/main.js (진입점)
```javascript
import { App } from './App.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
```

## 📚 참고 자료

- ES6 모듈 시스템
- 클래스 기반 설계 패턴
- 컴포넌트 기반 아키텍처
- 이벤트 위임 패턴

---

**작성일**: 2025-01-XX  
**작성자**: AI Assistant  
**버전**: 1.0

