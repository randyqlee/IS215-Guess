from flask import Flask, render_template, request, session
from os import environ
import openai
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = environ.get('SECRET_KEY', 'my_secret_key')
app.config['SESSION_COOKIE_NAME'] = 'my_session'

# Set up OpenAI API credentials
openai.api_key = environ.get('OPENAI_API_KEY')

# Define categories for the game
categories = ['animals', 'fruits', 'countries', 'movies', 'colors', 'musical instruments', 'languages', 'sports', 'planets', 'brands']


def generate_word(category):
    # Use OpenAI to generate a word from the given category
    prompt = f"Please give me a word from the category {category}."
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        temperature=0.5,
        max_tokens=50,
        n=1,
        stop=None,
        timeout=10,
    )
    word = response.choices[0].text.strip()
    return word


def generate_clues(word):
    # Use OpenAI to generate 10 clues for the given word
    prompt = f"Please give me 10 clues for the word {word}."
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        temperature=0.5,
        max_tokens=200,
        n=1,
        stop=None,
        timeout=10,
    )
    clues = response.choices[0].text.strip().split('\n')
    return clues


@app.route('/')
def home():
    return render_template('home.html', categories=categories)


@app.route('/category', methods=['POST'])
def category():
    # Get the selected category from the form data
    category = request.form['category']

    # Generate a word from the selected category
    word = generate_word(category)

    # Generate 10 clues for the word
    clues = generate_clues(word)

    # Save the category and word to the session
    session['category'] = category
    session['word'] = word
    session['clues'] = clues

    return render_template('clues.html', category=category, clues=clues)


@app.route('/guess', methods=['POST'])
def guess():
    # Get the guess from the form data
    guess = request.form['guess']

    # Get the word and clues from the session
    category = session.get('category')
    word = session.get('word')
    clues = session.get('clues')

    # Check if the guess is correct
    if guess.lower() == word.lower():
        result = 'correct'
    else:
        result = 'incorrect'

    return render_template('result.html', category=category, word=word, clues=clues, guess=guess, result=result)


if __name__ == '__main__':
    app.run(debug=True)
