import { CONFIG } from '../config.js';

/**
 * 정렬 유틸리티 클래스
 * 정렬 알고리즘 및 정렬 관련 헬퍼 함수 제공
 */
export class SortUtils {
  /**
   * 알파벳순 정렬 (한국어 지원)
   * @param {Array} items - 정렬할 항목 배열
   * @param {Function|string} getKey - 키를 추출하는 함수 또는 키 이름
   * @returns {Array} 정렬된 배열
   */
  static sortAlphabetically(items, getKey) {
    const sorted = [...items];
    const keyFn = typeof getKey === 'function' 
      ? getKey 
      : (item) => item[getKey];
    
    sorted.sort((a, b) => {
      const keyA = keyFn(a);
      const keyB = keyFn(b);
      return keyA.localeCompare(keyB, 'ko', { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
    
    return sorted;
  }
  
  /**
   * ID 오름차순 정렬
   * @param {Array} items - 정렬할 항목 배열
   * @param {Function|string} getId - ID를 추출하는 함수 또는 키 이름
   * @returns {Array} 정렬된 배열
   */
  static sortByIdAsc(items, getId) {
    const sorted = [...items];
    const idFn = typeof getId === 'function' 
      ? getId 
      : (item) => item[getId];
    
    sorted.sort((a, b) => idFn(a) - idFn(b));
    return sorted;
  }
  
  /**
   * ID 내림차순 정렬
   * @param {Array} items - 정렬할 항목 배열
   * @param {Function|string} getId - ID를 추출하는 함수 또는 키 이름
   * @returns {Array} 정렬된 배열
   */
  static sortByIdDesc(items, getId) {
    const sorted = [...items];
    const idFn = typeof getId === 'function' 
      ? getId 
      : (item) => item[getId];
    
    sorted.sort((a, b) => idFn(b) - idFn(a));
    return sorted;
  }
  
  /**
   * Fisher-Yates 셔플 알고리즘 (랜덤 정렬)
   * @param {Array} items - 정렬할 항목 배열
   * @returns {Array} 셔플된 배열
   */
  static shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * 정렬 순서에 따라 정렬
   * @param {Array} items - 정렬할 항목 배열
   * @param {string} order - 정렬 순서 ('asc', 'desc', 'random')
   * @param {Function|string} getId - ID를 추출하는 함수 또는 키 이름
   * @returns {Array} 정렬된 배열
   */
  static sortByOrder(items, order, getId) {
    if (order === CONFIG.SORT_ORDERS.ASC) {
      return this.sortByIdAsc(items, getId);
    } else if (order === CONFIG.SORT_ORDERS.DESC) {
      return this.sortByIdDesc(items, getId);
    } else if (order === CONFIG.SORT_ORDERS.RANDOM) {
      return this.shuffle(items);
    }
    return items;
  }
  
  /**
   * 정렬 순서 아이콘 반환
   * @param {string} order - 정렬 순서
   * @returns {string} 정렬 아이콘
   */
  static getSortIcon(order) {
    if (order === CONFIG.SORT_ORDERS.ASC) {
      return ' ↑';
    } else if (order === CONFIG.SORT_ORDERS.DESC) {
      return ' ↓';
    } else if (order === CONFIG.SORT_ORDERS.RANDOM) {
      return ' ↕';
    }
    return '';
  }
  
  /**
   * 정렬 순서 토글 (asc → desc → random → asc)
   * @param {string} currentOrder - 현재 정렬 순서
   * @returns {string} 새로운 정렬 순서
   */
  static toggleSortOrder(currentOrder) {
    if (currentOrder === CONFIG.SORT_ORDERS.ASC) {
      return CONFIG.SORT_ORDERS.DESC;
    } else if (currentOrder === CONFIG.SORT_ORDERS.DESC) {
      return CONFIG.SORT_ORDERS.RANDOM;
    } else {
      return CONFIG.SORT_ORDERS.ASC;
    }
  }
}

