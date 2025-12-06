import { CONFIG } from '../config.js';
import { Question } from '../models/Question.js';
import { WeightService } from '../services/WeightService.js';
import { StatisticsService } from '../services/StatisticsService.js';
import { HistoryManager } from '../managers/HistoryManager.js';

/**
 * 평가하기 모드 클래스
 * 평가하기 모드 전용 로직 담당
 */
export class QuizMode {
  constructor(weightService, statisticsService, historyManager) {
    this.weightService = weightService;
    this.statisticsService = statisticsService;
    this.historyManager = historyManager;
    this.selectedQuestions = [];
  }
  
  /**
   * 선택된 문제 설정
   * @param {Array<Question>} questions - 문제 배열
   */
  setQuestions(questions) {
    this.selectedQuestions = questions;
    
    // 가중치 초기화
    const weightKeys = questions.map(q => q.weightKey);
    this.weightService.initialize(weightKeys, CONFIG.WEIGHTS.DEFAULT);
    
    // 트라이 횟수 초기화
    questions.forEach(question => {
      this.statisticsService.initializeTryCount(question.weightKey);
    });
  }
  
  /**
   * 선택된 문제 반환
   * @returns {Array<Question>} 문제 배열
   */
  getQuestions() {
    return this.selectedQuestions;
  }
  
  /**
   * 가중치 기반 랜덤 문제 선택
   * @returns {Question|null} 선택된 문제 또는 null
   */
  selectRandomQuestion() {
    // 최근 단어 제외 필터 생성
    const getWordKey = (item) => {
      if (item && item.fileName && item.id !== undefined) {
        return `${item.fileName}_${item.id}`;
      }
      return null;
    };
    
    const recentWordKeys = this.historyManager.getRecentWordKeys(
      CONFIG.RECENT_WORD_EXCLUSION_COUNT,
      getWordKey
    );
    
    // 필터 함수 생성
    const filterFn = recentWordKeys.size > 0
      ? (question) => {
          const wordKey = getWordKey(question.word);
          return !wordKey || !recentWordKeys.has(wordKey);
        }
      : null;
    
    // 가중치가 0보다 큰 문제만 선택
    const availableQuestions = this.selectedQuestions.filter(q => {
      return this.weightService.get(q.weightKey) > CONFIG.WEIGHTS.MIN_QUIZ;
    });
    
    if (availableQuestions.length === 0) {
      return null; // 모든 문제가 완료됨
    }
    
    // 최근 단어 제외 필터 적용 (남은 문제가 N개 초과일 때만)
    let filteredQuestions = availableQuestions;
    if (filterFn && availableQuestions.length > CONFIG.RECENT_WORD_EXCLUSION_COUNT) {
      filteredQuestions = availableQuestions.filter(filterFn);
      // 필터링 후 남은 문제가 N개 이하면 원래 사용
      if (filteredQuestions.length <= CONFIG.RECENT_WORD_EXCLUSION_COUNT) {
        filteredQuestions = availableQuestions;
      }
    }
    
    // 가중치 기반 랜덤 선택
    return this.weightService.selectWeightedRandom(
      filteredQuestions,
      (q) => q.weightKey
    );
  }
  
  /**
   * 다음 문제로 이동
   * @param {boolean} answerShown - 정답을 확인했는지 여부
   * @returns {Question|null} 다음 문제 또는 null (모든 문제 완료 시)
   */
  nextQuestion(answerShown) {
    const currentItem = this.historyManager.getCurrent();
    const isGoingBackThenForward = this.historyManager.isGoingBackThenForward();
    
    // 가중치 업데이트 (이전에서 다음으로 가는 경우는 가중치 변화 없음)
    if (currentItem && !isGoingBackThenForward) {
      const weightKey = currentItem.weightKey;
      
      // 트라이 횟수 증가
      this.statisticsService.incrementTryCount(weightKey);
      
      // 가중치 업데이트
      if (answerShown) {
        // 정답 확인 후: 가중치 증가
        this.weightService.increment(weightKey);
      } else {
        // 정답 확인 없이: 가중치 감소
        this.weightService.decrement(weightKey);
      }
      
      // 가중치가 0이 되면 완료 기록
      if (this.weightService.isCompleted(weightKey)) {
        this.statisticsService.recordCompletion(weightKey);
      }
    }
    
    // 다음 문제 선택
    const nextQuestion = this.selectRandomQuestion();
    if (!nextQuestion) {
      return null; // 모든 문제 완료
    }
    
    // 새로운 문제가 처음 나타날 때 트라이 횟수 초기화
    if (!this.statisticsService.getCompletedTryCount(nextQuestion.weightKey)) {
      this.statisticsService.initializeTryCount(nextQuestion.weightKey);
    }
    
    // 히스토리에 추가
    const questionItem = {
      ...nextQuestion.word.toJSON(),
      questionType: nextQuestion.questionType,
      questionLabel: nextQuestion.questionLabel,
      weightKey: nextQuestion.weightKey
    };
    
    this.historyManager.push(questionItem);
    
    return nextQuestion;
  }
  
  /**
   * 이전 문제로 이동
   * @returns {Object|null} 이전 문제 항목 또는 null
   */
  previousQuestion() {
    return this.historyManager.goBack();
  }
  
  /**
   * 진행도 계산
   * @returns {Object} 진행도 데이터 {completed, total}
   */
  calculateProgress() {
    const total = this.selectedQuestions.length;
    const completed = this.selectedQuestions.filter(q => {
      return this.weightService.isCompleted(q.weightKey);
    }).length;
    
    return { completed, total };
  }
  
  /**
   * 현재 문제의 가중치 반환
   * @returns {number} 가중치
   */
  getCurrentWeight() {
    const current = this.historyManager.getCurrent();
    if (current && current.weightKey) {
      return this.weightService.get(current.weightKey);
    }
    return CONFIG.WEIGHTS.DEFAULT;
  }
  
  /**
   * 통계 데이터 계산
   * @returns {Object} 통계 데이터
   */
  calculateStatistics() {
    return this.statisticsService.calculateStatistics(this.selectedQuestions);
  }
  
  /**
   * 통계 그룹화
   * @param {Object} stats - calculateStatistics()의 결과
   * @returns {Array} 그룹화된 통계 데이터
   */
  groupStatistics(stats) {
    return this.statisticsService.groupStatisticsByTryCount(stats);
  }
  
  /**
   * 초기화
   */
  reset() {
    this.selectedQuestions = [];
    this.weightService.clear();
    this.statisticsService.clear();
    this.historyManager.clear();
  }
}

