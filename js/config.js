/**
 * 애플리케이션 설정 상수
 */
export const CONFIG = {
  WEIGHTS: {
    MIN_QUIZ: 0,      // 평가하기 모드 최소 가중치
    MAX: 5,           // 최대 가중치
    MIN_STUDY: 1,     // 공부하기 모드 최소 가중치
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
    LEFT: 'left',     // 왼쪽 정렬
    CENTER: 'center', // 중앙 정렬
    RIGHT: 'right'    // 오른쪽 정렬
  },
  
  QUESTION_TYPES: {
    JAPANESE: 'japanese',  // 일본어 표기 문제
    MEANING: 'meaning',    // 의미 문제
    PRONUNCIATION: 'pronunciation'  // 발음 문제 (현재 미사용)
  },
  
  RECENT_WORD_EXCLUSION_COUNT: 5,  // 최근 단어 제외 개수 (중복 방지)
  
  SPEECH: {
    LANG: 'ja-JP',        // Web Speech API 언어
    RATE: 0.9,            // 발음 속도 (학습용으로 약간 느리게)
    PITCH: 1              // 발음 피치
  },
  
  FEEDBACK: {
    DISPLAY_DURATION: 1500  // 피드백 메시지 표시 시간 (ms)
  }
};

