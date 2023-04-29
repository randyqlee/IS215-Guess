const categoryButtons = document.querySelectorAll('.category-button');
const startButton = document.getElementById('start-button');
const guessingContainer = document.getElementById('game-output');
const submitGuess = document.getElementById('submit-guess');
const guessInput = document.getElementById('guess-input');
const clueText = document.getElementById('clue-display');
const result = document.getElementById('result-display');

let currentWord;
let remainingGuesses;
let clues;
let currentClueIndex;

function startGame() {
  const categoryDropdown = document.getElementById('category');
  const category = categoryDropdown.value;

  fetch('/generate-word', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ category: category })
  })
    .then(response => response.json())
    .then(data => {
      currentWord = data.word;
      return fetch('/generate-clues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word: currentWord })
      });
    })
    .then(response => response.json())
    .then(data => {
      clues = data.clues;
      currentClueIndex = 0;
      remainingGuesses = 10;

      categoryButtons.forEach(button => {
        button.style.display = 'none';
      });
      startButton.style.display = 'none';

      guessingContainer.style.display = 'block';
      result.textContent = '';
      guessInput.value = '';
      guessInput.focus();
      clueText.textContent = clues[currentClueIndex];
    })
    .catch(error => {
      console.error('Error starting the game:', error);
    });

  submitGuess.disabled = false;
}

function checkGuess() {
  const guess = guessInput.value.trim().toLowerCase();

  if (guess === currentWord.trim().toLowerCase()) {
    result.textContent = 'Congratulations! You guessed the word.';
    submitGuess.disabled = true;
  } else {
    remainingGuesses--;
    if (remainingGuesses === 0) {
      result.textContent = `Game over. The word was "${currentWord}".`;
      submitGuess.disabled = true;
    } else {
      currentClueIndex++;
      if (currentClueIndex >= clues.length) {
        currentClueIndex = 0;
      }
      clueText.textContent = clues[currentClueIndex];
      result.textContent = `Wrong guess. You have ${remainingGuesses} guesses left.`;
    }
  }
}

guessInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    checkGuess();
  }
});

function restartGame() {
  categoryButtons.forEach(button => {
    button.style.display = 'inline-block';
  });
  startButton.style.display = 'inline-block';
  guessingContainer.style.display = 'block';

  currentWord = null;
  remainingGuesses = 0;
  clues = [];
  currentClueIndex = 0;
  result.textContent = '';
  clueText.textContent = '';
  guessInput.value = '';
  submitGuess.disabled = true;
  guessInput.disabled = false;
}

const restartButton = document.getElementById('restart-button');
restartButton.addEventListener('click', restartGame);
