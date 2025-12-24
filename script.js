class GuessGame {
    constructor() {
        this.levels = [
            { range: 50, attempts: 10, name: 'Level 1', min: 1, max: 50 },
            { range: 100, attempts: 12, name: 'Level 2', min: 1, max: 100 },
            { range: 500, attempts: 15, name: 'Level 3', min: 1, max: 500 }
        ];
        this.currentLevelIndex = 0;
        this.score = 0;
        this.targetNumber = 0;
        this.attemptsLeft = 0;
        this.guessHistory = [];
        this.unlockedLevels = 1;
        
        this.initElements();
        this.initGame();
        this.attachEventListeners();
    }

    initElements() {
        this.elements = {
            levelDisplay: document.getElementById('currentLevel'),
            scoreDisplay: document.getElementById('score'),
            attemptsDisplay: document.getElementById('attempts'),
            levelTitle: document.getElementById('levelTitle'),
            progressFill: document.getElementById('progressFill'),
            message: document.getElementById('message'),
            guessInput: document.getElementById('guessInput'),
            submitBtn: document.getElementById('submitBtn'),
            restartBtn: document.getElementById('restartBtn'),
            nextLevelBtn: document.getElementById('nextLevelBtn'),
            historyList: document.getElementById('historyList'),
            victoryModal: document.getElementById('victoryModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            victoryMessage: document.getElementById('victoryMessage'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            continueBtn: document.getElementById('continueBtn'),
            tryAgainBtn: document.getElementById('tryAgainBtn')
        };
    }

    initGame() {
        const level = this.levels[this.currentLevelIndex];
        this.targetNumber = Math.floor(Math.random() * level.max) + level.min;
        this.attemptsLeft = level.attempts;
        this.guessHistory = [];
        
        this.updateUI();
        this.elements.guessInput.max = level.max;
        this.elements.guessInput.value = '';
        this.elements.guessInput.focus();
        this.elements.historyList.innerHTML = '';
        this.elements.nextLevelBtn.style.display = 'none';
        this.playSound('start');
    }

    updateUI() {
        const level = this.levels[this.currentLevelIndex];
        this.elements.levelDisplay.textContent = this.currentLevelIndex + 1;
        this.elements.scoreDisplay.textContent = this.score;
        this.elements.attemptsDisplay.textContent = this.attemptsLeft;
        this.elements.levelTitle.textContent = `${level.name}: Guess between ${level.min} and ${level.max}`;
        
        const progress = ((level.attempts - this.attemptsLeft) / level.attempts) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }

    attachEventListeners() {
        this.elements.submitBtn.addEventListener('click', () => this.submitGuess());
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
        this.elements.restartBtn.addEventListener('click', () => this.restartLevel());
        this.elements.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        this.elements.continueBtn.addEventListener('click', () => this.closeVictoryModal());
        this.elements.tryAgainBtn.addEventListener('click', () => this.closeGameOverModal());
    }

    submitGuess() {
        const guess = parseInt(this.elements.guessInput.value);
        const level = this.levels[this.currentLevelIndex];

        if (isNaN(guess) || guess < level.min || guess > level.max) {
            this.showMessage(`Please enter a number between ${level.min} and ${level.max}`, 'error');
            return;
        }

        this.attemptsLeft--;
        this.guessHistory.push(guess);
        this.addToHistory(guess);

        if (guess === this.targetNumber) {
            this.handleWin();
        } else if (this.attemptsLeft === 0) {
            this.handleLoss();
        } else {
            this.giveHint(guess);
        }

        this.updateUI();
        this.elements.guessInput.value = '';
        this.elements.guessInput.focus();
    }

    giveHint(guess) {
        const diff = Math.abs(guess - this.targetNumber);
        const level = this.levels[this.currentLevelIndex];
        const range = level.max - level.min;

        if (diff <= range * 0.05) {
            this.showMessage('🔥 Very Close! You\'re almost there!', 'success');
            this.playSound('close');
        } else if (diff <= range * 0.15) {
            this.showMessage(guess > this.targetNumber ? '📉 Close, but too high!' : '📈 Close, but too low!', 'warning');
            this.playSound('medium');
        } else {
            this.showMessage(guess > this.targetNumber ? '⬇️ Too High!' : '⬆️ Too Low!', 'info');
            this.playSound('far');
        }
    }

    handleWin() {
        const level = this.levels[this.currentLevelIndex];
        const bonusPoints = this.attemptsLeft * 10;
        const basePoints = 100;
        this.score += basePoints + bonusPoints;
        
        this.showMessage('🎉 Correct! You won!', 'success');
        this.playSound('win');
        
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIndex + 2);
            this.elements.nextLevelBtn.style.display = 'block';
            this.showVictoryModal(`You guessed it in ${level.attempts - this.attemptsLeft} attempts!<br>Bonus: +${bonusPoints} points<br>Total Score: ${this.score}`);
        } else {
            this.showVictoryModal(`🏆 Game Completed!<br>Final Score: ${this.score}<br>You're a Master Guesser!`);
        }
        
        this.elements.guessInput.disabled = true;
        this.elements.submitBtn.disabled = true;
    }

    handleLoss() {
        this.showMessage(`😢 Game Over! The number was ${this.targetNumber}`, 'error');
        this.playSound('lose');
        this.showGameOverModal(`The correct number was ${this.targetNumber}<br>Your Score: ${this.score}`);
        this.elements.guessInput.disabled = true;
        this.elements.submitBtn.disabled = true;
    }

    addToHistory(guess) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = guess;
        this.elements.historyList.appendChild(item);
    }

    showMessage(text, type) {
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
    }

    restartLevel() {
        this.elements.guessInput.disabled = false;
        this.elements.submitBtn.disabled = false;
        this.initGame();
        this.showMessage('Level restarted! Good luck!', 'info');
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.elements.guessInput.disabled = false;
            this.elements.submitBtn.disabled = false;
            this.initGame();
            this.showMessage('New level! Can you beat it?', 'info');
        }
    }

    showVictoryModal(message) {
        this.elements.victoryMessage.innerHTML = message;
        this.elements.victoryModal.classList.add('active');
    }

    closeVictoryModal() {
        this.elements.victoryModal.classList.remove('active');
    }

    showGameOverModal(message) {
        this.elements.gameOverMessage.innerHTML = message;
        this.elements.gameOverModal.classList.add('active');
    }

    closeGameOverModal() {
        this.elements.gameOverModal.classList.remove('active');
        this.restartLevel();
    }

    playSound(type) {
        // Optional: Add sound effects using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            start: 440,
            close: 880,
            medium: 660,
            far: 330,
            win: 1000,
            lose: 200
        };
        
        oscillator.frequency.value = frequencies[type] || 440;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GuessGame();
});