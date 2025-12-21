import { CONFIG } from '../config.js';
import { Question } from '../models/Question.js';
import { DOMUtils } from '../utils/DOMUtils.js';

/**
 * 플래시카드 UI 클래스
 * 플래시카드 화면 렌더링 및 관리
 */
export class FlashcardUI {
  constructor(voiceManager) {
    this.voiceManager = voiceManager;
    this.questionTypeElement = DOMUtils.getElement('questionType');
    this.cardContentElement = DOMUtils.getElement('cardContent');
    this.cardAnswerElement = DOMUtils.getElement('cardAnswer');
    this.showAnswerBtn = DOMUtils.getElement('showAnswerBtn');
    this.progressBadge = DOMUtils.getElement('progressBadge');
    this.progressValue = DOMUtils.getElement('progressValue');
    this.weightBadge = DOMUtils.getElement('weightBadge');
    this.weightValue = DOMUtils.getElement('weightValue');
  }
  
  /**
   * 평가 문제 표시
   * @param {Question|Object} question - 문제 객체
   * @param {Function} onPlayPronunciation - 발음 재생 콜백
   */
  displayQuiz(question, onPlayPronunciation = null) {
    const q = question instanceof Question ? question : new Question(question);
    const word = q.word;
    
    // 문제 유형 및 내용 표시
    DOMUtils.setText(this.questionTypeElement, q.questionLabel);
    DOMUtils.setText(this.cardContentElement, q.getQuestionText());
    this.cardContentElement.style.fontSize = '48px';
    
    // 정답 항목 생성
    const answerItems = q.getAnswerItems();
    const answerHTML = answerItems.map(ans => {
      const playButton = ans.hasPlayButton 
        ? `<button class="pronunciation-play-button" data-text="${this.escapeHtml(ans.playText)}" title="발음 재생">▶</button>`
        : '';
      const valueClass = ans.isSentence ? 'card-answer-value sentence-value' : 'card-answer-value';
      return `
        <div class="card-answer-item">
          <div class="card-answer-label">${ans.label}</div>
          <div class="${valueClass}">${this.escapeHtml(ans.value)}${playButton}</div>
        </div>
      `;
    }).join('');
    
    DOMUtils.setHTML(this.cardAnswerElement, answerHTML);
    DOMUtils.addClass(this.cardAnswerElement, 'hidden');
    DOMUtils.toggleVisibility(this.showAnswerBtn, true);
    DOMUtils.setText(this.showAnswerBtn, '?');
    
    // 발음 재생 버튼 이벤트 리스너 추가
    if (onPlayPronunciation) {
      this.cardAnswerElement.querySelectorAll('.pronunciation-play-button').forEach(btn => {
        btn.addEventListener('click', () => {
          const text = btn.dataset.text;
          if (text) {
            onPlayPronunciation(text);
          }
        });
      });
    }
  }
  
  /**
   * 정답 표시/숨김 토글
   * @param {boolean} show - 표시 여부
   */
  toggleAnswer(show = null) {
    if (show === null) {
      DOMUtils.toggleClass(this.cardAnswerElement, 'hidden');
      const isShown = !this.cardAnswerElement.classList.contains('hidden');
      DOMUtils.setText(this.showAnswerBtn, isShown ? '✓' : '?');
      return isShown;
    } else {
      if (show) {
        DOMUtils.removeClass(this.cardAnswerElement, 'hidden');
        DOMUtils.setText(this.showAnswerBtn, '✓');
      } else {
        DOMUtils.addClass(this.cardAnswerElement, 'hidden');
        DOMUtils.setText(this.showAnswerBtn, '?');
      }
      return show;
    }
  }
  
  /**
   * 진행도 업데이트
   * @param {number} completed - 완료된 문제 수
   * @param {number} total - 전체 문제 수
   */
  updateProgress(completed, total) {
    DOMUtils.setText(this.progressValue, `${completed} / ${total}`);
  }
  
  /**
   * 가중치 업데이트
   * @param {number} weight - 가중치
   */
  updateWeight(weight) {
    DOMUtils.setText(this.weightValue, weight);
  }
  
  /**
   * 이전 버튼 활성화/비활성화
   * @param {boolean} enabled - 활성화 여부
   */
  setPreviousButtonEnabled(enabled) {
    const prevBtn = DOMUtils.getElement('prevBtn');
    if (prevBtn) {
      prevBtn.disabled = !enabled;
    }
  }
  
  /**
   * HTML 이스케이프
   * @param {string} text - 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

