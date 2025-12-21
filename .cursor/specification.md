# 일본어 단어장 - 기술 사양서

## 📋 문서 개요

이 문서는 일본어 단어장 애플리케이션의 상세한 기술 사양, 아키텍처 설계, API 명세를 포함합니다.

**작성일**: 2025-12-06  
**버전**: 2.0.0  
**상태**: 리팩토링 완료

---

## 🏗 아키텍처 설계

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                      App (main.js)                      │
│                   애플리케이션 진입점                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       App.js                            │
│               메인 애플리케이션 클래스                        │
│            (모든 모듈을 통합하고 이벤트 조정)                   │
└─────────────────────────────────────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Services   │   │   Managers   │   │     Modes    │
│              │   │              │   │              │
│ - WordSet    │   │ - Session    │   │ - QuizMode   │
│ - Weight     │   │ - History    │   │ - StudyMode  │
│ - Statistics │   │ - Voice      │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌──────────────┐
                    │      UI      │
                    │              │
                    │ - FileSelect │
                    │ - Flashcard  │
                    │ - StudyTable │
                    │ - Statistics │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    Models    │
                    │              │
                    │ - Word       │
                    │ - WordSet    │
                    │ - Question   │
                    └──────────────┘
```

### 레이어 구조

1. **Presentation Layer (UI)**
   - 사용자 인터페이스 렌더링
   - 사용자 입력 처리
   - 이벤트 리스너 관리

2. **Business Logic Layer (Modes + Services)**
   - 학습 모드 로직 (평가하기/공부하기)
   - 가중치 계산
   - 통계 분석

3. **Data Layer (Models + Services)**
   - 데이터 구조 정의
   - 데이터 로드 및 관리
   - 상태 저장/복원

4. **Utility Layer**
   - 공통 헬퍼 함수
   - DOM 조작
   - 클립보드 처리

---

## 📦 모듈 명세

### 1. Config (config.js)

애플리케이션 전역 상수 정의

```javascript
export const CONFIG = {
  WEIGHTS: {
    MIN_QUIZ: 0,      // 평가하기 최소 가중치
    MAX: 5,           // 최대 가중치
    MIN_STUDY: 1,     // 공부하기 최소 가중치
    DEFAULT: 1        // 기본 가중치
  },
  
  TIMING: {
    LONG_PRESS: 500,  // 긴 누름 감지 시간 (ms)
    CLICK_DELAY: 100  // 클릭 지연 시간 (ms)
  },
  
  FILES: {
    MAX_PAGE: 99,     // 최대 page 파일 번호
    MAX_GRAMMAR: 99   // 최대 grammar 파일 번호
  },
  
  MODES: {
    QUIZ: 'quiz',     // 평가하기 모드
    STUDY: 'study'    // 공부하기 모드
  },
  
  SORT_ORDERS: {
    ASC: 'asc',       // 오름차순
    DESC: 'desc',     // 내림차순
    RANDOM: 'random'  // 랜덤
  },
  
  BUTTON_ALIGNMENT: {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
  },
  
  QUESTION_TYPES: {
    JAPANESE: 'japanese',
    MEANING: 'meaning',
    PRONUNCIATION: 'pronunciation'
  },
  
  RECENT_WORD_EXCLUSION_COUNT: 5,  // 최근 단어 제외 개수
  
  SPEECH: {
    LANG: 'ja-JP',
    RATE: 0.9,
    PITCH: 1
  },
  
  FEEDBACK: {
    DISPLAY_DURATION: 1500
  }
};
```

---

### 2. Models

#### 2.1 Word (models/Word.js)

단어 데이터 모델

**속성**:
- `id`: number - 고유 식별자
- `japanese`: string - 일본어 표기
- `pronunciation`: string - 발음
- `meaning`: string - 한국어 의미
- `sent_jp`: string - 일본어 예문 (optional)
- `sent_kr`: string - 한국어 예문 (optional)
- `fileName`: string - 출처 파일명

**메서드**:
```javascript
hasSentence(): boolean
  // 예문 존재 여부 확인

getTextToSpeak(): string
  // 발음 재생용 텍스트 반환 (일본어 또는 발음)
```

#### 2.2 WordSet (models/WordSet.js)

단어 세트 모델

**속성**:
- `fileName`: string - 파일명
- `words`: Word[] - 단어 배열

**메서드**:
```javascript
getWord(id: number): Word | undefined
  // ID로 단어 찾기

getWordCount(): number
  // 단어 개수 반환
```

#### 2.3 Question (models/Question.js)

문제 모델

**속성**:
- `type`: string - 문제 유형 (japanese/meaning)
- `word`: Word - 단어 객체
- `weightKey`: string - 가중치 키

**메서드**:
```javascript
getQuestion(): string
  // 문제 텍스트 반환

getAnswer(): object
  // 정답 객체 반환 { japanese, pronunciation, meaning }
```

---

### 3. Services

#### 3.1 WordSetService (services/WordSetService.js)

단어셋 로드 및 관리 서비스

**메서드**:
```javascript
async loadWordSets(fileNames: string[]): Promise<WordSet[]>
  // 파일명 배열로부터 단어셋 로드
  // @param fileNames - 로드할 파일명 배열
  // @returns 로드된 WordSet 배열
  // @throws 파일 로드 실패 시 에러

getAvailableFiles(type: 'page'|'grammar', maxCount: number): Promise<string[]>
  // 사용 가능한 파일 목록 조회
  // @param type - 파일 유형
  // @param maxCount - 최대 파일 개수
  // @returns 존재하는 파일명 배열
```

**구현 세부사항**:
- `fetch` API 사용하여 JSON 파일 로드
- 파일별로 Word 객체 생성
- 에러 처리 및 로그

#### 3.2 WeightService (services/WeightService.js)

가중치 관리 서비스

**메서드**:
```javascript
initializeWeights(questions: Question[]): void
  // 문제 배열의 가중치 초기화

getWeight(weightKey: string): number
  // 가중치 조회

increaseWeight(weightKey: string): void
  // 오답 시 가중치 증가 (MAX까지)

decreaseWeight(weightKey: string, mode: string): void
  // 정답 시 가중치 감소 (MIN_QUIZ 또는 MIN_STUDY까지)

getTotalWeight(): number
  // 전체 가중치 합계 반환

clear(): void
  // 모든 가중치 초기화
```

**가중치 로직**:
- 정답: weight - 1 (최소값까지)
- 오답: weight + 1 (최대값 5까지)
- 평가하기 최소값: 0
- 공부하기 최소값: 1

#### 3.3 StatisticsService (services/StatisticsService.js)

통계 계산 및 관리 서비스

**메서드**:
```javascript
initializeTryCount(weightKey: string): void
  // 트라이 횟수 초기화

incrementTryCount(weightKey: string): number
  // 트라이 횟수 증가

recordCompletion(weightKey: string): void
  // 완료된 문제의 트라이 횟수 기록

getCompletedTryCount(weightKey: string): number|null
  // 완료된 문제의 트라이 횟수 조회

calculateStatistics(questions: Question[]): object
  // 통계 계산
  // @returns {
  //   tryCountDistribution: {횟수: 개수},
  //   tryCountQuestions: {횟수: [문제 배열]},
  //   totalCompleted: number,
  //   totalQuestions: number,
  //   avgTryCount: number
  // }

groupStatisticsByTryCount(stats: object): array
  // 트라이 횟수별로 그룹화
  // @returns 그룹 배열 [{tryCount, label, count, percentage, barWidth, questions}]

clear(): void
  // 모든 통계 초기화
```

**트라이 횟수 계산**:
- 실제 트라이 횟수는 1, 3, 5, 7... (홀수)
- 표시 횟수 = Math.floor((실제 횟수 + 1) / 2)
  - 1회 시도 → "1회" 표시
  - 3회 시도 → "2회" 표시
  - 5회 시도 → "3회" 표시
- 5회 이상은 "3회+"로 통합 표시

---

### 4. Managers

#### 4.1 StudySessionManager (managers/StudySessionManager.js)

학습 세션 상태 관리

**속성**:
- `isActive`: boolean - 세션 활성화 상태
- `mode`: string - 현재 모드 (quiz/study)
- `selectedFiles`: string[] - 선택된 파일
- `startTime`: Date - 세션 시작 시간

**메서드**:
```javascript
startSession(mode: string, files: string[]): void
  // 새 세션 시작

endSession(): void
  // 세션 종료

isSessionActive(): boolean
  // 세션 활성화 여부

getMode(): string
  // 현재 모드 반환

getSessionDuration(): number
  // 세션 진행 시간 (ms)
```

#### 4.2 HistoryManager (managers/HistoryManager.js)

단어 히스토리 관리 (앞으로/뒤로 네비게이션)

**메서드**:
```javascript
push(question: Question): void
  // 히스토리에 문제 추가

canGoBack(): boolean
  // 뒤로 갈 수 있는지 확인

canGoForward(): boolean
  // 앞으로 갈 수 있는지 확인

goBack(): Question
  // 이전 문제로 이동

goForward(): Question
  // 다음 문제로 이동

getCurrentIndex(): number
  // 현재 인덱스 반환

clear(): void
  // 히스토리 초기화
```

**구현 세부사항**:
- 배열 기반 히스토리 스택
- 현재 위치 인덱스 관리
- 앞으로/뒤로 네비게이션 지원

#### 4.3 VoiceManager (managers/VoiceManager.js)

Web Speech API 관리

**메서드**:
```javascript
async initialize(): Promise<void>
  // 일본어 음성 초기화
  // Web Speech API의 voices 로드 대기

play(text: string): void
  // 텍스트 발음 재생
  // @param text - 발음할 일본어 텍스트

isAvailable(): boolean
  // 음성 기능 사용 가능 여부
```

**구현 세부사항**:
- Web Speech API의 SpeechSynthesis 사용
- 일본어 음성 (ja-JP) 자동 선택
- 음성이 없을 경우 graceful fallback

---

### 5. Modes

#### 5.1 QuizMode (modes/QuizMode.js)

평가하기 모드 로직

**메서드**:
```javascript
initialize(wordSets: WordSet[], questionTypes: string[]): void
  // 모드 초기화 및 문제 생성
  // @param wordSets - 단어셋 배열
  // @param questionTypes - 문제 유형 배열

selectNextQuestion(): Question
  // 다음 문제 선택 (가중치 기반 랜덤)
  // 최근 5개 단어 중복 방지

getCurrentQuestion(): Question
  // 현재 문제 반환

markCorrect(): void
  // 정답 처리 (가중치 감소, 완료 기록)

markIncorrect(): void
  // 오답 처리 (가중치 증가, 트라이 횟수 증가)

goBack(): Question
  // 이전 문제로 이동

canGoBack(): boolean
  // 뒤로 갈 수 있는지 확인

getProgress(): object
  // 진행률 반환 { completed, total }

calculateStatistics(): object
  // 통계 계산

groupStatistics(stats: object): array
  // 통계 그룹화

reset(): void
  // 모드 초기화
```

**문제 선택 알고리즘**:
1. 가중치 합계 계산
2. 0 ~ 합계 범위의 랜덤 값 생성
3. 누적 가중치로 문제 선택
4. 최근 5개 단어에 포함되면 재선택
5. 히스토리에 추가

#### 5.2 StudyMode (modes/StudyMode.js)

공부하기 모드 로직

**메서드**:
```javascript
initialize(wordSets: WordSet[]): void
  // 모드 초기화

getWords(): Word[]
  // 모든 단어 반환

sortWords(order: 'asc'|'desc'): void
  // ID 기준 정렬

toggleSortOrder(): string
  // 정렬 순서 토글 (asc ↔ desc)

getCurrentSortOrder(): string
  // 현재 정렬 순서 반환

reset(): void
  // 모드 초기화
```

---

### 6. UI Components

#### 6.1 FileSelectionUI (ui/FileSelectionUI.js)

파일 선택 화면 UI

**메서드**:
```javascript
show(): void
  // 화면 표시

hide(): void
  // 화면 숨김

renderFiles(files: string[], wordCounts: object): void
  // 파일 목록 렌더링
  // @param files - 파일명 배열
  // @param wordCounts - {fileName: count} 객체

getSelectedFiles(): string[]
  // 선택된 파일 반환

getSelectedMode(): string
  // 선택된 모드 반환 (quiz/study)

getSelectedQuestionTypes(): string[]
  // 선택된 문제 유형 반환
```

#### 6.2 FlashcardUI (ui/FlashcardUI.js)

플래시카드 화면 UI

**메서드**:
```javascript
show(): void
hide(): void

showQuestion(question: Question): void
  // 문제 표시
  // @param question - 표시할 문제

showAnswer(answer: object): void
  // 정답 표시
  // @param answer - {japanese, pronunciation, meaning}

hideAnswer(): void
  // 정답 숨김

updateProgress(completed: number, total: number): void
  // 진행률 업데이트

updateWeight(weight: number): void
  // 가중치 배지 업데이트

setButtonAlignment(alignment: 'left'|'center'|'right'): void
  // 버튼 정렬 설정

toggleAlignmentMenu(): void
  // 정렬 메뉴 토글
```

#### 6.3 StudyTableUI (ui/StudyTableUI.js)

공부하기 테이블 UI

**메서드**:
```javascript
show(): void
hide(): void

render(words: Word[], sortOrder: string): void
  // 테이블 렌더링
  // @param words - 단어 배열
  // @param sortOrder - 정렬 순서

toggleColumn(columnType: string): void
  // 컬럼 전체 토글

toggleCell(cell: HTMLElement): void
  // 개별 셀 토글
```

#### 6.4 StatisticsUI (ui/StatisticsUI.js)

통계 화면 UI

**메서드**:
```javascript
update(stats: object, groups: array, callbacks: object): void
  // 통계 업데이트
  // @param stats - 통계 데이터
  // @param groups - 그룹 배열
  // @param callbacks - 이벤트 콜백 객체

toggleDetail(tryCount: number|string): void
  // 상세 테이블 토글

createStatisticsItem(group: object): string
  // 통계 항목 HTML 생성

createDetailTable(tryCount: number|string, questions: Question[]): string
  // 상세 테이블 HTML 생성
```

---

### 7. Utilities

#### 7.1 ClipboardUtils (utils/ClipboardUtils.js)

클립보드 복사 유틸리티

**메서드**:
```javascript
startLongPress(element: HTMLElement, text: string): void
  // 긴 누름 시작
  // 500ms 후 클립보드에 복사

endLongPress(): void
  // 긴 누름 종료

setClickTimer(callback: Function): void
  // 클릭 타이머 설정 (긴 누름과 구분)

isLongPressCompleted(): boolean
  // 긴 누름 완료 여부

resetLongPressFlag(): void
  // 긴 누름 플래그 리셋
```

#### 7.2 DOMUtils (utils/DOMUtils.js)

DOM 조작 헬퍼

**메서드**:
```javascript
static getElement(id: string): HTMLElement|null
  // ID로 요소 찾기

static toggleVisibility(element: HTMLElement, show: boolean): void
  // 요소 표시/숨김

static addClass(element: HTMLElement, className: string): void
  // 클래스 추가

static removeClass(element: HTMLElement, className: string): void
  // 클래스 제거

static toggleClass(element: HTMLElement, className: string): void
  // 클래스 토글

static setHTML(element: HTMLElement, html: string): void
  // innerHTML 설정

static setText(element: HTMLElement, text: string): void
  // textContent 설정
```

#### 7.3 SortUtils (utils/SortUtils.js)

정렬 알고리즘

**메서드**:
```javascript
static fisherYatesShuffle(array: any[]): any[]
  // Fisher-Yates 셔플 알고리즘
  // 배열을 랜덤하게 섞음
  // @param array - 원본 배열 (변경됨)
  // @returns 셔플된 배열

static sortById(array: object[], order: 'asc'|'desc'): object[]
  // ID 기준 정렬
  // @param array - {id: number} 속성을 가진 객체 배열
  // @param order - 정렬 순서
  // @returns 정렬된 배열
```

---

## 🔄 데이터 흐름

### 평가하기 모드 흐름

```
1. 사용자 입력
   └─> FileSelectionUI.getSelectedFiles()
   └─> FileSelectionUI.getSelectedMode() === 'quiz'
   └─> FileSelectionUI.getSelectedQuestionTypes()

2. 초기화
   └─> WordSetService.loadWordSets(files)
   └─> QuizMode.initialize(wordSets, questionTypes)
        └─> WeightService.initializeWeights(questions)
        └─> StatisticsService 초기화

3. 문제 선택
   └─> QuizMode.selectNextQuestion()
        └─> WeightService.getTotalWeight()
        └─> 가중치 기반 랜덤 선택
        └─> 최근 5개 단어 중복 확인
        └─> HistoryManager.push(question)
        └─> StatisticsService.initializeTryCount(weightKey)

4. 문제 표시
   └─> FlashcardUI.showQuestion(question)
   └─> FlashcardUI.updateProgress(completed, total)
   └─> FlashcardUI.updateWeight(weight)

5. 사용자 답변
   5a. 정답
       └─> QuizMode.markCorrect()
            └─> WeightService.decreaseWeight(weightKey)
            └─> StatisticsService.recordCompletion(weightKey)
   
   5b. 오답
       └─> QuizMode.markIncorrect()
            └─> WeightService.increaseWeight(weightKey)
            └─> StatisticsService.incrementTryCount(weightKey)

6. 통계 업데이트
   └─> QuizMode.calculateStatistics()
   └─> QuizMode.groupStatistics(stats)
   └─> StatisticsUI.update(stats, groups)
```

### 공부하기 모드 흐름

```
1. 사용자 입력
   └─> FileSelectionUI.getSelectedFiles()
   └─> FileSelectionUI.getSelectedMode() === 'study'

2. 초기화
   └─> WordSetService.loadWordSets(files)
   └─> StudyMode.initialize(wordSets)

3. 테이블 렌더링
   └─> StudyMode.getWords()
   └─> StudyTableUI.render(words, sortOrder)

4. 사용자 상호작용
   4a. 정렬
       └─> StudyMode.toggleSortOrder()
       └─> StudyMode.sortWords(order)
       └─> StudyTableUI.render(words, order)
   
   4b. 컬럼 토글
       └─> StudyTableUI.toggleColumn(columnType)
   
   4c. 셀 토글
       └─> StudyTableUI.toggleCell(cell)
   
   4d. 클립보드 복사
       └─> ClipboardUtils.startLongPress(element, text)
       └─> (500ms 후) navigator.clipboard.writeText(text)
```

---

## 🎨 CSS 클래스 명세

### 주요 클래스

#### 레이아웃
- `.container`: 메인 컨테이너
- `.header`: 헤더 영역
- `.content`: 콘텐츠 영역

#### 파일 선택
- `.file-selection`: 파일 선택 컨테이너
- `.mode-selection`: 모드 선택 영역
- `.mode-option`: 모드 옵션 (선택 시 `.selected` 추가)
- `.file-list`: 파일 목록
- `.file-item`: 개별 파일 아이템
- `.question-type-selection`: 문제 유형 선택 영역

#### 플래시카드
- `.flashcard`: 플래시카드 컨테이너
- `.card`: 카드 (height: 500px 고정)
- `.card-question`: 문제 유형 라벨
- `.card-content`: 문제 내용 (48px)
- `.card-answer`: 정답 영역
- `.card-answer.hidden`: 정답 숨김 상태
- `.card-controls`: 버튼 영역
  - `.align-left`: 왼쪽 정렬
  - `.align-center`: 중앙 정렬
  - `.align-right`: 오른쪽 정렬
- `.progress-badge`: 진행률 배지 (좌상단)
- `.weight-badge`: 가중치 배지 (우상단)

#### 버튼
- `.btn`: 기본 버튼
- `.btn-primary`: 주요 버튼 (그라데이션)
- `.btn-secondary`: 보조 버튼
- `.btn-icon`: 아이콘 버튼 (56x56px 원형)
- `.btn:disabled`: 비활성화 버튼

#### 테이블
- `.study-table`: 공부하기 테이블
- `.statistics-detail-table`: 통계 상세 테이블
- `.japanese-cell`: 일본어 셀 (16px, bold)
- `.pronunciation-cell`: 발음 셀 (16px)
- `.meaning-cell`: 의미 셀 (16px)
- `.sentence-cell`: 예문 셀
- `.hidden-text`: 숨김 텍스트 (회색 배경, "•••" 표시)

#### 통계
- `.statistics-container`: 통계 컨테이너
- `.statistics-item`: 통계 항목
- `.statistics-item-row`: 통계 행 (min-height: 50px)
- `.statistics-label`: 트라이 횟수 라벨 (클릭 가능)
- `.statistics-bar-container`: 막대 그래프 컨테이너
- `.statistics-bar`: 막대 (그라데이션)
- `.statistics-detail-container`: 상세 테이블 컨테이너
- `.statistics-detail-container.show`: 표시 상태

#### 반응형
- `@media (max-width: 768px)`: 모바일 (텍스트 14px)
- `@media (max-width: 480px)`: 작은 모바일 (텍스트 12px)

---

## 🔧 설정 및 확장

### 새로운 문제 유형 추가

1. **config.js에 문제 유형 추가**
```javascript
QUESTION_TYPES: {
  JAPANESE: 'japanese',
  MEANING: 'meaning',
  PRONUNCIATION: 'pronunciation',
  NEW_TYPE: 'new_type'  // 추가
}
```

2. **Question.js 수정**
```javascript
getQuestion() {
  if (this.type === CONFIG.QUESTION_TYPES.NEW_TYPE) {
    return this.word.newProperty;
  }
  // ...
}
```

3. **FileSelectionUI.js 수정**
- 체크박스 옵션 추가

### 새로운 단어 속성 추가

1. **Word.js 모델 확장**
```javascript
constructor(data, fileName) {
  // 기존 속성...
  this.newProperty = data.newProperty || '';
}
```

2. **JSON 데이터 형식 업데이트**
```json
{
  "words": [
    {
      "id": 1,
      "japanese": "...",
      "newProperty": "..."
    }
  ]
}
```

### 통계 계산 방식 변경

`StatisticsService.js`의 `calculateStatistics()` 메서드 수정

---

## 📊 성능 고려사항

### 최적화 포인트

1. **가중치 계산 캐싱**
   - `WeightService.getTotalWeight()`는 매번 계산하지 않고 변경 시에만 재계산

2. **DOM 업데이트 최소화**
   - 테이블 렌더링 시 innerHTML 한 번에 설정
   - 불필요한 리렌더링 방지

3. **이벤트 위임**
   - 테이블 셀에 개별 리스너 대신 부모에 위임 고려

4. **메모리 관리**
   - 히스토리 무제한 증가 방지 (필요시 최대 크기 제한)

### 성능 메트릭

- **초기 로드 시간**: < 1초 (단어 1000개 기준)
- **문제 선택 시간**: < 50ms
- **테이블 렌더링 시간**: < 200ms (단어 500개 기준)

---

## 🧪 테스트 가이드

### 단위 테스트 대상

1. **Models**
   - Word.hasSentence()
   - Question.getQuestion()
   - Question.getAnswer()

2. **Services**
   - WeightService.increaseWeight()
   - WeightService.decreaseWeight()
   - StatisticsService.calculateStatistics()
   - SortUtils.fisherYatesShuffle()

3. **Managers**
   - HistoryManager.push/goBack/goForward
   - VoiceManager.initialize()

### 통합 테스트 시나리오

1. **평가하기 모드 전체 플로우**
   - 파일 선택 → 문제 풀기 → 정답/오답 → 통계 확인

2. **공부하기 모드 전체 플로우**
   - 파일 선택 → 테이블 표시 → 정렬 → 토글

3. **히스토리 네비게이션**
   - 문제 풀기 → 뒤로 → 앞으로 → 다시 풀기

### 엣지 케이스

- 단어가 0개인 파일
- 매우 많은 단어 (1000개 이상)
- 예문이 없는 단어
- 발음이 없는 단어
- 음성 API를 지원하지 않는 브라우저

---

## 🔐 보안 고려사항

1. **XSS 방어**
   - `escapeHtml()` 함수로 사용자 입력 이스케이프
   - `textContent` 사용 권장

2. **CORS**
   - 로컬 파일 로드 시 CORS 정책 준수
   - 로컬 서버 필요

3. **데이터 검증**
   - JSON 파싱 시 try-catch
   - 데이터 타입 검증

---

## 📈 향후 개선 사항

### 기능
- [ ] 학습 진행률 저장 (LocalStorage)
- [ ] 북마크 기능
- [ ] 검색 기능
- [ ] 다크 모드
- [ ] 키보드 단축키
- [ ] 오디오 파일 지원

### 기술
- [ ] Service Worker (오프라인 지원)
- [ ] IndexedDB (대용량 데이터)
- [ ] Web Workers (무거운 계산)
- [ ] TypeScript 마이그레이션
- [ ] 단위 테스트 추가

### UI/UX
- [ ] 애니메이션 개선
- [ ] 접근성 향상 (ARIA)
- [ ] 다국어 지원
- [ ] 커스텀 테마

---

## 📞 문서 유지보수

이 문서는 코드 변경 시 함께 업데이트되어야 합니다.

**마지막 업데이트**: 2025-12-06  
**다음 리뷰 예정일**: 2026-01-06

---

**문서 버전**: 2.0.0  
**작성자**: AI Assistant  
**상태**: ✅ 완료

