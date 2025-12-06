/**
 * DOM 유틸리티 클래스
 * DOM 조작 및 이벤트 관련 헬퍼 함수 제공
 */
export class DOMUtils {
  /**
   * 요소 표시/숨김 토글
   * @param {HTMLElement} element - 요소
   * @param {boolean} show - 표시 여부
   */
  static toggleVisibility(element, show = null) {
    if (show === null) {
      element.classList.toggle('hidden');
    } else {
      if (show) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  }
  
  /**
   * 클래스 토글
   * @param {HTMLElement} element - 요소
   * @param {string} className - 클래스 이름
   * @param {boolean} force - 강제 적용 여부 (선택사항)
   */
  static toggleClass(element, className, force = null) {
    if (force === null) {
      element.classList.toggle(className);
    } else {
      element.classList.toggle(className, force);
    }
  }
  
  /**
   * 요소에 클래스 추가
   * @param {HTMLElement} element - 요소
   * @param {string} className - 클래스 이름
   */
  static addClass(element, className) {
    element.classList.add(className);
  }
  
  /**
   * 요소에서 클래스 제거
   * @param {HTMLElement} element - 요소
   * @param {string} className - 클래스 이름
   */
  static removeClass(element, className) {
    element.classList.remove(className);
  }
  
  /**
   * 요소의 텍스트 내용 설정
   * @param {HTMLElement|string} elementOrId - 요소 또는 ID
   * @param {string} text - 텍스트
   */
  static setText(elementOrId, text) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element) {
      element.textContent = text;
    }
  }
  
  /**
   * 요소의 HTML 내용 설정
   * @param {HTMLElement|string} elementOrId - 요소 또는 ID
   * @param {string} html - HTML
   */
  static setHTML(elementOrId, html) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element) {
      element.innerHTML = html;
    }
  }
  
  /**
   * 요소 가져오기
   * @param {string} id - 요소 ID
   * @returns {HTMLElement|null} 요소 또는 null
   */
  static getElement(id) {
    return document.getElementById(id);
  }
  
  /**
   * 요소들 가져오기 (querySelectorAll)
   * @param {string} selector - 선택자
   * @returns {NodeList} 요소 목록
   */
  static getElements(selector) {
    return document.querySelectorAll(selector);
  }
  
  /**
   * 이벤트 리스너 추가
   * @param {HTMLElement|string} elementOrId - 요소 또는 ID
   * @param {string} event - 이벤트 타입
   * @param {Function} handler - 이벤트 핸들러
   * @param {Object} options - 이벤트 옵션 (선택사항)
   */
  static addEventListener(elementOrId, event, handler, options = null) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element) {
      if (options) {
        element.addEventListener(event, handler, options);
      } else {
        element.addEventListener(event, handler);
      }
    }
  }
  
  /**
   * 이벤트 리스너 제거
   * @param {HTMLElement|string} elementOrId - 요소 또는 ID
   * @param {string} event - 이벤트 타입
   * @param {Function} handler - 이벤트 핸들러
   */
  static removeEventListener(elementOrId, event, handler) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element) {
      element.removeEventListener(event, handler);
    }
  }
  
  /**
   * 요소 생성
   * @param {string} tag - 태그 이름
   * @param {Object} attributes - 속성 객체
   * @param {string} textContent - 텍스트 내용 (선택사항)
   * @returns {HTMLElement} 생성된 요소
   */
  static createElement(tag, attributes = {}, textContent = null) {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'classList') {
        attributes[key].forEach(cls => element.classList.add(cls));
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    
    if (textContent !== null) {
      element.textContent = textContent;
    }
    
    return element;
  }
  
  /**
   * 텍스트 보임/숨김 상태 저장
   * @param {HTMLElement} container - 컨테이너 요소
   * @param {Function} getKey - 키를 생성하는 함수
   * @returns {Object} 상태 객체
   */
  static saveVisibilityStates(container, getKey) {
    const states = {};
    const rows = container.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('[class*="-cell"]');
      cells.forEach(cell => {
        const key = getKey(row, cell);
        if (key) {
          states[key] = cell.classList.contains('hidden-text');
        }
      });
    });
    
    return states;
  }
  
  /**
   * 텍스트 보임/숨김 상태 복원
   * @param {HTMLElement} container - 컨테이너 요소
   * @param {Object} states - 상태 객체
   * @param {Function} getKey - 키를 생성하는 함수
   */
  static restoreVisibilityStates(container, states, getKey) {
    const rows = container.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('[class*="-cell"]');
      cells.forEach(cell => {
        const key = getKey(row, cell);
        if (key && states.hasOwnProperty(key)) {
          if (states[key]) {
            cell.classList.add('hidden-text');
          } else {
            cell.classList.remove('hidden-text');
          }
        }
      });
    });
  }
}

