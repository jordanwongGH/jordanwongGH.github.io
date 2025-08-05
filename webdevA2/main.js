// DOM elements
var navButtons = document.querySelectorAll('.nav-btn');
var pages = document.querySelectorAll('.page');
var hamburger = document.getElementById('hamburger');
var navMenu = document.getElementById('nav-menu');

// Game elements
var gameBoard = document.getElementById('game-board');
var startGameBtn = document.getElementById('start-game');
var resetGameBtn = document.getElementById('reset-game');
var scoreElement = document.getElementById('score');
var movesElement = document.getElementById('moves');
var timerElement = document.getElementById('timer');
var gameMessage = document.getElementById('game-message');

// Game variables
var memoryCards = [];
var gameActive = false;
var gameScore = 0;
var gameMoves = 0;
var gameTimer = 0;
var timerInterval;
var flippedCards = [];
var matchedPairs = 0;
var canFlip = true;

// Memory game content - pairs of baked goods
var memoryGameContent = [
    { id: 1, name: 'Croissant', emoji: '🥐' },
    { id: 2, name: 'Bread', emoji: '🍞' },
    { id: 3, name: 'Pretzel', emoji: '🥨' },
    { id: 4, name: 'Bagel', emoji: '🥯' },
    { id: 5, name: 'Baguette', emoji: '🥖' },
    { id: 6, name: 'Cake', emoji: '🎂' },
    { id: 7, name: 'Cupcake', emoji: '🧁' },
    { id: 8, name: 'Donut', emoji: '🍩' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeGame();
    initializeHomePageLinks();
    handleResponsiveFeatures();
    addTimedAnimations();
    handleFormData();
    updateCSSProperties();
    updateContent();
    initializeAudio();
    
    // Set initial game message
    updateGameMessage('Press Start Game to begin!');
});

// Navigation functions
function initializeNavigation() {
    // Add click event listeners to navigation buttons
    for (var i = 0; i < navButtons.length; i++) {
        addNavButtonListener(navButtons[i]);
    }
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
}

function addNavButtonListener(button) {
    button.addEventListener('click', function() {
        var targetPage = button.getAttribute('data-page');
        showPage(targetPage);
        updateActiveNav(button);
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

function showPage(pageId) {
    // Hide all pages
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    
    // Show target page
    var targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Add animation class
        targetPage.style.animation = 'none';
        setTimeout(function() {
            targetPage.style.animation = 'slideIn 0.5s ease-in-out';
        }, 10);
    }
}

function updateActiveNav(activeButton) {
    // Remove active class from all nav buttons
    for (var i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove('active');
    }
    
    // Add active class to clicked button
    activeButton.classList.add('active');
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Home page card navigation
function initializeHomePageLinks() {
    var featureCards = document.querySelectorAll('.card');
    
    for (var i = 0; i < featureCards.length; i++) {
        addCardListener(featureCards[i], i);
    }
}

function addCardListener(card, index) {
    card.addEventListener('click', function() {
        // Map cards to pages: 0=pastries, 1=breads, 2=cakes
        var pageMap = ['pastries', 'breads', 'cakes'];
        var targetPage = pageMap[index];
        
        if (targetPage) {
            showPage(targetPage);
            updateActiveNav(document.querySelector('[data-page="' + targetPage + '"]'));
        }
    });
}

// Memory game functions
function initializeGame() {
    // Add event listeners for game controls
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    
    // Create initial game board
    createMemoryBoard();
}

function createMemoryBoard() {
    gameBoard.innerHTML = '';
    
    // Create pairs of cards
    memoryCards = [];
    for (var i = 0; i < memoryGameContent.length; i++) {
        // Add two cards for each item (pair)
        memoryCards.push(copyObject(memoryGameContent[i]));
        memoryCards.push(copyObject(memoryGameContent[i]));
    }
    
    // Shuffle the array
    shuffleArray(memoryCards);
    
    // Create card elements
    for (var j = 0; j < memoryCards.length; j++) {
        var item = memoryCards[j];
        var card = document.createElement('button');
        card.className = 'memory-card';
        card.dataset.id = item.id;
        card.dataset.index = j;
        card.textContent = '?';
        
        // Store the content for later reveal
        card.dataset.emoji = item.emoji;
        card.dataset.name = item.name;
        
        // Add event listener
        card.addEventListener('click', handleCardClick);
        
        gameBoard.appendChild(card);
    }
}

function copyObject(obj) {
    var newObj = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameScore = 0;
    gameMoves = 0;
    gameTimer = 0;
    matchedPairs = 0;
    flippedCards = [];
    canFlip = true;
    
    updateScore();
    updateMoves();
    updateTimer();
    updateGameMessage('Game started! Find matching pairs!');
    
    // Reset all cards
    var cards = document.querySelectorAll('.memory-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('matched', 'flipped', 'disabled');
        cards[i].textContent = '?';
        cards[i].disabled = false;
    }
    
    // Start timer
    timerInterval = setInterval(function() {
        gameTimer++;
        updateTimer();
    }, 1000);
    
    // Update button states
    startGameBtn.disabled = true;
    resetGameBtn.disabled = false;
}

function handleCardClick(event) {
    if (!gameActive || !canFlip) return;
    
    var card = event.target;
    if (card.disabled || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    // Flip the card
    flipCard(card);
    flippedCards.push(card);
    
    // Check if we have two cards flipped
    if (flippedCards.length === 2) {
        canFlip = false;
        gameMoves++;
        updateMoves();
        
        setTimeout(function() {
            checkMatch();
        }, 1000);
    }
}

function flipCard(card) {
    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
}

function unflipCard(card) {
    card.classList.remove('flipped');
    card.textContent = '?';
}

function checkMatch() {
    var card1 = flippedCards[0];
    var card2 = flippedCards[1];
    var id1 = parseInt(card1.dataset.id);
    var id2 = parseInt(card2.dataset.id);
    
    if (id1 === id2) {
        // Match found
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.disabled = true;
        card2.disabled = true;
        
        matchedPairs++;
        gameScore += 10;
        updateScore();
        updateGameMessage('Great match! Keep going!');
        
        // Check if game is complete
        if (matchedPairs === memoryGameContent.length) {
            endGame('Congratulations! You found all pairs!');
        }
    } else {
        // No match
        unflipCard(card1);
        unflipCard(card2);
        updateGameMessage('No match. Try again!');
    }
    
    // Reset for next turn
    flippedCards = [];
    canFlip = true;
}

function endGame(message) {
    gameActive = false;
    clearInterval(timerInterval);
    updateGameMessage(message + ' Final Score: ' + gameScore + ' | Moves: ' + gameMoves + ' | Time: ' + gameTimer + 's');
    
    // Update button states
    startGameBtn.disabled = false;
    resetGameBtn.disabled = true;
    
    // Disable all cards
    var cards = document.querySelectorAll('.memory-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].disabled = true;
    }
}

function resetGame() {
    gameActive = false;
    clearInterval(timerInterval);
    gameScore = 0;
    gameMoves = 0;
    gameTimer = 0;
    matchedPairs = 0;
    flippedCards = [];
    canFlip = true;
    
    updateScore();
    updateMoves();
    updateTimer();
    updateGameMessage('Press Start Game to begin!');
    
    // Reset button states
    startGameBtn.disabled = false;
    resetGameBtn.disabled = true;
    
    // Recreate game board
    createMemoryBoard();
}

function updateScore() {
    scoreElement.textContent = gameScore;
}

function updateMoves() {
    movesElement.textContent = gameMoves;
}

function updateTimer() {
    timerElement.textContent = gameTimer;
}

function updateGameMessage(message) {
    gameMessage.textContent = message;
    
    // Add fade animation
    gameMessage.style.animation = 'none';
    setTimeout(function() {
        gameMessage.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
}

// Responsive features
function handleResponsiveFeatures() {
    // Handle window resize
    window.addEventListener('resize', function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 800) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
        
        // Adjust game board for different screen sizes
        adjustGameBoard();
    });
    
    // Initial adjustment
    adjustGameBoard();
}

function adjustGameBoard() {
    var screenWidth = window.innerWidth;
    
    if (screenWidth <= 800) {
        // Mobile layout - 3 columns
        gameBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else if (screenWidth <= 1024) {
        // Tablet layout - 4 columns
        gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
        // Desktop layout - 4 columns
        gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
}

// Audio handling
function initializeAudio() {
    var audioPlayers = document.querySelectorAll('.audio-player');
    
    for (var i = 0; i < audioPlayers.length; i++) {
        addAudioListener(audioPlayers[i]);
    }
}

function addAudioListener(player) {
    // Add event listeners for audio events
    player.addEventListener('loadstart', function() {
        console.log('Audio loading started');
    });
    
    player.addEventListener('error', function() {
        console.log('Audio failed to load');
        // Hide the audio player if it fails to load
        player.style.display = 'none';
    });
}

// Timed events for animations
function addTimedAnimations() {
    // Animate cards on page load
    setTimeout(function() {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            addCardAnimation(cards[i], i);
        }
    }, 500);
    
    // Add periodic bounce animation to memory cards when not active
    setInterval(function() {
        if (!gameActive) {
            var memoryCardsElements = document.querySelectorAll('.memory-card:not(.matched)');
            var randomCard = memoryCardsElements[Math.floor(Math.random() * memoryCardsElements.length)];
            if (randomCard) {
                randomCard.style.animation = 'bounce 0.5s ease-in-out';
                setTimeout(function() {
                    randomCard.style.animation = '';
                }, 500);
            }
        }
    }, 8000);
}

function addCardAnimation(card, index) {
    setTimeout(function() {
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
    }, index * 200);
}

// Form data handling (for potential future features)
function handleFormData() {
    // This could be used for user preferences, scores, etc.
    var userPreferences = {
        theme: 'pink-brown',
        difficulty: 'normal',
        sound: true
    };
    
    // Store in memory (not localStorage as per requirements)
    window.userPreferences = userPreferences;
}

// CSS property updates via JavaScript
function updateCSSProperties() {
    // Dynamic theme switching could be added here
    var root = document.documentElement;
    
    // Example of updating CSS custom properties
    root.style.setProperty('--primary-color', '#8b4513');
    root.style.setProperty('--accent-color', '#f48fb1');
    root.style.setProperty('--background-gradient', 'linear-gradient(135deg, #fdf5f5 0%, #f5e6e6 100%)');
}

// Content updates using JavaScript
function updateContent() {
    // Dynamic content updates
    var currentDate = new Date();
    
    // Update any dynamic content that might be needed
    var heroSection = document.querySelector('.hero p');
    if (heroSection) {
        // This could be used to update content dynamically
        console.log('Content updated for', currentDate.getFullYear());
    }
}

// DOM selection utilities
function selectElement(selector) {
    return document.querySelector(selector);
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden && gameActive) {
        // Pause game timer when tab is not visible
        clearInterval(timerInterval);
    } else if (!document.hidden && gameActive) {
        // Resume game timer when tab becomes visible
        timerInterval = setInterval(function() {
            gameTimer++;
            updateTimer();
        }, 1000);
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // Add keyboard shortcuts
    switch(event.key) {
        case '1':
            showPage('home');
            updateActiveNav(selectElement('[data-page="home"]'));
            break;
        case '2':
            showPage('pastries');
            updateActiveNav(selectElement('[data-page="pastries"]'));
            break;
        case '3':
            showPage('breads');
            updateActiveNav(selectElement('[data-page="breads"]'));
            break;
        case '4':
            showPage('cakes');
            updateActiveNav(selectElement('[data-page="cakes"]'));
            break;
        case '5':
            showPage('game');
            updateActiveNav(selectElement('[data-page="game"]'));
            break;
        case ' ':
            // Spacebar to start/reset game
            event.preventDefault();
            if (!gameActive && startGameBtn && !startGameBtn.disabled) {
                startGame();
            }
            break;
        case 'Escape':
            // Close mobile menu
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            break;
        case 'r':
        case 'R':
            // R key to reset game
            if (resetGameBtn && !resetGameBtn.disabled) {
                resetGame();
            }
            break;
    }
});

// Touch events for mobile
function initializeTouchEvents() {
    var touchStartY = 0;
    var touchEndY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(event) {
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        var swipeThreshold = 50;
        var swipeDistance = touchStartY - touchEndY;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe up - could trigger an action
                console.log('Swiped up');
            } else {
                // Swipe down - could trigger an action
                console.log('Swiped down');
            }
        }
    }
}

// Initialize additional features
setTimeout(function() {
    initializeTouchEvents();
}, 1000);