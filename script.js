//require('dotenv').config();
//const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


//const OPENAI_API_KEY = require('./config');

//insert your own private API KEY inside the '' marks
const OPENAI_API_KEY = '';

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

let randomChoice;

async function generateWord(category) {
    console.log(category);
    const promptCategory = `for a guessing game, provide ten one word example for this category: ${category}`;
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
    prompt: promptCategory,
    model: 'text-davinci-003',
    max_tokens: 150,
    n: 1,
    temperature: 0.6,
    //stop: '.'
    })
  });

  /*
  const { choices } = await response.json();
  console.log(choices);
  */

  const data = await response.json();
  console.log('API response:', data);
  const botMessages = [];
  if (data.choices && data.choices.length > 0) {
  data.choices.forEach(choice => {
  const botMessage = choice.text.trim();
  console.log(botMessage);
  if (botMessage) {
      const words = botMessage.split('\n');
      console.log(words);
      words.forEach(singleWord => {
          if (singleWord) {
              botMessages.push(singleWord.replace(/^\d+\.\s*/, ''));
              //botMessages.push(word);             
              console.log(botMessages);
          }
      });
  }
  });
  } else {
  console.log('Error: API response is not in the expected format');
  }

  let word = botMessages[Math.floor(Math.random() * botMessages.length)].trim();
  console.log(word);

  if (word.endsWith(".")) {
    word = word.slice(0, -1);
  }

  console.log(word);

  return word;


}

async function generateClues(word) {
    const promptClues = `for a guessing game, give one sentence clue for the word ${word}, without mentioning it.`;
    const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
        prompt: promptClues,
        model: 'text-davinci-003',
        max_tokens: 150,
        n: 10,
        temperature: 0.5,
        })
  });

  const { choices } = await response.json();
  const clues = choices.map(choice => choice.text.trim());
  console.log(clues);
  return clues;
}

  


function startGame() {

    const categoryDropdown = document.getElementById('category');
    const category = categoryDropdown.value;
  
    console.log(category);
  generateWord(category).then(word => {
    currentWord = word;
    generateClues(word).then(clueList => {
      clues = clueList;
      currentClueIndex = 0;
      remainingGuesses = 10;

      // Hide category selection and show start button
      categoryButtons.forEach(button => {
        button.style.display = 'none';
      });
      startButton.style.display = 'none';

      // Show guessing container and reset result, input, and clues
      guessingContainer.style.display = 'block';
      result.textContent = '';
      guessInput.value = '';
      guessInput.focus();
      clueText.textContent = clues[currentClueIndex];
    });
  });

  submitGuess.disabled=false;
}

function checkGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  console.log(typeof guess, guess);
  console.log(typeof currentWord, currentWord);
  if (guess == currentWord.trim().toLowerCase()) {
    result.textContent = 'Congratulations! You guessed the word.';
    submitGuess.disabled = true;
  } else {
    remainingGuesses--;
    if (remainingGuesses == 0) {
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
  if (event.key == 'Enter') {
    checkGuess();
  }
});



  function restartGame() {
    // Show category selection and hide guessing container
    categoryButtons.forEach(button => {
      button.style.display = 'inline-block';
    });
    startButton.style.display = 'inline-block';
    guessingContainer.style.display = 'block';
  
    // Reset game state
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