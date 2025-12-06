import { CONFIG } from '../config.js';
import { WordSet } from '../models/WordSet.js';
import { WeightService } from '../services/WeightService.js';
import { HistoryManager } from '../managers/HistoryManager.js';

/**
 * 공부하기 모드 클래스
 * 공부하기 모드 전용 로직 담당
 */
export class StudyMode {
  constructor(weightService, historyManager) {
    this.weightService = weightService;
    this.historyManager = historyManager;
    this.selectedWords = [];
    this.selectedWordSet = null;
    this.sortOrder = CONFIG.SORT_ORDERS.ASC;
  }
  
  /**
   * 선택된 단어 설정
   * @param {Array<Word>} words - 단어 배열
   */
  setWords(words) {
    this.selectedWords = words;
    
    // 가중치 초기화
    const weightKeys = words.map(w => w.weightKey);
    this.weightService.initialize(weightKeys, CONFIG.WEIGHTS.DEFAULT);
  }
  
  /**
   * 선택된 단어 반환
   * @returns {Array<Word>} 단어 배열
   */
  getWords() {
    return this.selectedWords;
  }
  
  /**
   * 단어셋 설정
   * @param {WordSet} wordSet - 단어셋
   */
  setWordSet(wordSet) {
    this.selectedWordSet = wordSet;
  }
  
  /**
   * 단어셋 반환
   * @returns {WordSet|null} 단어셋 또는 null
   */
  getWordSet() {
    return this.selectedWordSet;
  }
  
  /**
   * 가중치 기반 랜덤 단어 선택
   * @returns {Word|null} 선택된 단어 또는 null
   */
  selectRandomWord() {
    if (this.selectedWords.length === 0) {
      return null;
    }
    
    return this.weightService.selectWeightedRandom(
      this.selectedWords,
      (w) => w.weightKey
    );
  }
  
  /**
   * 다음 단어로 이동
   * @returns {Word|null} 다음 단어 또는 null
   */
  nextWord() {
    const currentItem = this.historyManager.getCurrent();
    const isGoingBackThenForward = this.historyManager.isGoingBackThenForward();
    
    // 가중치 업데이트 (이전에서 다음으로 가는 경우는 가중치 변화 없음)
    if (currentItem && !isGoingBackThenForward) {
      // 공부하기 모드: 항상 가중치 증가
      this.weightService.incrementStudy(currentItem.weightKey);
    }
    
    // 다음 단어 선택
    const nextWord = this.selectRandomWord();
    if (!nextWord) {
      return null;
    }
    
    // 히스토리에 추가
    this.historyManager.push(nextWord.toJSON());
    
    return nextWord;
  }
  
  /**
   * 이전 단어로 이동
   * @returns {Object|null} 이전 단어 항목 또는 null
   */
  previousWord() {
    return this.historyManager.goBack();
  }
  
  /**
   * 정렬 순서 설정
   * @param {string} order - 정렬 순서 ('asc', 'desc', 'random')
   */
  setSortOrder(order) {
    if (Object.values(CONFIG.SORT_ORDERS).includes(order)) {
      this.sortOrder = order;
    }
  }
  
  /**
   * 정렬 순서 반환
   * @returns {string} 정렬 순서
   */
  getSortOrder() {
    return this.sortOrder;
  }
  
  /**
   * 정렬 순서 토글 (asc → desc → random → asc)
   * @returns {string} 새로운 정렬 순서
   */
  toggleSortOrder() {
    if (this.sortOrder === CONFIG.SORT_ORDERS.ASC) {
      this.sortOrder = CONFIG.SORT_ORDERS.DESC;
    } else if (this.sortOrder === CONFIG.SORT_ORDERS.DESC) {
      this.sortOrder = CONFIG.SORT_ORDERS.RANDOM;
    } else {
      this.sortOrder = CONFIG.SORT_ORDERS.ASC;
    }
    return this.sortOrder;
  }
  
  /**
   * 정렬된 단어 배열 반환
   * @returns {Array<Word>} 정렬된 단어 배열
   */
  getSortedWords() {
    if (!this.selectedWordSet) {
      return [];
    }
    
    const words = [...this.selectedWordSet.words];
    
    if (this.sortOrder === CONFIG.SORT_ORDERS.ASC) {
      words.sort((a, b) => a.id - b.id);
    } else if (this.sortOrder === CONFIG.SORT_ORDERS.DESC) {
      words.sort((a, b) => b.id - a.id);
    } else if (this.sortOrder === CONFIG.SORT_ORDERS.RANDOM) {
      // Fisher-Yates 셔플 알고리즘
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
    }
    
    return words;
  }
  
  /**
   * 정렬 순서 아이콘 반환
   * @returns {string} 정렬 아이콘
   */
  getSortIcon() {
    if (this.sortOrder === CONFIG.SORT_ORDERS.ASC) {
      return ' ↑';
    } else if (this.sortOrder === CONFIG.SORT_ORDERS.DESC) {
      return ' ↓';
    } else {
      return ' ↕';
    }
  }
  
  /**
   * 현재 단어의 가중치 반환
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
   * 초기화
   */
  reset() {
    this.selectedWords = [];
    this.selectedWordSet = null;
    this.sortOrder = CONFIG.SORT_ORDERS.ASC;
    this.weightService.clear();
    this.historyManager.clear();
  }
}

