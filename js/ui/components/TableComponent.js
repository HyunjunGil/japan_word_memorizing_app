/**
 * 테이블 컴포넌트 클래스
 * 재사용 가능한 테이블 컴포넌트
 */
export class TableComponent {
  constructor(config) {
    this.config = config;
    this.container = null;
  }
  
  /**
   * 테이블 렌더링
   * @param {HTMLElement} container - 컨테이너 요소
   * @param {Array} data - 데이터 배열
   * @param {Function} rowRenderer - 행 렌더러 함수
   */
  render(container, data, rowRenderer) {
    this.container = container;
    
    const thead = this.createHeader();
    const tbody = this.createBody(data, rowRenderer);
    
    const table = document.createElement('table');
    table.className = this.config.tableClass || 'table';
    table.appendChild(thead);
    table.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(table);
  }
  
  /**
   * 헤더 생성
   */
  createHeader() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    
    this.config.columns.forEach(col => {
      const th = document.createElement('th');
      th.className = col.className || '';
      th.textContent = col.label || '';
      
      if (col.onClick) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', col.onClick);
      }
      
      tr.appendChild(th);
    });
    
    thead.appendChild(tr);
    return thead;
  }
  
  /**
   * 본문 생성
   */
  createBody(data, rowRenderer) {
    const tbody = document.createElement('tbody');
    
    data.forEach((item, index) => {
      const row = rowRenderer(item, index);
      if (row) {
        tbody.appendChild(row);
      }
    });
    
    return tbody;
  }
  
  /**
   * 테이블 업데이트
   * @param {Array} data - 새로운 데이터 배열
   * @param {Function} rowRenderer - 행 렌더러 함수
   */
  update(data, rowRenderer) {
    if (!this.container) {
      return;
    }
    
    const tbody = this.container.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
      data.forEach((item, index) => {
        const row = rowRenderer(item, index);
        if (row) {
          tbody.appendChild(row);
        }
      });
    }
  }
}

