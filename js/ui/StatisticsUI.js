import { DOMUtils } from '../utils/DOMUtils.js';
import { ClipboardUtils } from '../utils/ClipboardUtils.js';

/**
 * 통계 UI 클래스
 * 통계 화면 렌더링 및 관리
 */
export class StatisticsUI {
  constructor(clipboardUtils, voiceManager) {
    this.clipboardUtils = clipboardUtils;
    this.voiceManager = voiceManager;
    this.container = DOMUtils.getElement('statisticsContainer');
    this.content = DOMUtils.getElement('statisticsContent');
  }
  
  /**
   * 통계 업데이트
   * @param {Object} stats - 통계 데이터 (calculateStatistics 결과)
   * @param {Array} groups - 그룹화된 통계 데이터
   * @param {Function} onToggleDetail - 상세 토글 콜백
   * @param {Function} onToggleColumn - 컬럼 토글 콜백
   * @param {Function} onToggleCell - 셀 토글 콜백
   * @param {Function} onPlayPronunciation - 발음 재생 콜백
   */
  update(stats, groups, onToggleDetail, onToggleColumn, onToggleCell, onPlayPronunciation) {
    if (!this.container || !this.content) {
      return;
    }
    
    const { totalCompleted, totalQuestions, avgTryCount } = stats;
    
    // 통계가 없으면 간단한 메시지 표시
    if (totalCompleted === 0) {
      DOMUtils.toggleVisibility(this.container, true);
      DOMUtils.setHTML(this.content, `
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          아직 완료된 문제가 없습니다. 문제를 풀어보세요!
        </div>
      `);
      return;
    }
    
    DOMUtils.toggleVisibility(this.container, true);
    
    // 전체 요약 정보
    let html = `
      <div style="margin-bottom: 15px; padding: 10px; background: #f8f9ff; border-radius: 8px; text-align: center; font-size: 14px; color: #666;">
        완료된 문제: ${totalCompleted}개 / 전체: ${totalQuestions}개 | 평균 트라이 횟수: ${avgTryCount}회
      </div>
    `;
    
    // 각 그룹별 통계
    groups.forEach(group => {
      html += this.createStatisticsItem(group, onToggleDetail, onToggleColumn, onToggleCell, onPlayPronunciation);
    });
    
    DOMUtils.setHTML(this.content, html);
    
    // 이벤트 리스너 추가
    this.attachEventListeners(onToggleDetail, onToggleColumn, onToggleCell, onPlayPronunciation);
  }
  
  /**
   * 통계 항목 생성
   */
  createStatisticsItem(group, onToggleDetail, onToggleColumn, onToggleCell, onPlayPronunciation) {
    const { tryCount, label, count, percentage, barWidth, questions } = group;
    
    return `
      <div class="statistics-item" data-try-count="${tryCount}">
        <div class="statistics-item-row">
          <div class="statistics-label" data-try-count="${tryCount}">${label}</div>
          <div class="statistics-bar-container">
            <div class="statistics-bar" style="width: ${barWidth}%">
              ${count > 0 ? count : ''}
            </div>
          </div>
          <div class="statistics-count">${count}개</div>
          <div class="statistics-percentage">${percentage}%</div>
        </div>
        ${this.createDetailTable(tryCount, questions, onToggleColumn, onToggleCell, onPlayPronunciation)}
      </div>
    `;
  }
  
  /**
   * 상세 테이블 생성
   */
  createDetailTable(tryCount, questions, onToggleColumn, onToggleCell, onPlayPronunciation) {
    if (!questions || questions.length === 0) {
      return '';
    }
    
    const tableRows = questions.map(q => {
      const word = q.word;
      const textToSpeak = word.getTextToSpeak();
      const hasSentence = word.hasSentence();
      
      const sentenceCellHTML = hasSentence ? `
        <td class="sentence-cell" data-text="${this.escapeHtml(word.sent_jp)}">
          <div class="sentence-jp">${this.escapeHtml(word.sent_jp)}</div>
          <div class="sentence-kr">${this.escapeHtml(word.sent_kr)}</div>
        </td>
      ` : `<td class="sentence-cell">-</td>`;
      
      return `
        <tr>
          <td class="file-name-cell">${this.escapeHtml(word.fileName)}</td>
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
    }).join('');
    
    return `
      <div class="statistics-detail-container" id="statisticsDetail_${tryCount}">
        <div class="study-table-info" style="margin-bottom: 10px;">
          각 텍스트를 클릭하여 보임/숨김 처리할 수 있습니다<br>
          텍스트를 길게 누르면 클립보드에 복사됩니다
        </div>
        <div class="statistics-detail-table-container">
          <table class="statistics-detail-table">
            <thead>
              <tr>
                <th class="file-name-cell">파일명</th>
                <th class="id-cell">ID</th>
                <th class="play-cell">재생</th>
                <th class="japanese-cell" data-column="japanese">일본어 표기</th>
                <th class="pronunciation-cell" data-column="pronunciation">발음</th>
                <th class="meaning-cell" data-column="meaning">의미</th>
                <th class="sentence-cell">예문</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  /**
   * 이벤트 리스너 추가
   */
  attachEventListeners(onToggleDetail, onToggleColumn, onToggleCell, onPlayPronunciation) {
    // 통계 레이블 클릭 (상세 토글)
    this.content.querySelectorAll('.statistics-label[data-try-count]').forEach(label => {
      label.addEventListener('click', () => {
        const tryCount = label.dataset.tryCount;
        if (onToggleDetail) {
          onToggleDetail(tryCount);
        }
      });
    });
    
    // 컬럼 헤더 클릭
    this.content.querySelectorAll('th[data-column]').forEach(header => {
      const columnType = header.dataset.column;
      header.addEventListener('click', () => {
        if (onToggleColumn) {
          onToggleColumn(header, columnType);
        }
      });
    });
    
    // 재생 버튼
    this.content.querySelectorAll('.play-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        if (text && onPlayPronunciation) {
          onPlayPronunciation(text);
        }
      });
    });
    
    // 셀 클릭 및 긴 누름 (StudyTableUI와 동일한 로직)
    this.content.querySelectorAll('td[data-text]').forEach(cell => {
      const text = cell.dataset.text;
      
      if (onToggleCell) {
        cell.addEventListener('click', () => {
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
   * 상세 테이블 토글
   * @param {string|number} tryCount - 트라이 횟수
   */
  toggleDetail(tryCount) {
    const container = DOMUtils.getElement(`statisticsDetail_${tryCount}`);
    if (container) {
      DOMUtils.toggleClass(container, 'show');
    }
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

