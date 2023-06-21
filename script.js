// Airtable config
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

let slides = [];
let questions = [];

let twitterAccount = '';

const createForm = (slideIndex) => {
  const form = document.createElement('form');
  form.className = 'slide-form';
  form.innerHTML = `
    ${slideIndex === 0 ? `
      <div class="slide-content">
        <h2 class="headline">Explore the Frensville Ecosystem</h2>
        <input type="text" name="twitter" id="twitter-input" placeholder="What is your Twitter handle?" required>
        <button type="submit" data-slide="${slideIndex}" class="cta-button">Get Started</button>
      </div>
    ` : `
      <div class="slide-content">
        <h2 class="slide-title">${slides[slideIndex].title}</h2>
        <p class="slide-description">${slides[slideIndex].description}</p>
        <label for="question" class="form-label">Ask Us Anything About ${slides[slideIndex].title}</label>
        <textarea name="question" id="question" placeholder="Your Question"></textarea>
      </div>
      <div class="buttons">
        <button type="button" class="prev" data-slide="${slideIndex}">Previous</button>
        <button type="button" class="skip" data-slide="${slideIndex}">Skip</button>
        <button type="submit" data-slide="${slideIndex}">Submit</button>
      </div>
    `}
  `;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const { twitter, question } = event.target.elements;
    if (twitter) {
      twitterAccount = twitter.value;
    }
    if (twitterAccount && question) {
      await submitQuestion(slideIndex, twitterAccount, question.value);
      event.target.reset();
    }
    showNextSlide(slideIndex);
  };
  const skipButton = form.querySelector('.skip');
  if (skipButton) {
    skipButton.onclick = () => showNextSlide(slideIndex);
  }
  const prevButton = form.querySelector('.prev');
  if (prevButton) {
    prevButton.onclick = () => showPreviousSlide(slideIndex);
  }
  return form;
};

const createSlide = (slideData, index) => {
  const slide = document.createElement('div');
  slide.className = 'slide-container';
  slide.innerHTML = `
    <div class="slide">
      ${index !== 0 ? `<img src="slides/Slide${index}.png" alt="Slide ${index}">` : ''}
    </div>
  `;
  slide.appendChild(createForm(index));
  return slide;
};

const createQuestionEntry = (questionData) => {
  const questionEntry = document.createElement('div');
  questionEntry.className = 'question-entry';
  questionEntry.innerHTML = `
    <p class="question-text">${questionData.question}</p>
    <p class="twitter-handle">Twitter: ${questionData.twitter}</p>
    <p class="slide-number">Slide: ${questionData.slide}</p>
  `;
  return questionEntry;
};

const submitQuestion = async (slideIndex, twitter, question) => {
  const data = {
    records: [
      {
        fields: {
          Slide: `Slide ${slideIndex}`,
          Twitter: twitter,
          Question: question,
        },
      },
    ],
  };
  await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });
};

const showNextSlide = (index) => {
  const currentSlide = document.querySelectorAll('.slide-container')[index];
  currentSlide.style.display = 'none';
  const nextSlide = document.querySelectorAll('.slide-container')[index + 1];
  if (nextSlide) {
    nextSlide.style.display = 'flex';
  }
};

const showPreviousSlide = (index) => {
  const currentSlide = document.querySelectorAll('.slide-container')[index];
  currentSlide.style.display = 'none';
  const previousSlide = document.querySelectorAll('.slide-container')[index - 1];
  if (previousSlide) {
    previousSlide.style.display = 'flex';
  }
};

const updateSlides = () => {
    const container = document.getElementById('slide-container');
    container.innerHTML = '';
    slides.forEach((slideData, index) => {
      const slide = createSlide(slideData, index);
      slide.style.display = index === 0 ? 'flex' : 'none';
      container.appendChild(slide);
    });
  };

  
const showQuestions = () => {
  const questionsContainer = document.getElementById('questions-container');
  questionsContainer.innerHTML = '';
  questions.forEach((questionData) => {
    const questionEntry = createQuestionEntry(questionData);
    questionsContainer.appendChild(questionEntry);
  });
};

const fetchSlides = async () => {
  try {
    const response = await fetch('slides.json');
    if (response.ok) {
      const slidesData = await response.json();
      slides = slidesData;
      updateSlides();
    } else {
      console.error('Failed to fetch slides data');
    }
  } catch (error) {
    console.error('An error occurred while fetching slides data', error);
  }
};

const fetchQuestions = async () => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: headers,
    });
    if (response.ok) {
      const data = await response.json();
      questions = data.records.map((record) => ({
        question: record.fields.Question,
        twitter: record.fields.Twitter,
        slide: record.fields.Slide,
      }));
      showQuestions();
    } else {
      console.error('Failed to fetch questions data');
    }
  } catch (error) {
    console.error('An error occurred while fetching questions data', error);
  }
};

fetchSlides();
fetchQuestions();
