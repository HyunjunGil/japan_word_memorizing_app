import { Word } from './Word.js';

/**
 * 단어셋 모델 클래스
 */
export class WordSet {
  /**
   * @param {Object} data - 단어셋 데이터
   * @param {string} data.fileName - 파일명
   * @param {Array<Object>} data.words - 단어 배열
   */
  constructor(data) {
    this.fileName = data.fileName || '';
    this.words = (data.words || []).map(wordData => {
      const word = new Word({ ...wordData, fileName: this.fileName });
      return word;
    });
  }
  
  /**
   * 단어셋 데이터 유효성 검증
   * @returns {boolean} 유효한 데이터인지 여부
   */
  isValid() {
    return (
      typeof this.fileName === 'string' &&
      this.fileName.trim() !== '' &&
      Array.isArray(this.words) &&
      this.words.length > 0 &&
      this.words.every(word => word.isValid())
    );
  }
  
  /**
   * 단어 개수 반환
   * @returns {number} 단어 개수
   */
  getWordCount() {
    return this.words.length;
  }
  
  /**
   * ID로 단어 찾기
   * @param {number} id - 단어 ID
   * @returns {Word|null} 찾은 단어 또는 null
   */
  findWordById(id) {
    return this.words.find(word => word.id === id) || null;
  }
  
  /**
   * 단어 추가
   * @param {Word|Object} word - 추가할 단어
   */
  addWord(word) {
    const wordObj = word instanceof Word ? word : new Word({ ...word, fileName: this.fileName });
    if (wordObj.isValid()) {
      this.words.push(wordObj);
    }
  }
  
  /**
   * 단어 제거
   * @param {number} id - 제거할 단어 ID
   * @returns {boolean} 제거 성공 여부
   */
  removeWord(id) {
    const index = this.words.findIndex(word => word.id === id);
    if (index !== -1) {
      this.words.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * 단어 배열 정렬 (ID 기준)
   * @param {string} order - 정렬 순서 ('asc', 'desc', 'random')
   */
  sortWords(order = 'asc') {
    if (order === 'asc') {
      this.words.sort((a, b) => a.id - b.id);
    } else if (order === 'desc') {
      this.words.sort((a, b) => b.id - a.id);
    } else if (order === 'random') {
      // Fisher-Yates 셔플 알고리즘
      for (let i = this.words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
      }
    }
  }
  
  /**
   * 객체로 직렬화
   * @returns {Object} 직렬화된 객체
   */
  toJSON() {
    return {
      fileName: this.fileName,
      words: this.words.map(word => word.toJSON())
    };
  }
  
  /**
   * JSON 데이터로부터 WordSet 객체 생성
   * @param {Object} json - JSON 데이터
   * @returns {WordSet} WordSet 객체
   */
  static fromJSON(json) {
    return new WordSet(json);
  }
}

