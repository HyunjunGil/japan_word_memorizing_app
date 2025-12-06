import { CONFIG } from '../config.js';
import { Word } from '../models/Word.js';
import { Question } from '../models/Question.js';

/**
 * 학습 세션 관리자 클래스
 * 학습 세션 상태 관리 및 모드 전환 담당
 */
export class StudySessionManager {
  constructor() {
    this.mode = CONFIG.MODES.QUIZ;  // 현재 모드
    this.selectedWords = [];         // 선택된 단어들
    this.selectedQuestions = [];    // 평가하기 모드용 문제 배열
    this.answerShown = false;       // 정답 표시 여부
    this.buttonAlignment = CONFIG.BUTTON_ALIGNMENT.CENTER;  // 버튼 정렬
  }
  
  /**
   * 모드 설정
   * @param {string} mode - 모드 ('quiz' 또는 'study')
   */
  setMode(mode) {
    if (mode === CONFIG.MODES.QUIZ || mode === CONFIG.MODES.STUDY) {
      this.mode = mode;
    }
  }
  
  /**
   * 현재 모드 반환
   * @returns {string} 현재 모드
   */
  getMode() {
    return this.mode;
  }
  
  /**
   * 평가하기 모드인지 확인
   * @returns {boolean} 평가하기 모드 여부
   */
  isQuizMode() {
    return this.mode === CONFIG.MODES.QUIZ;
  }
  
  /**
   * 공부하기 모드인지 확인
   * @returns {boolean} 공부하기 모드 여부
   */
  isStudyMode() {
    return this.mode === CONFIG.MODES.STUDY;
  }
  
  /**
   * 선택된 단어 설정
   * @param {Array<Word>} words - 선택된 단어 배열
   */
  setSelectedWords(words) {
    this.selectedWords = words.map(word => {
      if (word instanceof Word) {
        return word;
      }
      return new Word(word);
    });
  }
  
  /**
   * 선택된 단어 반환
   * @returns {Array<Word>} 선택된 단어 배열
   */
  getSelectedWords() {
    return this.selectedWords;
  }
  
  /**
   * 선택된 문제 설정
   * @param {Array<Question>} questions - 선택된 문제 배열
   */
  setSelectedQuestions(questions) {
    this.selectedQuestions = questions.map(q => {
      if (q instanceof Question) {
        return q;
      }
      return new Question(q);
    });
  }
  
  /**
   * 선택된 문제 반환
   * @returns {Array<Question>} 선택된 문제 배열
   */
  getSelectedQuestions() {
    return this.selectedQuestions;
  }
  
  /**
   * 문제 유형으로부터 문제 생성
   * @param {Array<Word>} words - 단어 배열
   * @param {Array<Object>} questionTypes - 문제 유형 배열 [{type, label}]
   * @returns {Array<Question>} 생성된 문제 배열
   */
  createQuestions(words, questionTypes) {
    const questions = [];
    
    words.forEach(word => {
      questionTypes.forEach(questionType => {
        const weightKey = Question.generateWeightKey(
          word.fileName,
          word.id,
          questionType.type
        );
        
        questions.push(new Question({
          word: word,
          questionType: questionType.type,
          questionLabel: questionType.label,
          weightKey: weightKey
        }));
      });
    });
    
    return questions;
  }
  
  /**
   * 정답 표시 상태 설정
   * @param {boolean} shown - 정답 표시 여부
   */
  setAnswerShown(shown) {
    this.answerShown = shown;
  }
  
  /**
   * 정답 표시 상태 반환
   * @returns {boolean} 정답 표시 여부
   */
  isAnswerShown() {
    return this.answerShown;
  }
  
  /**
   * 버튼 정렬 설정
   * @param {string} alignment - 정렬 ('left', 'center', 'right')
   */
  setButtonAlignment(alignment) {
    if (Object.values(CONFIG.BUTTON_ALIGNMENT).includes(alignment)) {
      this.buttonAlignment = alignment;
    }
  }
  
  /**
   * 버튼 정렬 반환
   * @returns {string} 버튼 정렬
   */
  getButtonAlignment() {
    return this.buttonAlignment;
  }
  
  /**
   * 세션 초기화
   */
  reset() {
    this.selectedWords = [];
    this.selectedQuestions = [];
    this.answerShown = false;
    this.mode = CONFIG.MODES.QUIZ;
    this.buttonAlignment = CONFIG.BUTTON_ALIGNMENT.CENTER;
  }
  
  /**
   * 세션 데이터 반환 (저장용)
   * @returns {Object} 세션 데이터
   */
  toJSON() {
    return {
      mode: this.mode,
      selectedWords: this.selectedWords.map(w => w.toJSON()),
      selectedQuestions: this.selectedQuestions.map(q => q.toJSON()),
      answerShown: this.answerShown,
      buttonAlignment: this.buttonAlignment
    };
  }
  
  /**
   * 세션 데이터 복원
   * @param {Object} data - 세션 데이터
   */
  fromJSON(data) {
    this.mode = data.mode || CONFIG.MODES.QUIZ;
    this.selectedWords = (data.selectedWords || []).map(w => Word.fromJSON(w));
    this.selectedQuestions = (data.selectedQuestions || []).map(q => Question.fromJSON(q));
    this.answerShown = data.answerShown || false;
    this.buttonAlignment = data.buttonAlignment || CONFIG.BUTTON_ALIGNMENT.CENTER;
  }
}

