document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const mainMenu = document.getElementById('main-menu');
    const createSection = document.getElementById('create-section');
    const quizSection = document.getElementById('quiz-section');
    const manageTopicsSection = document.getElementById('manage-topics-section');
    
    const createButton = document.getElementById('create-button');
    const quizButton = document.getElementById('quiz-button');
    const manageTopicsButton = document.getElementById('manage-topics-button');
    
    const backFromCreate = document.getElementById('back-from-create');
    const backFromQuiz = document.getElementById('back-from-quiz');
    const backFromTopics = document.getElementById('back-from-topics');
    
    const saveCardButton = document.getElementById('save-card');
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    
    const topicSelectCreate = document.getElementById('topic-select-create');
    const topicSelectQuiz = document.getElementById('topic-select-quiz');
    const newTopicButton = document.getElementById('new-topic-button');
    const newTopicForm = document.getElementById('new-topic-form');
    const newTopicInput = document.getElementById('new-topic-input');
    const saveTopicButton = document.getElementById('save-topic-button');
    const cancelTopicButton = document.getElementById('cancel-topic-button');
    
    const displayQuestion = document.getElementById('display-question');
    const displayAnswer = document.getElementById('display-answer');
    const cardTopicLabel = document.getElementById('card-topic-label');
    const cardCounter = document.getElementById('card-counter');
    
    const flipCardButton = document.getElementById('flip-card');
    const nextCardButton = document.getElementById('next-card');
    const card = document.getElementById('card');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    
    const topicsList = document.getElementById('topics-list');
    const statusMessage = document.getElementById('status-message');
    
    let currentCards = [];
    let currentCardIndex = 0;
    let topics = ['default']; // Start with the default 'General' topic
  
    // Initialize the extension
    function init() {
      chrome.storage.local.get(['flashcards', 'topics'], function(data) {
        // Initialize topics if needed
        if (!data.topics) {
          chrome.storage.local.set({ topics: ['default'] });
        } else {
          topics = data.topics;
          updateTopicSelects();
        }
      });
    }
  
    // Navigation Functions
    function showMainMenu() {
      mainMenu.classList.remove('hidden');
      createSection.classList.add('hidden');
      quizSection.classList.add('hidden');
      manageTopicsSection.classList.add('hidden');
      statusMessage.textContent = '';
    }
  
    function showCreateSection() {
      mainMenu.classList.add('hidden');
      createSection.classList.remove('hidden');
      quizSection.classList.add('hidden');
      manageTopicsSection.classList.add('hidden');
      newTopicForm.classList.add('hidden');
      questionInput.value = '';
      answerInput.value = '';
      questionInput.focus();
      updateTopicSelects();
    }
  
    function showQuizSection() {
      mainMenu.classList.add('hidden');
      createSection.classList.add('hidden');
      quizSection.classList.remove('hidden');
      manageTopicsSection.classList.add('hidden');
      updateTopicSelects();
      loadCardsForQuiz();
    }
  
    function showManageTopicsSection() {
      mainMenu.classList.add('hidden');
      createSection.classList.add('hidden');
      quizSection.classList.add('hidden');
      manageTopicsSection.classList.remove('hidden');
      updateTopicsList();
    }
  
    // Topic Functions
    function updateTopicSelects() {
      // Clear previous options but keep the first default ones
      while (topicSelectCreate.options.length > 1) {
        topicSelectCreate.remove(1);
      }
      
      while (topicSelectQuiz.options.length > 2) {
        topicSelectQuiz.remove(2);
      }
      
      // Add current topics
      topics.forEach(topic => {
        if (topic !== 'default') {
          let optCreate = document.createElement('option');
          optCreate.value = topic;
          optCreate.textContent = topic;
          topicSelectCreate.appendChild(optCreate);
          
          let optQuiz = document.createElement('option');
          optQuiz.value = topic;
          optQuiz.textContent = topic;
          topicSelectQuiz.appendChild(optQuiz);
        }
      });
    }
  
    function updateTopicsList() {
      topicsList.innerHTML = '';
      
      chrome.storage.local.get('flashcards', function(data) {
        const flashcards = data.flashcards || [];
        
        // Count cards per topic
        const topicCounts = {};
        topics.forEach(topic => {
          topicCounts[topic] = flashcards.filter(card => card.topic === topic).length;
        });
        
        // Create topic list items
        topics.forEach(topic => {
          const topicName = topic === 'default' ? 'General' : topic;
          const count = topicCounts[topic] || 0;
          
          const li = document.createElement('li');
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = topicName;
          
          const countSpan = document.createElement('span');
          countSpan.className = 'topic-card-count';
          countSpan.textContent = `${count} cards`;
          
          li.appendChild(nameSpan);
          li.appendChild(countSpan);
          
          // Don't allow deleting the default topic
          if (topic !== 'default') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'topic-actions';
            
            const deleteButton = document.createElement('span');
            deleteButton.className = 'delete-topic';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete topic';
            deleteButton.dataset.topic = topic;
            deleteButton.addEventListener('click', function() {
              deleteTopic(topic);
            });
            
            actionsDiv.appendChild(deleteButton);
            li.appendChild(actionsDiv);
          }
          
          topicsList.appendChild(li);
        });
      });
    }
  
    function showNewTopicForm() {
      newTopicForm.classList.remove('hidden');
      newTopicInput.value = '';
      newTopicInput.focus();
    }
  
    function hideNewTopicForm() {
      newTopicForm.classList.add('hidden');
    }
  
    function saveNewTopic() {
      const newTopic = newTopicInput.value.trim();
      
      if (!newTopic) {
        statusMessage.textContent = 'Topic name cannot be empty.';
        return;
      }
      
      if (topics.includes(newTopic)) {
        statusMessage.textContent = 'This topic already exists.';
        return;
      }
      
      topics.push(newTopic);
      
      chrome.storage.local.set({ topics }, function() {
        updateTopicSelects();
        hideNewTopicForm();
        topicSelectCreate.value = newTopic; // Select the new topic
        statusMessage.textContent = 'New topic created!';
      });
    }
  
    function deleteTopic(topic) {
      if (confirm(`Delete topic "${topic}"? Cards in this topic will be moved to "General".`)) {
        // Remove topic from list
        topics = topics.filter(t => t !== topic);
        
        // Move cards to default topic
        chrome.storage.local.get('flashcards', function(data) {
          const flashcards = data.flashcards || [];
          
          const updatedFlashcards = flashcards.map(card => {
            if (card.topic === topic) {
              return { ...card, topic: 'default' };
            }
            return card;
          });
          
          // Save changes
          chrome.storage.local.set({ 
            topics: topics,
            flashcards: updatedFlashcards 
          }, function() {
            updateTopicsList();
            statusMessage.textContent = `Topic "${topic}" deleted.`;
          });
        });
      }
    }
  
    // Card Functions
    function saveCard() {
      const question = questionInput.value.trim();
      const answer = answerInput.value.trim();
      const topic = topicSelectCreate.value;
      
      if (!question || !answer) {
        statusMessage.textContent = 'Both question and answer are required.';
        return;
      }
      
      chrome.storage.local.get('flashcards', function(data) {
        const flashcards = data.flashcards || [];
        flashcards.push({ question, answer, topic });
        
        chrome.storage.local.set({ flashcards }, function() {
          statusMessage.textContent = 'Flashcard saved successfully!';
          questionInput.value = '';
          answerInput.value = '';
          questionInput.focus();
        });
      });
    }
  
    function loadCardsForQuiz() {
      const selectedTopic = topicSelectQuiz.value;
      
      chrome.storage.local.get('flashcards', function(data) {
        if (data.flashcards && data.flashcards.length > 0) {
          if (selectedTopic === 'all') {
            currentCards = data.flashcards;
          } else {
            currentCards = data.flashcards.filter(card => card.topic === selectedTopic);
          }
          
          if (currentCards.length > 0) {
            currentCardIndex = 0;
            loadCurrentCard();
            resetCard();
            updateCardCounter();
          } else {
            displayQuestion.textContent = "No cards in this topic.";
            displayAnswer.textContent = "";
            cardTopicLabel.textContent = "";
            cardCounter.textContent = "No cards";
          }
        } else {
          displayQuestion.textContent = "No flashcards available. Create some first!";
          displayAnswer.textContent = "";
          cardTopicLabel.textContent = "";
          cardCounter.textContent = "No cards";
        }
      });
    }
  
    function loadCurrentCard() {
      if (currentCards.length > 0) {
        const currentCard = currentCards[currentCardIndex];
        displayQuestion.textContent = currentCard.question;
        displayAnswer.textContent = currentCard.answer;
        cardTopicLabel.textContent = currentCard.topic === 'default' ? 'General' : currentCard.topic;
        updateCardCounter();
      }
    }
  
    function updateCardCounter() {
      cardCounter.textContent = `Card ${currentCardIndex + 1} of ${currentCards.length}`;
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
    manageTopicsButton.addEventListener('click', showManageTopicsSection);
    
    backFromCreate.addEventListener('click', showMainMenu);
    backFromQuiz.addEventListener('click', showMainMenu);
    backFromTopics.addEventListener('click', showMainMenu);
    
    saveCardButton.addEventListener('click', saveCard);
    flipCardButton.addEventListener('click', flipCard);
    nextCardButton.addEventListener('click', nextCard);
    
    newTopicButton.addEventListener('click', showNewTopicForm);
    saveTopicButton.addEventListener('click', saveNewTopic);
    cancelTopicButton.addEventListener('click', hideNewTopicForm);
    
    topicSelectQuiz.addEventListener('change', loadCardsForQuiz);
  
    // Initialize
    init();
  });