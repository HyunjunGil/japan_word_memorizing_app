import { SortUtils } from '../utils/SortUtils.js';
import { DOMUtils } from '../utils/DOMUtils.js';

/**
 * 파일 선택 UI 클래스
 * 파일 선택 화면 렌더링 및 관리
 */
export class FileSelectionUI {
  constructor() {
    this.fileListElement = DOMUtils.getElement('fileList');
    this.fileListContainer = DOMUtils.getElement('fileListContainer');
    this.emptyState = DOMUtils.getElement('emptyState');
    this.questionTypeSelection = DOMUtils.getElement('questionTypeSelection');
  }
  
  /**
   * 파일 목록 렌더링
   * @param {Array} wordSets - 단어셋 배열
   * @param {Function} onToggleFile - 파일 토글 콜백
   */
  renderFileList(wordSets, onToggleFile) {
    if (wordSets.length === 0) {
      DOMUtils.toggleVisibility(this.fileListContainer, false);
      DOMUtils.toggleVisibility(this.emptyState, true);
      return;
    }
    
    DOMUtils.toggleVisibility(this.fileListContainer, true);
    DOMUtils.toggleVisibility(this.emptyState, false);
    
    // fileName 알파벳순으로 정렬
    const sortedWordSets = SortUtils.sortAlphabetically(wordSets, (set) => set.fileName);
    
    const html = sortedWordSets.map((set, index) => {
      // 원본 배열에서의 인덱스 찾기
      const originalIndex = wordSets.findIndex(s => s.fileName === set.fileName);
      return `
        <div class="file-item" data-index="${originalIndex}">
          <input type="checkbox" id="file_${originalIndex}" data-index="${originalIndex}">
          <div class="file-item-info">
            <div class="file-item-name">${set.fileName}</div>
            <div class="file-item-count">${set.words.length}개 단어</div>
          </div>
        </div>
      `;
    }).join('');
    
    DOMUtils.setHTML(this.fileListElement, html);
    
    // 이벤트 리스너 추가
    this.fileListElement.querySelectorAll('.file-item').forEach(item => {
      const index = parseInt(item.dataset.index);
      item.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
          onToggleFile(index, e);
        }
      });
    });
    
    this.fileListElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index);
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        onToggleFile(index, e);
      });
    });
  }
  
  /**
   * 문제 유형 선택 영역 표시/숨김
   * @param {boolean} show - 표시 여부
   */
  toggleQuestionTypeSelection(show) {
    DOMUtils.toggleVisibility(this.questionTypeSelection, show);
  }
  
  /**
   * 체크박스 상태 가져오기
   * @param {number} index - 인덱스
   * @returns {boolean} 체크 상태
   */
  getCheckboxState(index) {
    const checkbox = DOMUtils.getElement(`file_${index}`);
    return checkbox ? checkbox.checked : false;
  }
  
  /**
   * 체크박스 상태 설정
   * @param {number} index - 인덱스
   * @param {boolean} checked - 체크 상태
   */
  setCheckboxState(index, checked) {
    const checkbox = DOMUtils.getElement(`file_${index}`);
    if (checkbox) {
      checkbox.checked = checked;
    }
  }
  
  /**
   * 모든 체크박스 선택
   */
  selectAll() {
    this.fileListElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
    });
  }
  
  /**
   * 모든 체크박스 해제
   */
  deselectAll() {
    this.fileListElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
  }
  
  /**
   * 문제 유형 체크박스 상태 가져오기
   * @returns {Object} {japanese: boolean, meaning: boolean}
   */
  getQuestionTypeStates() {
    const japanese = DOMUtils.getElement('questionTypeJapanese');
    const meaning = DOMUtils.getElement('questionTypeMeaning');
    
    return {
      japanese: japanese ? japanese.checked : true,
      meaning: meaning ? meaning.checked : true
    };
  }
}

