import { CONFIG } from './config.js';
import { WordSetService } from './services/WordSetService.js';
import { WeightService } from './services/WeightService.js';
import { StatisticsService } from './services/StatisticsService.js';
import { StudySessionManager } from './managers/StudySessionManager.js';
import { HistoryManager } from './managers/HistoryManager.js';
import { VoiceManager } from './managers/VoiceManager.js';
import { QuizMode } from './modes/QuizMode.js';
import { StudyMode } from './modes/StudyMode.js';
import { FileSelectionUI } from './ui/FileSelectionUI.js';
import { FlashcardUI } from './ui/FlashcardUI.js';
import { StudyTableUI } from './ui/StudyTableUI.js';
import { StatisticsUI } from './ui/StatisticsUI.js';
import { ClipboardUtils } from './utils/ClipboardUtils.js';
import { DOMUtils } from './utils/DOMUtils.js';
import { Word } from './models/Word.js';
import { Question } from './models/Question.js';

/**
 * 메인 애플리케이션 클래스
 * 모든 기능을 통합하여 관리
 */
export class App {
  constructor() {
    // 서비스 초기화
    this.wordSetService = new WordSetService();
    this.weightService = new WeightService();
    this.statisticsService = new StatisticsService();
    
    // 매니저 초기화
    this.sessionManager = new StudySessionManager();
    this.historyManager = new HistoryManager();
    this.voiceManager = new VoiceManager();
    
    // 모드 초기화
    this.quizMode = new QuizMode(this.weightService, this.statisticsService, this.historyManager);
    this.studyMode = new StudyMode(this.weightService, this.historyManager);
    
    // UI 초기화
    this.clipboardUtils = new ClipboardUtils();
    this.fileSelectionUI = new FileSelectionUI();
    this.flashcardUI = new FlashcardUI(this.voiceManager);
    this.studyTableUI = new StudyTableUI(this.clipboardUtils, this.voiceManager);
    this.statisticsUI = new StatisticsUI(this.clipboardUtils, this.voiceManager);
    
    // 현재 모드
    this.currentMode = null;
  }
  
  /**
   * 애플리케이션 초기화
   */
  async init() {
    // 음성 초기화
    this.voiceManager.initialize();
    
    // 단어셋 로드
    await this.wordSetService.loadAllWordSets();
    
    // 파일 목록 렌더링
    this.renderFileList();
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // 초기 모드 설정
    this.setMode(CONFIG.MODES.QUIZ);
  }
  
  /**
   * 파일 목록 렌더링
   */
  renderFileList() {
    const wordSets = this.wordSetService.getWordSets();
    this.fileSelectionUI.renderFileList(wordSets, (index, event) => {
      this.handleFileToggle(index, event);
    });
  }
  
  /**
   * 파일 토글 처리
   */
  handleFileToggle(index, event) {
    const wordSets = this.wordSetService.getWordSets();
    const mode = this.sessionManager.getMode();
    
    if (event && event.target.type === 'checkbox') {
      if (mode === CONFIG.MODES.STUDY) {
        const checkbox = event.target;
        if (checkbox.checked) {
          wordSets.forEach((_, i) => {
            if (i !== index) {
              this.fileSelectionUI.setCheckboxState(i, false);
            }
          });
        }
      }
      return;
    }
    
    const currentState = this.fileSelectionUI.getCheckboxState(index);
    
    if (mode === CONFIG.MODES.STUDY) {
      if (currentState) {
        this.fileSelectionUI.setCheckboxState(index, false);
      } else {
        wordSets.forEach((_, i) => {
          this.fileSelectionUI.setCheckboxState(i, false);
        });
        this.fileSelectionUI.setCheckboxState(index, true);
      }
    } else {
      this.fileSelectionUI.setCheckboxState(index, !currentState);
    }
  }
  
  /**
   * 모드 설정
   */
  setMode(mode) {
    this.sessionManager.setMode(mode);
    this.fileSelectionUI.toggleQuestionTypeSelection(mode === CONFIG.MODES.QUIZ);
    
    if (mode === CONFIG.MODES.STUDY) {
      this.fileSelectionUI.deselectAll();
    }
    
    // 모드 선택 UI 업데이트
    document.querySelectorAll('.mode-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    const modeOption = document.querySelector(`.mode-option[data-mode="${mode}"]`);
    if (modeOption) {
      modeOption.classList.add('selected');
    }
    
    const radio = document.querySelector(`input[value="${mode}"]`);
    if (radio) {
      radio.checked = true;
    }
  }
  
  /**
   * 학습 시작
   */
  startStudy() {
    const wordSets = this.wordSetService.getWordSets();
    const mode = this.sessionManager.getMode();
    const selectedIndices = [];
    
    wordSets.forEach((_, index) => {
      if (this.fileSelectionUI.getCheckboxState(index)) {
        selectedIndices.push(index);
      }
    });
    
    if (selectedIndices.length === 0) {
      alert('최소 하나의 단어묶음을 선택해주세요.');
      return;
    }
    
    if (mode === CONFIG.MODES.STUDY && selectedIndices.length > 1) {
      alert('공부하기 모드에서는 하나의 단어묶음만 선택할 수 있습니다.');
      return;
    }
    
    // 선택된 단어 수집
    const selectedWords = [];
    let selectedWordSet = null;
    
    selectedIndices.forEach(index => {
      const wordSet = wordSets[index];
      if (mode === CONFIG.MODES.STUDY) {
        selectedWordSet = wordSet;
      }
      
      wordSet.words.forEach(word => {
        const wordData = new Word({
          ...word,
          fileName: wordSet.fileName
        });
        selectedWords.push(wordData);
      });
    });
    
    // 세션 초기화
    this.sessionManager.reset();
    this.historyManager.clear();
    this.weightService.clear();
    this.statisticsService.clear();
    
    if (mode === CONFIG.MODES.QUIZ) {
      // 평가하기 모드
      const questionTypes = this.fileSelectionUI.getQuestionTypeStates();
      const selectedQuestionTypes = [];
      
      if (questionTypes.japanese) {
        selectedQuestionTypes.push({
          type: CONFIG.QUESTION_TYPES.JAPANESE,
          label: '일본어 표기'
        });
      }
      if (questionTypes.meaning) {
        selectedQuestionTypes.push({
          type: CONFIG.QUESTION_TYPES.MEANING,
          label: '뜻'
        });
      }
      
      if (selectedQuestionTypes.length === 0) {
        alert('최소 하나의 문제 유형을 선택해주세요.');
        return;
      }
      
      const questions = this.sessionManager.createQuestions(selectedWords, selectedQuestionTypes);
      this.quizMode.setQuestions(questions);
      this.sessionManager.setSelectedQuestions(questions);
      
      // 화면 전환
      this.showFlashcardScreen();
      this.updateProgress();
      this.updateStatistics();
      this.nextCard();
    } else {
      // 공부하기 모드
      this.studyMode.setWords(selectedWords);
      this.studyMode.setWordSet(selectedWordSet);
      this.studyMode.setSortOrder(CONFIG.SORT_ORDERS.ASC);
      
      // 화면 전환
      this.showStudyTableScreen(selectedWordSet);
    }
  }
  
  /**
   * 다음 카드/단어
   */
  nextCard() {
    const mode = this.sessionManager.getMode();
    const answerShown = this.sessionManager.isAnswerShown();
    
    if (mode === CONFIG.MODES.QUIZ) {
      const nextQuestion = this.quizMode.nextQuestion(answerShown);
      
      if (!nextQuestion) {
        alert('학습을 완료하였습니다!');
        return;
      }
      
      this.displayCard(nextQuestion);
      this.updateProgress();
      this.updateStatistics();
    } else {
      const nextWord = this.studyMode.nextWord();
      if (nextWord) {
        // 공부하기 모드는 테이블로 표시되므로 별도 처리 불필요
      }
    }
  }
  
  /**
   * 이전 카드/단어
   */
  previousCard() {
    const mode = this.sessionManager.getMode();
    
    if (mode === CONFIG.MODES.QUIZ) {
      const previousItem = this.quizMode.previousQuestion();
      if (previousItem) {
        this.displayCard();
        this.flashcardUI.setPreviousButtonEnabled(this.historyManager.hasPrevious());
        this.updateProgress();
        this.updateStatistics();
      }
    } else {
      const previousItem = this.studyMode.previousWord();
      if (previousItem) {
        // 공부하기 모드는 테이블로 표시되므로 별도 처리 불필요
      }
    }
  }
  
  /**
   * 카드 표시
   * @param {Question} question - 표시할 문제 객체 (선택사항, 없으면 히스토리에서 가져옴)
   */
  displayCard(question = null) {
    const mode = this.sessionManager.getMode();
    
    if (mode === CONFIG.MODES.QUIZ) {
      let questionToDisplay = question;
      
      // question이 없으면 히스토리에서 가져오기
      if (!questionToDisplay) {
        const currentItem = this.historyManager.getCurrent();
        if (!currentItem) return;
        
        // 히스토리 데이터를 Question 객체로 변환
        // 히스토리에는 평탄화된 데이터가 저장되어 있으므로 재구성 필요
        const wordData = {
          id: currentItem.id,
          japanese: currentItem.japanese,
          pronunciation: currentItem.pronunciation,
          meaning: currentItem.meaning,
          sent_jp: currentItem.sent_jp,
          sent_kr: currentItem.sent_kr,
          fileName: currentItem.fileName
        };
        
        questionToDisplay = new Question({
          word: new Word(wordData),
          questionType: currentItem.questionType,
          questionLabel: currentItem.questionLabel,
          weightKey: currentItem.weightKey
        });
      }
      
      this.flashcardUI.displayQuiz(questionToDisplay, (text) => {
        this.voiceManager.play(text);
      });
      
      // 정답 숨김 처리
      this.flashcardUI.toggleAnswer(false);
      
      const weight = this.quizMode.getCurrentWeight();
      this.flashcardUI.updateWeight(weight);
      
      this.flashcardUI.setPreviousButtonEnabled(this.historyManager.hasPrevious());
      this.sessionManager.setAnswerShown(false);
    }
  }
  
  /**
   * 정답 표시/숨김
   */
  toggleAnswer() {
    const shown = this.flashcardUI.toggleAnswer();
    this.sessionManager.setAnswerShown(shown);
  }
  
  /**
   * 진행도 업데이트
   */
  updateProgress() {
    const progress = this.quizMode.calculateProgress();
    this.flashcardUI.updateProgress(progress.completed, progress.total);
  }
  
  /**
   * 통계 업데이트
   */
  updateStatistics() {
    const stats = this.quizMode.calculateStatistics();
    const groups = this.quizMode.groupStatistics(stats);
    
    this.statisticsUI.update(
      stats,
      groups,
      (tryCount) => this.statisticsUI.toggleDetail(tryCount),
      (header, columnType) => this.toggleStatisticsColumn(header, columnType),
      (cell) => this.toggleCell(cell),
      (text) => this.voiceManager.play(text)
    );
  }
  
  /**
   * 통계 테이블 컬럼 토글
   */
  toggleStatisticsColumn(header, columnType) {
    const table = header.closest('table');
    if (!table) return;
    
    const cells = table.querySelectorAll(`tbody .${columnType}-cell`);
    const allHidden = Array.from(cells).every(cell => cell.classList.contains('hidden-text'));
    
    cells.forEach(cell => {
      if (allHidden) {
        cell.classList.remove('hidden-text');
      } else {
        cell.classList.add('hidden-text');
      }
    });
  }
  
  /**
   * 셀 토글
   */
  toggleCell(cell) {
    cell.classList.toggle('hidden-text');
  }
  
  /**
   * 플래시카드 화면 표시
   */
  showFlashcardScreen() {
    DOMUtils.toggleVisibility(DOMUtils.getElement('fileSelectionScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('flashcardScreen'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('studyTableScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('homeBtn'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('changeSetBtn'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('startQuizBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('settingsBtn'), true);
  }
  
  /**
   * 공부하기 테이블 화면 표시
   */
  showStudyTableScreen(wordSet) {
    DOMUtils.toggleVisibility(DOMUtils.getElement('fileSelectionScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('flashcardScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('studyTableScreen'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('homeBtn'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('changeSetBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('startQuizBtn'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('settingsBtn'), false);
    
    DOMUtils.addClass(document.querySelector('.container'), 'study-mode');
    
    const sortOrder = this.studyMode.getSortOrder();
    this.studyTableUI.render(
      wordSet,
      sortOrder,
      () => this.handleIdSortToggle(),
      (columnType) => this.handleColumnToggle(columnType),
      (cell) => this.toggleCell(cell),
      (text) => this.voiceManager.play(text)
    );
  }
  
  /**
   * ID 정렬 토글
   */
  handleIdSortToggle() {
    this.studyTableUI.saveVisibilityStates();
    const newOrder = this.studyMode.toggleSortOrder();
    const wordSet = this.studyMode.getWordSet();
    
    if (wordSet) {
      this.studyTableUI.render(
        wordSet,
        newOrder,
        () => this.handleIdSortToggle(),
        (columnType) => this.handleColumnToggle(columnType),
        (cell) => this.toggleCell(cell),
        (text) => this.voiceManager.play(text)
      );
      
      // 보임/숨김 상태 복원
      setTimeout(() => {
        this.studyTableUI.restoreVisibilityStates();
      }, 0);
    }
  }
  
  /**
   * 컬럼 토글
   */
  handleColumnToggle(columnType) {
    const cells = document.querySelectorAll(`.study-table tbody .${columnType}-cell`);
    const allHidden = Array.from(cells).every(cell => cell.classList.contains('hidden-text'));
    
    cells.forEach(cell => {
      if (allHidden) {
        cell.classList.remove('hidden-text');
      } else {
        cell.classList.add('hidden-text');
      }
    });
  }
  
  /**
   * 처음으로 이동
   */
  goHome() {
    DOMUtils.toggleVisibility(DOMUtils.getElement('flashcardScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('studyTableScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('fileSelectionScreen'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('homeBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('changeSetBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('startQuizBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('settingsBtn'), false);
    
    DOMUtils.removeClass(document.querySelector('.container'), 'study-mode');
    
    // 모드 초기화
    this.setMode(CONFIG.MODES.QUIZ);
    
    // 문제 유형 체크박스 초기화
    DOMUtils.getElement('questionTypeJapanese').checked = true;
    DOMUtils.getElement('questionTypeMeaning').checked = true;
    
    // 체크박스 해제
    this.fileSelectionUI.deselectAll();
  }
  
  /**
   * 단어셋 변경
   */
  changeWordSet() {
    if (confirm('현재 학습을 중단하고 단어셋을 변경하시겠습니까?')) {
      this.goHome();
    }
  }
  
  /**
   * 공부하기에서 평가하기로 전환
   */
  startQuizFromStudy() {
    const selectedWords = this.studyMode.getWords();
    if (selectedWords.length === 0) {
      alert('단어가 선택되지 않았습니다.');
      return;
    }
    
    // 문제 유형 확인
    const questionTypes = this.fileSelectionUI.getQuestionTypeStates();
    const selectedQuestionTypes = [];
    
    if (questionTypes.japanese) {
      selectedQuestionTypes.push({
        type: CONFIG.QUESTION_TYPES.JAPANESE,
        label: '일본어 표기'
      });
    }
    if (questionTypes.meaning) {
      selectedQuestionTypes.push({
        type: CONFIG.QUESTION_TYPES.MEANING,
        label: '뜻'
      });
    }
    
    if (selectedQuestionTypes.length === 0) {
      selectedQuestionTypes.push(
        { type: CONFIG.QUESTION_TYPES.JAPANESE, label: '일본어 표기' },
        { type: CONFIG.QUESTION_TYPES.MEANING, label: '뜻' }
      );
    }
    
    // 문제 생성
    const questions = this.sessionManager.createQuestions(selectedWords, selectedQuestionTypes);
    this.quizMode.setQuestions(questions);
    this.sessionManager.setSelectedQuestions(questions);
    this.sessionManager.setMode(CONFIG.MODES.QUIZ);
    
    // 화면 전환
    DOMUtils.removeClass(document.querySelector('.container'), 'study-mode');
    DOMUtils.toggleVisibility(DOMUtils.getElement('studyTableScreen'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('flashcardScreen'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('startQuizBtn'), false);
    DOMUtils.toggleVisibility(DOMUtils.getElement('changeSetBtn'), true);
    DOMUtils.toggleVisibility(DOMUtils.getElement('settingsBtn'), true);
    
    // 학습 상태 초기화
    this.historyManager.clear();
    
    // 평가하기 모드 시작
    this.updateProgress();
    this.updateStatistics();
    this.nextCard();
  }
  
  /**
   * 버튼 정렬 메뉴 토글
   */
  toggleAlignmentMenu() {
    const menu = DOMUtils.getElement('alignmentMenu');
    DOMUtils.toggleClass(menu, 'show');
  }
  
  /**
   * 버튼 정렬 설정
   */
  setButtonAlignment(alignment) {
    this.sessionManager.setButtonAlignment(alignment);
    const cardControls = DOMUtils.getElement('cardControls');
    const menu = DOMUtils.getElement('alignmentMenu');
    const options = menu.querySelectorAll('.alignment-option');
    
    options.forEach(option => option.classList.remove('active'));
    
    if (alignment === CONFIG.BUTTON_ALIGNMENT.LEFT) {
      cardControls.className = 'card-controls align-left';
      options[0].classList.add('active');
    } else if (alignment === CONFIG.BUTTON_ALIGNMENT.CENTER) {
      cardControls.className = 'card-controls align-center';
      options[1].classList.add('active');
    } else if (alignment === CONFIG.BUTTON_ALIGNMENT.RIGHT) {
      cardControls.className = 'card-controls align-right';
      options[2].classList.add('active');
    }
    
    DOMUtils.removeClass(menu, 'show');
  }
  
  /**
   * 전체 선택
   */
  selectAll() {
    if (this.sessionManager.isStudyMode()) {
      alert('공부하기 모드에서는 하나의 단어묶음만 선택할 수 있습니다.');
      return;
    }
    this.fileSelectionUI.selectAll();
  }
  
  /**
   * 전체 해제
   */
  deselectAll() {
    this.fileSelectionUI.deselectAll();
  }
  
  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 모드 선택
    document.querySelectorAll('.mode-option').forEach(option => {
      const mode = option.dataset.mode;
      if (mode) {
        option.addEventListener('click', () => this.setMode(mode));
      }
    });
    
    // 학습 시작 버튼
    DOMUtils.addEventListener('startStudyBtn', 'click', () => this.startStudy());
    
    // 전체선택/전체해제 버튼
    DOMUtils.addEventListener('selectAllBtn', 'click', () => this.selectAll());
    DOMUtils.addEventListener('deselectAllBtn', 'click', () => this.deselectAll());
    
    // 헤더 버튼들
    DOMUtils.addEventListener('homeBtn', 'click', () => this.goHome());
    DOMUtils.addEventListener('changeSetBtn', 'click', () => this.changeWordSet());
    DOMUtils.addEventListener('startQuizBtn', 'click', () => this.startQuizFromStudy());
    DOMUtils.addEventListener('settingsBtn', 'click', () => this.toggleAlignmentMenu());
    
    // 정렬 메뉴 옵션
    document.querySelectorAll('.alignment-option').forEach((option, index) => {
      const alignments = [CONFIG.BUTTON_ALIGNMENT.LEFT, CONFIG.BUTTON_ALIGNMENT.CENTER, CONFIG.BUTTON_ALIGNMENT.RIGHT];
      option.addEventListener('click', () => this.setButtonAlignment(alignments[index]));
    });
    
    // 플래시카드 버튼들
    DOMUtils.addEventListener('prevBtn', 'click', () => this.previousCard());
    DOMUtils.addEventListener('showAnswerBtn', 'click', () => this.toggleAnswer());
    DOMUtils.addEventListener('nextBtn', 'click', () => this.nextCard());
    
    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (event) => {
      const menu = DOMUtils.getElement('alignmentMenu');
      const settingsBtn = DOMUtils.getElement('settingsBtn');
      
      if (menu && settingsBtn && !menu.contains(event.target) && !settingsBtn.contains(event.target)) {
        DOMUtils.removeClass(menu, 'show');
      }
    });
  }
}

