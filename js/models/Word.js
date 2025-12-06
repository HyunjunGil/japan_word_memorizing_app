/**
 * 단어 모델 클래스
 */
export class Word {
  /**
   * @param {Object} data - 단어 데이터
   * @param {number} data.id - 단어 ID
   * @param {string} data.japanese - 일본어 표기
   * @param {string} data.pronunciation - 발음
   * @param {string} data.meaning - 한국어 의미
   * @param {string} [data.sent_jp] - 일본어 예문 (선택사항)
   * @param {string} [data.sent_kr] - 한국어 예문 번역 (선택사항)
   * @param {string} [data.fileName] - 파일명 (선택사항)
   */
  constructor(data) {
    this.id = data.id;
    this.japanese = data.japanese || '';
    this.pronunciation = data.pronunciation || '';
    this.meaning = data.meaning || '';
    this.sent_jp = data.sent_jp || '';
    this.sent_kr = data.sent_kr || '';
    this.fileName = data.fileName || '';
    
    // 가중치 키 생성 (fileName이 있을 때만)
    this.weightKey = this.fileName ? `${this.fileName}_${this.id}` : null;
  }
  
  /**
   * 단어 데이터 유효성 검증
   * @returns {boolean} 유효한 데이터인지 여부
   */
  isValid() {
    return (
      typeof this.id === 'number' &&
      this.japanese.trim() !== '' &&
      this.meaning.trim() !== ''
    );
  }
  
  /**
   * 발음이 있는지 확인
   * @returns {boolean} 발음이 있는지 여부
   */
  hasPronunciation() {
    return this.pronunciation && this.pronunciation.trim() !== '';
  }
  
  /**
   * 예문이 있는지 확인
   * @returns {boolean} 예문이 있는지 여부
   */
  hasSentence() {
    return (
      this.sent_jp && this.sent_jp.trim() !== '' &&
      this.sent_kr && this.sent_kr.trim() !== ''
    );
  }
  
  /**
   * 발음 재생에 사용할 텍스트 반환
   * @returns {string} 발음 또는 일본어 표기
   */
  getTextToSpeak() {
    return this.hasPronunciation() ? this.pronunciation : this.japanese;
  }
  
  /**
   * 객체로 직렬화
   * @returns {Object} 직렬화된 객체
   */
  toJSON() {
    return {
      id: this.id,
      japanese: this.japanese,
      pronunciation: this.pronunciation,
      meaning: this.meaning,
      sent_jp: this.sent_jp,
      sent_kr: this.sent_kr,
      fileName: this.fileName
    };
  }
  
  /**
   * JSON 데이터로부터 Word 객체 생성
   * @param {Object} json - JSON 데이터
   * @returns {Word} Word 객체
   */
  static fromJSON(json) {
    return new Word(json);
  }
}

