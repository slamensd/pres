// Airtable config
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

let currentSlideIndex = 0;
let slides = [];
let twitterAccount = '';

const fetchSlides = async () => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch slides data');
    }
    const data = await response.json();
    slides = data.records.map((record) => ({
      src: record.fields.Image ? record.fields.Image[0].url : '',
      caption: record.fields.Caption || '',
      status: 'unlocked',
    }));
    updateSlides();
  } catch (error) {
    console.error('An error occurred while fetching slides data', error);
  }
};

const createForm = (slideIndex) => {
  const form = document.createElement('form');
  form.innerHTML = `
    ${slideIndex === 0 ? '<input type="text" name="twitter" id="twitter-input" placeholder="Your Twitter Account" required>' : '<textarea name="question" placeholder="Your Question"></textarea>'}
    <div class="buttons">
      ${slideIndex > 0 ? '<button type="button" class="prev" data-slide="'+slideIndex+'">Previous</button>' : ''}
      ${slideIndex === 0 ? '' : '<button type="button" class="skip" data-slide="'+slideIndex+'">Skip</button>'}
      <button type="submit" data-slide="${slideIndex}">${slideIndex === 0 ? 'Get Started' : 'Submit'}</button>
    </div>
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
    ${index !== 0 ? '<button class="prev" data-slide="'+index+'">Previous</button>' : ''}
    <div class="slide">
      ${index !== 0 ? '<img src="'+slideData.src+'" alt="Slide">' : ''}
      <h1>${slideData.caption}</h1>
    </div>
  `;
  slide.appendChild(createForm(index));
  return slide;
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
  const container = document.getElementById('slides-container');
  container.innerHTML = '';
  slides.forEach((slideData, index) => {
    const slide = createSlide(slideData, index);
    slide.style.display = index === 0 ? 'flex' : 'none';
    container.appendChild(slide);
  });
};

fetchSlides();
