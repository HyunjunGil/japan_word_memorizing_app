import { CONFIG } from '../config.js';
import { WordSet } from '../models/WordSet.js';
import { SortUtils } from '../utils/SortUtils.js';
import { DOMUtils } from '../utils/DOMUtils.js';

/**
 * 공부하기 테이블 UI 클래스
 * 공부하기 테이블 화면 렌더링 및 관리
 */
export class StudyTableUI {
  constructor(clipboardUtils, voiceManager) {
    this.clipboardUtils = clipboardUtils;
    this.voiceManager = voiceManager;
    this.container = DOMUtils.getElement('studyTableContainer');
    this.sortOrder = CONFIG.SORT_ORDERS.ASC;
    this.visibilityStates = {};
  }
  
  /**
   * 테이블 렌더링
   * @param {WordSet} wordSet - 단어셋
   * @param {string} sortOrder - 정렬 순서
   * @param {Function} onToggleSort - 정렬 토글 콜백
   * @param {Function} onToggleColumn - 컬럼 토글 콜백
   * @param {Function} onToggleCell - 셀 토글 콜백
   * @param {Function} onPlayPronunciation - 발음 재생 콜백
   */
  render(wordSet, sortOrder = CONFIG.SORT_ORDERS.ASC, onToggleSort, onToggleColumn, onToggleCell, onPlayPronunciation) {
    this.sortOrder = sortOrder;
    
    // 정렬된 단어 배열 생성
    const words = [...wordSet.words];
    const sortedWords = SortUtils.sortByOrder(words, sortOrder, (w) => w.id);
    
    // 정렬 순서 아이콘
    const sortIcon = SortUtils.getSortIcon(sortOrder);
    
    // 안내 문구
    const infoHTML = `
      <div class="study-table-info">
        각 텍스트를 클릭하여 보임/숨김 처리할 수 있습니다<br>
        텍스트를 길게 누르면 클립보드에 복사됩니다
      </div>
    `;
    
    // 테이블 HTML 생성
    const tableHTML = `
      <table class="study-table">
        <thead>
          <tr>
            <th class="id-cell" data-sort="id" style="cursor: pointer;" title="ID 정렬 변경">ID${sortIcon}</th>
            <th class="play-cell">재생</th>
            <th class="japanese-cell" data-column="japanese">일본어 표기</th>
            <th class="pronunciation-cell" data-column="pronunciation">발음</th>
            <th class="meaning-cell" data-column="meaning">의미</th>
            <th class="sentence-cell">예문</th>
          </tr>
        </thead>
        <tbody>
          ${sortedWords.map((word) => this.createTableRow(word)).join('')}
        </tbody>
      </table>
    `;
    
    DOMUtils.setHTML(this.container, infoHTML + tableHTML);
    
    // 이벤트 리스너 추가
    this.attachEventListeners(onToggleSort, onToggleColumn, onToggleCell, onPlayPronunciation);
    
    // 보임/숨김 상태 복원
    this.restoreVisibilityStates();
  }
  
  /**
   * 테이블 행 생성
   * @param {Word} word - 단어 객체
   * @returns {string} 행 HTML
   */
  createTableRow(word) {
    const textToSpeak = word.getTextToSpeak();
    const hasSentence = word.hasSentence();
    
    const sentenceCellHTML = hasSentence ? `
      <td class="sentence-cell" data-text="${this.escapeHtml(word.sent_jp)}">
        <div class="sentence-jp">${this.escapeHtml(word.sent_jp)}</div>
        <div class="sentence-kr">${this.escapeHtml(word.sent_kr)}</div>
      </td>
    ` : `<td class="sentence-cell">-</td>`;
    
    return `
      <tr data-word-id="${word.id}">
        <td class="id-cell">${word.id}</td>
        <td class="play-cell">
          <button class="play-button" data-text="${this.escapeHtml(textToSpeak)}" title="발음 재생">▶</button>
        </td>
        <td class="japanese-cell" data-text="${this.escapeHtml(word.japanese)}">${this.escapeHtml(word.japanese)}</td>
        <td class="pronunciation-cell" data-text="${this.escapeHtml(word.pronunciation)}">${this.escapeHtml(word.pronunciation)}</td>
        <td class="meaning-cell" data-text="${this.escapeHtml(word.meaning)}">${this.escapeHtml(word.meaning)}</td>
        ${sentenceCellHTML}
      </tr>
    `;
  }
  
  /**
   * 이벤트 리스너 추가
   */
  attachEventListeners(onToggleSort, onToggleColumn, onToggleCell, onPlayPronunciation) {
    // ID 정렬 헤더
    const idHeader = this.container.querySelector('th[data-sort="id"]');
    if (idHeader && onToggleSort) {
      idHeader.addEventListener('click', onToggleSort);
    }
    
    // 컬럼 헤더
    this.container.querySelectorAll('th[data-column]').forEach(header => {
      const columnType = header.dataset.column;
      if (onToggleColumn) {
        header.addEventListener('click', () => onToggleColumn(columnType));
      }
    });
    
    // 재생 버튼
    this.container.querySelectorAll('.play-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        if (text && onPlayPronunciation) {
          onPlayPronunciation(text);
        }
      });
    });
    
    // 셀 클릭 및 긴 누름
    this.container.querySelectorAll('td[data-text]').forEach(cell => {
      const text = cell.dataset.text;
      
      // 클릭 이벤트
      if (onToggleCell) {
        cell.addEventListener('click', (e) => {
          this.clipboardUtils.setClickTimer(() => {
            if (!this.clipboardUtils.isLongPressCompleted()) {
              onToggleCell(cell);
            }
            this.clipboardUtils.resetLongPressFlag();
          });
        });
      }
      
      // 긴 누름 이벤트
      cell.addEventListener('mousedown', () => {
        this.clipboardUtils.startLongPress(cell, text);
      });
      cell.addEventListener('mouseup', () => {
        this.clipboardUtils.endLongPress();
      });
      cell.addEventListener('mouseleave', () => {
        this.clipboardUtils.endLongPress();
      });
      cell.addEventListener('touchstart', () => {
        this.clipboardUtils.startLongPress(cell, text);
      });
      cell.addEventListener('touchend', () => {
        this.clipboardUtils.endLongPress();
      });
      cell.addEventListener('touchcancel', () => {
        this.clipboardUtils.endLongPress();
      });
      cell.addEventListener('touchmove', () => {
        this.clipboardUtils.endLongPress();
      });
    });
  }
  
  /**
   * 보임/숨김 상태 저장
   */
  saveVisibilityStates() {
    const states = {};
    const rows = this.container.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const wordId = row.dataset.wordId;
      const cells = row.querySelectorAll('[class*="-cell"]');
      
      cells.forEach(cell => {
        const className = Array.from(cell.classList).find(cls => cls.includes('-cell'));
        if (className) {
          const fieldType = className.replace('-cell', '');
          const key = `${wordId}_${fieldType}`;
          states[key] = cell.classList.contains('hidden-text');
        }
      });
    });
    
    this.visibilityStates = states;
    return states;
  }
  
  /**
   * 보임/숨김 상태 복원
   */
  restoreVisibilityStates() {
    if (Object.keys(this.visibilityStates).length === 0) {
      return;
    }
    
    const rows = this.container.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const wordId = row.dataset.wordId;
      const cells = row.querySelectorAll('[class*="-cell"]');
      
      cells.forEach(cell => {
        const className = Array.from(cell.classList).find(cls => cls.includes('-cell'));
        if (className) {
          const fieldType = className.replace('-cell', '');
          const key = `${wordId}_${fieldType}`;
          
          if (this.visibilityStates.hasOwnProperty(key)) {
            if (this.visibilityStates[key]) {
              cell.classList.add('hidden-text');
            } else {
              cell.classList.remove('hidden-text');
            }
          }
        }
      });
    });
  }
  
  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

