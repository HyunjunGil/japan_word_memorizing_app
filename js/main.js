import { App } from './App.js';

// 전역 App 인스턴스
let app = null;

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', async () => {
  app = new App();
  await app.init();
});

// 전역 함수들 (기존 코드와의 호환성을 위해)
window.goHome = () => app?.goHome();
window.changeWordSet = () => app?.changeWordSet();
window.startQuizFromStudy = () => app?.startQuizFromStudy();
window.toggleAlignmentMenu = () => app?.toggleAlignmentMenu();
window.setButtonAlignment = (alignment) => app?.setButtonAlignment(alignment);
window.selectAll = () => app?.selectAll();
window.deselectAll = () => app?.deselectAll();
window.startStudy = () => app?.startStudy();
window.previousCard = () => app?.previousCard();
window.nextCard = () => app?.nextCard();
window.showAnswer = () => app?.toggleAnswer();
window.selectMode = (mode) => app?.setMode(mode);
window.toggleIdSort = () => app?.handleIdSortToggle();
window.toggleColumn = (columnType) => app?.handleColumnToggle(columnType);
window.toggleCell = (cell) => app?.toggleCell(cell);
window.toggleStatisticsDetail = (tryCount) => app?.statisticsUI.toggleDetail(tryCount);
window.toggleStatisticsColumn = (header, columnType) => app?.toggleStatisticsColumn(header, columnType);
window.playPronunciation = (text) => app?.voiceManager.play(text);
window.startLongPress = (cell, text) => app?.clipboardUtils.startLongPress(cell, text);
window.endLongPress = () => app?.clipboardUtils.endLongPress();

