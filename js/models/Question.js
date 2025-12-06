import { Word } from './Word.js';
import { CONFIG } from '../config.js';

/**
 * 문제 모델 클래스
 */
export class Question {
  /**
   * @param {Object} data - 문제 데이터
   * @param {Word} data.word - 단어 객체
   * @param {string} data.questionType - 문제 유형 ('japanese', 'meaning')
   * @param {string} data.questionLabel - 문제 라벨 ('일본어 표기', '뜻')
   * @param {string} data.weightKey - 가중치 키
   */
  constructor(data) {
    this.word = data.word instanceof Word ? data.word : new Word(data.word);
    this.questionType = data.questionType || '';
    this.questionLabel = data.questionLabel || '';
    this.weightKey = data.weightKey || '';
  }
  
  /**
   * 문제 데이터 유효성 검증
   * @returns {boolean} 유효한 데이터인지 여부
   */
  isValid() {
    return (
      this.word instanceof Word &&
      this.word.isValid() &&
      this.questionType !== '' &&
      this.questionLabel !== '' &&
      this.weightKey !== ''
    );
  }
  
  /**
   * 문제 내용 반환 (문제로 표시할 텍스트)
   * @returns {string} 문제 내용
   */
  getQuestionText() {
    if (this.questionType === CONFIG.QUESTION_TYPES.JAPANESE) {
      return this.word.japanese;
    } else if (this.questionType === CONFIG.QUESTION_TYPES.MEANING) {
      return this.word.meaning;
    }
    return '';
  }
  
  /**
   * 정답 항목 배열 반환 (일본어 표기, 뜻, 발음 순서)
   * @returns {Array<Object>} 정답 항목 배열
   */
  getAnswerItems() {
    const items = [];
    const hasPronunciation = this.word.hasPronunciation();
    
    // 일본어 표기 항목 (문제 유형이 일본어 표기가 아닐 때만)
    if (this.questionType !== CONFIG.QUESTION_TYPES.JAPANESE) {
      const hasPlayButtonForJapanese = !hasPronunciation;
      items.push({
        label: '일본어 표기',
        value: this.word.japanese,
        hasPlayButton: hasPlayButtonForJapanese,
        playText: hasPlayButtonForJapanese ? this.word.japanese : null
      });
    }
    
    // 뜻 항목 (문제 유형이 뜻이 아닐 때만)
    if (this.questionType !== CONFIG.QUESTION_TYPES.MEANING) {
      items.push({
        label: '뜻',
        value: this.word.meaning,
        hasPlayButton: false,
        playText: null
      });
    }
    
    // 발음 항목 (발음이 있을 때만, 가장 아래)
    if (hasPronunciation && this.questionType !== CONFIG.QUESTION_TYPES.PRONUNCIATION) {
      items.push({
        label: '발음',
        value: this.word.pronunciation,
        hasPlayButton: true,
        playText: this.word.pronunciation
      });
    }
    
    return items;
  }
  
  /**
   * 객체로 직렬화
   * @returns {Object} 직렬화된 객체
   */
  toJSON() {
    return {
      word: this.word.toJSON(),
      questionType: this.questionType,
      questionLabel: this.questionLabel,
      weightKey: this.weightKey
    };
  }
  
  /**
   * JSON 데이터로부터 Question 객체 생성
   * @param {Object} json - JSON 데이터
   * @returns {Question} Question 객체
   */
  static fromJSON(json) {
    return new Question({
      word: Word.fromJSON(json.word),
      questionType: json.questionType,
      questionLabel: json.questionLabel,
      weightKey: json.weightKey
    });
  }
  
  /**
   * 단어와 문제 유형으로부터 가중치 키 생성
   * @param {string} fileName - 파일명
   * @param {number} wordId - 단어 ID
   * @param {string} questionType - 문제 유형
   * @returns {string} 가중치 키
   */
  static generateWeightKey(fileName, wordId, questionType) {
    return `${fileName}_${wordId}_${questionType}`;
  }
}

