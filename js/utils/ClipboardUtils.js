import { CONFIG } from '../config.js';

/**
 * 클립보드 유틸리티 클래스
 * 클립보드 복사 및 긴 누름 감지 담당
 */
export class ClipboardUtils {
  constructor() {
    this.longPressTimer = null;
    this.longPressCompleted = false;
    this.clickTimer = null;
  }
  
  /**
   * 긴 누름 시작
   * @param {HTMLElement} cell - 셀 요소
   * @param {string} text - 복사할 텍스트
   * @param {Function} onCopy - 복사 완료 콜백
   */
  startLongPress(cell, text, onCopy = null) {
    // 기존 타이머가 있으면 취소
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
    }
    
    // 플래그 초기화
    this.longPressCompleted = false;
    
    // 클릭 타이머 취소 (긴 누름이 시작되면 클릭 무시)
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    
    // 긴 누름 시간 후 클립보드에 복사
    this.longPressTimer = setTimeout(() => {
      this.copyToClipboard(text, onCopy);
      this.longPressTimer = null;
      this.longPressCompleted = true;
      
      // 시각적 피드백 (선택 효과)
      if (cell) {
        cell.style.backgroundColor = '#d4edda';
        setTimeout(() => {
          cell.style.backgroundColor = '';
        }, 200);
      }
    }, CONFIG.TIMING.LONG_PRESS);
  }
  
  /**
   * 긴 누름 종료
   */
  endLongPress() {
    // 타이머가 아직 실행 중이면 취소 (복사되지 않음)
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
      this.longPressCompleted = false;
    }
  }
  
  /**
   * 클립보드에 텍스트 복사
   * @param {string} text - 복사할 텍스트
   * @param {Function} onComplete - 완료 콜백 (선택사항)
   * @returns {Promise<void>}
   */
  async copyToClipboard(text, onComplete = null) {
    try {
      // Clipboard API 사용 (최신 브라우저)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showCopyFeedback('복사되었습니다!');
        if (onComplete) onComplete(true);
      } else {
        // 구형 브라우저 지원: 임시 textarea 사용
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showCopyFeedback('복사되었습니다!');
        if (onComplete) onComplete(true);
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      this.showCopyFeedback('복사 실패', true);
      if (onComplete) onComplete(false);
    }
  }
  
  /**
   * 복사 피드백 메시지 표시
   * @param {string} message - 메시지
   * @param {boolean} isError - 에러 여부
   */
  showCopyFeedback(message, isError = false) {
    // 기존 피드백이 있으면 제거
    const existingFeedback = document.getElementById('copyFeedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    // 피드백 요소 생성
    const feedback = document.createElement('div');
    feedback.id = 'copyFeedback';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${isError ? '#f8d7da' : '#d4edda'};
      color: ${isError ? '#721c24' : '#155724'};
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 16px;
      font-weight: bold;
      pointer-events: none;
      animation: fadeInOut ${CONFIG.FEEDBACK.DISPLAY_DURATION}ms ease-in-out;
    `;
    
    // 애니메이션 스타일 추가 (아직 없으면)
    if (!document.getElementById('copyFeedbackStyle')) {
      const style = document.createElement('style');
      style.id = 'copyFeedbackStyle';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    // 일정 시간 후 제거
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, CONFIG.FEEDBACK.DISPLAY_DURATION);
  }
  
  /**
   * 긴 누름이 완료되었는지 확인
   * @returns {boolean} 긴 누름 완료 여부
   */
  isLongPressCompleted() {
    return this.longPressCompleted;
  }
  
  /**
   * 긴 누름 완료 플래그 리셋
   */
  resetLongPressFlag() {
    this.longPressCompleted = false;
  }
  
  /**
   * 클릭 타이머 설정 (긴 누름과 구분하기 위해)
   * @param {Function} callback - 콜백 함수
   */
  setClickTimer(callback) {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }
    
    this.clickTimer = setTimeout(() => {
      // 긴 누름이 완료되지 않았을 때만 실행
      if (this.longPressTimer === null && !this.longPressCompleted) {
        callback();
      }
      this.clickTimer = null;
    }, CONFIG.TIMING.CLICK_DELAY);
  }
  
  /**
   * 클릭 타이머 취소
   */
  clearClickTimer() {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
  }
  
  /**
   * 모든 타이머 초기화
   */
  reset() {
    this.endLongPress();
    this.clearClickTimer();
    this.resetLongPressFlag();
  }
}

