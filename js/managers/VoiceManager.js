import { CONFIG } from '../config.js';

/**
 * 음성 관리자 클래스
 * Web Speech API 관리 및 발음 재생 담당
 */
export class VoiceManager {
  constructor() {
    this.voice = null;  // 일본어 음성 객체
    this.isInitialized = false;
  }
  
  /**
   * 음성 초기화
   * Chrome의 "Google 日本語" 음성을 우선적으로 찾음
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      // Google 일본어 음성 우선, 없으면 다른 일본어 음성 사용
      this.voice = voices.find(v => v.name === 'Google 日本語') 
             || voices.find(v => v.lang.startsWith('ja'));
      
      if (this.voice) {
        this.isInitialized = true;
      }
    };
    
    // 즉시 시도
    setVoice();
    
    // 음성 목록이 나중에 로드되는 경우를 대비
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setVoice;
    }
  }
  
  /**
   * 발음 재생
   * @param {string} text - 재생할 텍스트
   * @returns {Promise<void>} 재생 완료 Promise
   */
  async play(text) {
    if (!text || text.trim() === '') {
      return;
    }
    
    // 음성이 초기화되지 않았으면 초기화 시도
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // 이전 발화 중단
    speechSynthesis.cancel();
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = CONFIG.SPEECH.LANG;
      
      if (this.voice) {
        utterance.voice = this.voice;
      }
      
      utterance.rate = CONFIG.SPEECH.RATE;
      utterance.pitch = CONFIG.SPEECH.PITCH;
      
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = (e) => {
        console.error('발음 재생 실패:', e);
        reject(e);
      };
      
      speechSynthesis.speak(utterance);
    });
  }
  
  /**
   * 현재 재생 중인 발음 중단
   */
  stop() {
    speechSynthesis.cancel();
  }
  
  /**
   * 음성 객체 반환
   * @returns {SpeechSynthesisVoice|null} 음성 객체 또는 null
   */
  getVoice() {
    return this.voice;
  }
  
  /**
   * 초기화 여부 반환
   * @returns {boolean} 초기화 여부
   */
  isReady() {
    return this.isInitialized;
  }
  
  /**
   * 사용 가능한 일본어 음성 목록 반환
   * @returns {Array<SpeechSynthesisVoice>} 일본어 음성 배열
   */
  getAvailableVoices() {
    const voices = speechSynthesis.getVoices();
    return voices.filter(v => v.lang.startsWith('ja'));
  }
}

