import { WordSet } from '../models/WordSet.js';
import { CONFIG } from '../config.js';

/**
 * 단어셋 서비스 클래스
 * 단어셋 로드 및 관리 담당
 */
export class WordSetService {
  constructor() {
    this.wordSets = [];
  }
  
  /**
   * JSON 파일에서 단어셋 로드
   * @param {string} fileName - 파일명 (확장자 제외)
   * @returns {Promise<WordSet|null>} 로드된 WordSet 객체 또는 null
   */
  async loadWordSet(fileName) {
    try {
      const response = await fetch(`results/${fileName}.json`);
      if (!response.ok) {
        console.warn(`파일 ${fileName}.json을 찾을 수 없습니다.`);
        return null;
      }
      const data = await response.json();
      const wordSet = WordSet.fromJSON(data);
      
      if (!wordSet.isValid()) {
        console.warn(`파일 ${fileName}.json의 데이터가 유효하지 않습니다.`);
        return null;
      }
      
      return wordSet;
    } catch (error) {
      console.warn(`파일 ${fileName}.json 로드 실패:`, error);
      return null;
    }
  }
  
  /**
   * 모든 단어셋 파일 로드 (page_01~99, grammar_01~99)
   * @returns {Promise<WordSet[]>} 로드된 WordSet 배열
   */
  async loadAllWordSets() {
    const wordSetPromises = [];
    
    // page_01.json ~ page_99.json 시도
    for (let i = 1; i <= CONFIG.FILES.MAX_PAGE; i++) {
      const pageNum = String(i).padStart(2, '0');
      wordSetPromises.push(this.loadWordSet(`page_${pageNum}`));
    }
    
    // grammar_01.json ~ grammar_99.json 시도
    for (let i = 1; i <= CONFIG.FILES.MAX_GRAMMAR; i++) {
      const grammarNum = String(i).padStart(2, '0');
      wordSetPromises.push(this.loadWordSet(`grammar_${grammarNum}`));
    }
    
    const loadedWordSets = await Promise.all(wordSetPromises);
    // null이 아닌 것만 필터링하여 추가
    this.wordSets = loadedWordSets.filter(set => set !== null);
    
    return this.wordSets;
  }
  
  /**
   * 단어셋 목록 반환
   * @returns {WordSet[]} 단어셋 배열
   */
  getWordSets() {
    return this.wordSets;
  }
  
  /**
   * 파일명으로 단어셋 찾기
   * @param {string} fileName - 파일명
   * @returns {WordSet|null} 찾은 WordSet 또는 null
   */
  findWordSetByFileName(fileName) {
    return this.wordSets.find(set => set.fileName === fileName) || null;
  }
  
  /**
   * 단어셋 추가
   * @param {WordSet} wordSet - 추가할 WordSet
   */
  addWordSet(wordSet) {
    if (wordSet instanceof WordSet && wordSet.isValid()) {
      // 중복 체크 (파일명으로)
      const existingIndex = this.wordSets.findIndex(set => set.fileName === wordSet.fileName);
      if (existingIndex >= 0) {
        this.wordSets[existingIndex] = wordSet;
      } else {
        this.wordSets.push(wordSet);
      }
    }
  }
  
  /**
   * 단어셋 제거
   * @param {string} fileName - 제거할 파일명
   * @returns {boolean} 제거 성공 여부
   */
  removeWordSet(fileName) {
    const index = this.wordSets.findIndex(set => set.fileName === fileName);
    if (index !== -1) {
      this.wordSets.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * 단어셋 목록 초기화
   */
  clear() {
    this.wordSets = [];
  }
}

