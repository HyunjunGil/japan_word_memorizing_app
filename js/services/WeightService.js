import { CONFIG } from '../config.js';

/**
 * 가중치 서비스 클래스
 * 가중치 관리 및 가중치 기반 랜덤 선택 담당
 */
export class WeightService {
  constructor() {
    this.weights = {};
  }
  
  /**
   * 가중치 초기화 (모든 키를 기본값으로 설정)
   * @param {string[]} keys - 가중치 키 배열
   * @param {number} [defaultValue=CONFIG.WEIGHTS.DEFAULT] - 기본값
   */
  initialize(keys, defaultValue = CONFIG.WEIGHTS.DEFAULT) {
    keys.forEach(key => {
      this.weights[key] = defaultValue;
    });
  }
  
  /**
   * 가중치 가져오기
   * @param {string} key - 가중치 키
   * @param {number} [defaultValue=CONFIG.WEIGHTS.DEFAULT] - 기본값
   * @returns {number} 가중치 값
   */
  get(key, defaultValue = CONFIG.WEIGHTS.DEFAULT) {
    return this.weights[key] !== undefined ? this.weights[key] : defaultValue;
  }
  
  /**
   * 가중치 설정
   * @param {string} key - 가중치 키
   * @param {number} value - 가중치 값
   * @param {string} mode - 모드 ('quiz' 또는 'study')
   */
  set(key, value, mode = CONFIG.MODES.QUIZ) {
    const minWeight = mode === CONFIG.MODES.QUIZ 
      ? CONFIG.WEIGHTS.MIN_QUIZ 
      : CONFIG.WEIGHTS.MIN_STUDY;
    const maxWeight = CONFIG.WEIGHTS.MAX;
    
    // 범위 내로 제한
    this.weights[key] = Math.max(minWeight, Math.min(maxWeight, value));
  }
  
  /**
   * 가중치 증가 (평가하기 모드: 정답 확인 후)
   * @param {string} key - 가중치 키
   * @returns {number} 업데이트된 가중치
   */
  increment(key) {
    const current = this.get(key);
    this.set(key, current + 1, CONFIG.MODES.QUIZ);
    return this.weights[key];
  }
  
  /**
   * 가중치 감소 (평가하기 모드: 정답 확인 없이)
   * @param {string} key - 가중치 키
   * @returns {number} 업데이트된 가중치
   */
  decrement(key) {
    const current = this.get(key);
    this.set(key, current - 1, CONFIG.MODES.QUIZ);
    return this.weights[key];
  }
  
  /**
   * 가중치 증가 (공부하기 모드: 항상 증가)
   * @param {string} key - 가중치 키
   * @returns {number} 업데이트된 가중치
   */
  incrementStudy(key) {
    const current = this.get(key);
    this.set(key, current + 1, CONFIG.MODES.STUDY);
    return this.weights[key];
  }
  
  /**
   * 가중치가 0인지 확인 (평가하기 모드에서 완료 여부)
   * @param {string} key - 가중치 키
   * @returns {boolean} 가중치가 0인지 여부
   */
  isCompleted(key) {
    return this.get(key) === CONFIG.WEIGHTS.MIN_QUIZ;
  }
  
  /**
   * 가중치 기반 랜덤 선택
   * @param {Array} items - 선택할 항목 배열
   * @param {Function} getKey - 항목에서 키를 추출하는 함수
   * @param {Function} [filterFn] - 필터 함수 (선택사항)
   * @returns {Object|null} 선택된 항목 또는 null
   */
  selectWeightedRandom(items, getKey, filterFn = null) {
    // 필터링 적용
    let availableItems = filterFn ? items.filter(filterFn) : items;
    
    // 가중치가 0보다 큰 항목만 선택
    availableItems = availableItems.filter(item => {
      const key = getKey(item);
      return this.get(key) > CONFIG.WEIGHTS.MIN_QUIZ;
    });
    
    if (availableItems.length === 0) {
      return null;
    }
    
    // 총 가중치 계산
    const totalWeight = availableItems.reduce((sum, item) => {
      const key = getKey(item);
      return sum + this.get(key);
    }, 0);
    
    if (totalWeight === 0) {
      return null;
    }
    
    // 가중치 기반 랜덤 선택
    let random = Math.random() * totalWeight;
    
    for (let item of availableItems) {
      const key = getKey(item);
      const weight = this.get(key);
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return availableItems[0];
  }
  
  /**
   * 최근 항목 제외 필터 생성
   * @param {Array} recentItems - 최근 항목 배열
   * @param {Function} getWordKey - 항목에서 단어 키를 추출하는 함수
   * @returns {Function} 필터 함수
   */
  createRecentExclusionFilter(recentItems, getWordKey) {
    if (recentItems.length === 0) {
      return null;
    }
    
    const recentWordKeys = new Set();
    const recentCount = Math.min(CONFIG.RECENT_WORD_COUNT, recentItems.length);
    const recentSlice = recentItems.slice(-recentCount);
    
    recentSlice.forEach(item => {
      const wordKey = getWordKey(item);
      if (wordKey) {
        recentWordKeys.add(wordKey);
      }
    });
    
    return (item) => {
      const wordKey = getWordKey(item);
      return !wordKey || !recentWordKeys.has(wordKey);
    };
  }
  
  /**
   * 모든 가중치 초기화
   */
  clear() {
    this.weights = {};
  }
  
  /**
   * 가중치 객체 반환 (직접 접근 필요 시)
   * @returns {Object} 가중치 객체
   */
  getAll() {
    return { ...this.weights };
  }
  
  /**
   * 가중치 객체 설정 (복원 시 사용)
   * @param {Object} weights - 가중치 객체
   */
  setAll(weights) {
    this.weights = { ...weights };
  }
}

