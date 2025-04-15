document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const mainMenu = document.getElementById('main-menu');
    const createSection = document.getElementById('create-section');
    const quizSection = document.getElementById('quiz-section');
    const createButton = document.getElementById('create-button');
    const quizButton = document.getElementById('quiz-button');
    const backFromCreate = document.getElementById('back-from-create');
    const backFromQuiz = document.getElementById('back-from-quiz');
    const saveCardButton = document.getElementById('save-card');
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const displayQuestion = document.getElementById('display-question');
    const displayAnswer = document.getElementById('display-answer');
    const flipCardButton = document.getElementById('flip-card');
    const nextCardButton = document.getElementById('next-card');
    const card = document.getElementById('card');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const statusMessage = document.getElementById('status-message');
    
    let currentCards = [];
    let currentCardIndex = 0;
  
    // Navigation Functions
    function showMainMenu() {
      mainMenu.classList.remove('hidden');
      createSection.classList.add('hidden');
      quizSection.classList.add('hidden');
      statusMessage.textContent = '';
    }
  
    function showCreateSection() {
      mainMenu.classList.add('hidden');
      createSection.classList.remove('hidden');
      quizSection.classList.add('hidden');
      questionInput.value = '';
      answerInput.value = '';
      questionInput.focus();
    }
  
    function showQuizSection() {
      chrome.storage.local.get('flashcards', function(data) {
        if (data.flashcards && data.flashcards.length > 0) {
          mainMenu.classList.add('hidden');
          createSection.classList.add('hidden');
          quizSection.classList.remove('hidden');
          
          currentCards = data.flashcards;
          currentCardIndex = 0;
          loadCurrentCard();
          resetCard();
        } else {
          statusMessage.textContent = 'No flashcards available. Create some first!';
        }
      });
    }
  
    // Card Functions
    function saveCard() {
      const question = questionInput.value.trim();
      const answer = answerInput.value.trim();
      
      if (!question || !answer) {
        statusMessage.textContent = 'Both question and answer are required.';
        return;
      }
      
      chrome.storage.local.get('flashcards', function(data) {
        const flashcards = data.flashcards || [];
        flashcards.push({ question, answer });
        
        chrome.storage.local.set({ flashcards }, function() {
          statusMessage.textContent = 'Flashcard saved successfully!';
          questionInput.value = '';
          answerInput.value = '';
          questionInput.focus();
        });
      });
    }
  
    function loadCurrentCard() {
      if (currentCards.length > 0) {
        const currentCard = currentCards[currentCardIndex];
        displayQuestion.textContent = currentCard.question;
        displayAnswer.textContent = currentCard.answer;
      }
    }
  
    function resetCard() {
      card.classList.remove('flipped');
      cardBack.classList.add('hidden');
      cardFront.classList.remove('hidden');
      flipCardButton.textContent = 'Show Answer';
    }
  
    function flipCard() {
      card.classList.toggle('flipped');
      
      if (card.classList.contains('flipped')) {
        setTimeout(() => {
          cardFront.classList.add('hidden');
          cardBack.classList.remove('hidden');
        }, 150);
        flipCardButton.textContent = 'Show Question';
      } else {
        setTimeout(() => {
          cardBack.classList.add('hidden');
          cardFront.classList.remove('hidden');
        }, 150);
        flipCardButton.textContent = 'Show Answer';
      }
    }
  
    function nextCard() {
      currentCardIndex = (currentCardIndex + 1) % currentCards.length;
      loadCurrentCard();
      resetCard();
    }
  
    // Event Listeners
    createButton.addEventListener('click', showCreateSection);
    quizButton.addEventListener('click', showQuizSection);
    backFromCreate.addEventListener('click', showMainMenu);
    backFromQuiz.addEventListener('click', showMainMenu);
    saveCardButton.addEventListener('click', saveCard);
    flipCardButton.addEventListener('click', flipCard);
    nextCardButton.addEventListener('click', nextCard);
  });