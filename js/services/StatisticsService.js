/**
 * 통계 서비스 클래스
 * 트라이 횟수 추적 및 통계 계산 담당
 */
export class StatisticsService {
  constructor() {
    this.questionTryCounts = {};    // 각 문제별 트라이 횟수 추적
    this.completedTryCounts = {};   // 완료된 문제의 트라이 횟수
  }
  
  /**
   * 트라이 횟수 초기화
   * @param {string} weightKey - 가중치 키
   */
  initializeTryCount(weightKey) {
    if (!this.questionTryCounts[weightKey]) {
      this.questionTryCounts[weightKey] = 0;
    }
  }
  
  /**
   * 트라이 횟수 증가
   * @param {string} weightKey - 가중치 키
   * @returns {number} 증가된 트라이 횟수
   */
  incrementTryCount(weightKey) {
    if (!this.questionTryCounts[weightKey]) {
      this.questionTryCounts[weightKey] = 0;
    }
    this.questionTryCounts[weightKey]++;
    return this.questionTryCounts[weightKey];
  }
  
  /**
   * 완료된 문제의 트라이 횟수 기록
   * @param {string} weightKey - 가중치 키
   */
  recordCompletion(weightKey) {
    if (this.questionTryCounts[weightKey] !== undefined && 
        !this.completedTryCounts[weightKey]) {
      this.completedTryCounts[weightKey] = this.questionTryCounts[weightKey];
    }
  }
  
  /**
   * 완료된 문제의 트라이 횟수 가져오기
   * @param {string} weightKey - 가중치 키
   * @returns {number|null} 트라이 횟수 또는 null
   */
  getCompletedTryCount(weightKey) {
    return this.completedTryCounts[weightKey] || null;
  }
  
  /**
   * 현재 트라이 횟수 가져오기
   * @param {string} weightKey - 가중치 키
   * @returns {number} 트라이 횟수
   */
  getTryCount(weightKey) {
    return this.questionTryCounts[weightKey] || 0;
  }
  
  /**
   * 통계 데이터 계산
   * @param {Array} questions - 문제 배열
   * @returns {Object} 통계 데이터
   */
  calculateStatistics(questions) {
    const tryCountDistribution = {};  // {횟수: 개수}
    const tryCountQuestions = {};     // {횟수: [문제 배열]}
    let totalCompleted = 0;
    
    // 완료된 문제들의 트라이 횟수 수집
    questions.forEach(question => {
      const weightKey = question.weightKey;
      if (this.completedTryCounts[weightKey]) {
        const tryCount = this.completedTryCounts[weightKey];
        if (!tryCountDistribution[tryCount]) {
          tryCountDistribution[tryCount] = 0;
          tryCountQuestions[tryCount] = [];
        }
        tryCountDistribution[tryCount]++;
        tryCountQuestions[tryCount].push(question);
        totalCompleted++;
      }
    });
    
    // 평균 트라이 횟수 계산 (실제 시도 횟수를 표시 횟수로 변환)
    const avgTryCount = totalCompleted > 0
      ? (Object.keys(this.completedTryCounts).reduce(
          (sum, key) => sum + Math.floor((this.completedTryCounts[key] + 1) / 2), 0) / totalCompleted).toFixed(1)
      : 0;
    
    return {
      tryCountDistribution,
      tryCountQuestions,
      totalCompleted,
      totalQuestions: questions.length,
      avgTryCount: parseFloat(avgTryCount)
    };
  }
  
  /**
   * 트라이 횟수별 그룹화된 통계 데이터 생성
   * @param {Object} stats - calculateStatistics()의 결과
   * @returns {Array} 그룹화된 통계 데이터
   */
  groupStatisticsByTryCount(stats) {
    const { tryCountDistribution, tryCountQuestions, totalCompleted } = stats;
    const groups = [];
    
    // 1회부터 4회까지 개별 표시 (실제로는 1, 3, 5, 7회 시도)
    for (let i = 1; i <= 4; i++) {
      const count = tryCountDistribution[i] || 0;
      if (count === 0) continue;
      
      const percentage = totalCompleted > 0 
        ? ((count / totalCompleted) * 100).toFixed(1) 
        : 0;
      const barWidth = totalCompleted > 0 
        ? (count / totalCompleted) * 100 
        : 0;
      
      // 표시 횟수 = (실제 횟수 + 1) / 2
      const displayCount = Math.floor((i + 1) / 2);
      
      groups.push({
        tryCount: i,
        label: `${displayCount}회`,
        count,
        percentage: parseFloat(percentage),
        barWidth,
        questions: tryCountQuestions[i] || []
      });
    }
    
    // 5회 이상은 "3+"로 묶어서 표시 (5회 이상 시도 = 3회 이상 표시)
    let over5Count = 0;
    const over5Questions = [];
    const maxCount = Math.max(...Object.keys(tryCountDistribution).map(Number), 1);
    
    for (let i = 5; i <= maxCount; i++) {
      if (tryCountDistribution[i]) {
        over5Count += tryCountDistribution[i];
        if (tryCountQuestions[i]) {
          over5Questions.push(...tryCountQuestions[i]);
        }
      }
    }
    
    if (over5Count > 0) {
      const percentage = totalCompleted > 0
        ? ((over5Count / totalCompleted) * 100).toFixed(1)
        : 0;
      const barWidth = totalCompleted > 0
        ? (over5Count / totalCompleted) * 100
        : 0;
      
      groups.push({
        tryCount: '5+',
        label: '3회+',
        count: over5Count,
        percentage: parseFloat(percentage),
        barWidth,
        questions: over5Questions
      });
    }
    
    return groups;
  }
  
  /**
   * 모든 통계 초기화
   */
  clear() {
    this.questionTryCounts = {};
    this.completedTryCounts = {};
  }
  
  /**
   * 통계 데이터 반환 (직접 접근 필요 시)
   * @returns {Object} 통계 데이터 객체
   */
  getAll() {
    return {
      questionTryCounts: { ...this.questionTryCounts },
      completedTryCounts: { ...this.completedTryCounts }
    };
  }
  
  /**
   * 통계 데이터 설정 (복원 시 사용)
   * @param {Object} data - 통계 데이터 객체
   */
  setAll(data) {
    this.questionTryCounts = { ...(data.questionTryCounts || {}) };
    this.completedTryCounts = { ...(data.completedTryCounts || {}) };
  }
}

