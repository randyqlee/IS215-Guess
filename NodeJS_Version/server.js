// server.js
const express = require('express');
const path = require('path'); // Import the 'path' module
const fetch = require('node-fetch');
const app = express();
const config = require('./config');
const OPENAI_API_KEY = config.OPENAI_API_KEY;

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Serve static files from the 'public' folder
  app.use(express.static('public'));

// Define your API endpoint here

app.post('/generate-word', (req, res) => {
    const { category } = req.body;
    const promptCategory = `for a guessing game, provide ten one word examples for this category: ${category}`;

    console.log(promptCategory);
  
    fetch('https://api.openai.com/v1/completions', {
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
        temperature: 0.6
      })
    })
      .then(response => response.json())
      .then(data => {
        const botMessages = [];
        if (data.choices && data.choices.length > 0) {
          data.choices.forEach(choice => {
            const botMessage = choice.text.trim();
            if (botMessage) {
              const words = botMessage.split('\n');
              words.forEach(singleWord => {
                if (singleWord) {
                  botMessages.push(singleWord.replace(/^\d+\.\s*/, ''));
                }
              });
            }
          });
        } else {
            console.log('API response:', data);
          console.log('Error: API response is not in the expected format');
        }

        
  
        let word = botMessages[Math.floor(Math.random() * botMessages.length)].trim();
        if (word.endsWith(".")) {
          word = word.slice(0, -1);
        }

        console.log(word);
  
        res.json({ word });
      })
      .catch(error => {
        console.error('Error generating word:', error);
        res.status(500).json({ error: 'Failed to generate word' });
      });
  });
  
  app.post('/generate-clues', (req, res) => {
    const { word } = req.body;
    const promptClues = `for a guessing game, give one sentence clue for the word ${word}, without mentioning it.`;
  
    fetch('https://api.openai.com/v1/completions', {
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
        temperature: 0.5
      })
    })
      .then(response => response.json())
      .then(data => {
        const clues = data.choices.map(choice => choice.text.trim());

        console.log(clues);
        res.json({ clues });
      })
      .catch(error => {
        console.error('Error generating clues:', error);
        res.status(500).json({ error: 'Failed to generate clues' });
      });
  });
  
  // Start the server
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
  



