/**
 * 히스토리 관리자 클래스
 * 학습 히스토리 스택 관리 및 네비게이션 담당
 */
export class HistoryManager {
  constructor() {
    this.history = [];        // 히스토리 스택
    this.currentIndex = -1;   // 현재 인덱스
  }
  
  /**
   * 히스토리에 항목 추가
   * @param {Object} item - 추가할 항목
   */
  push(item) {
    // 스택 방식: 현재 위치 이후의 히스토리 제거 (이전으로 갔다가 다시 다음을 누른 경우)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    this.history.push(item);
    this.currentIndex = this.history.length - 1;
  }
  
  /**
   * 이전 항목으로 이동
   * @returns {Object|null} 이전 항목 또는 null
   */
  goBack() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrent();
    }
    return null;
  }
  
  /**
   * 다음 항목으로 이동 (새 항목 추가)
   * @param {Object} item - 추가할 항목
   */
  goForward(item) {
    this.push(item);
  }
  
  /**
   * 현재 항목 반환
   * @returns {Object|null} 현재 항목 또는 null
   */
  getCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * 이전 항목이 있는지 확인
   * @returns {boolean} 이전 항목 존재 여부
   */
  hasPrevious() {
    return this.currentIndex > 0;
  }
  
  /**
   * 다음 항목이 있는지 확인
   * @returns {boolean} 다음 항목 존재 여부
   */
  hasNext() {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * 현재 위치 이후로 이동하는지 확인 (이전으로 갔다가 다시 다음을 누른 경우)
   * @returns {boolean} 현재 위치 이후로 이동하는지 여부
   */
  isGoingBackThenForward() {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * 히스토리 길이 반환
   * @returns {number} 히스토리 길이
   */
  getLength() {
    return this.history.length;
  }
  
  /**
   * 현재 인덱스 반환
   * @returns {number} 현재 인덱스
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
  
  /**
   * 최근 N개 항목의 단어 키 추출 (중복 방지용)
   * @param {number} count - 추출할 개수
   * @param {Function} getWordKey - 항목에서 단어 키를 추출하는 함수
   * @returns {Set<string>} 단어 키 Set
   */
  getRecentWordKeys(count, getWordKey) {
    const recentKeys = new Set();
    const startIndex = Math.max(0, this.history.length - count);
    
    for (let i = startIndex; i < this.history.length; i++) {
      const wordKey = getWordKey(this.history[i]);
      if (wordKey) {
        recentKeys.add(wordKey);
      }
    }
    
    return recentKeys;
  }
  
  /**
   * 히스토리 초기화
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  /**
   * 히스토리 데이터 반환 (저장용)
   * @returns {Object} 히스토리 데이터
   */
  toJSON() {
    return {
      history: [...this.history],
      currentIndex: this.currentIndex
    };
  }
  
  /**
   * 히스토리 데이터 복원
   * @param {Object} data - 히스토리 데이터
   */
  fromJSON(data) {
    this.history = data.history || [];
    this.currentIndex = data.currentIndex !== undefined ? data.currentIndex : -1;
  }
}

