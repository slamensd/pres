// Airtable config
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

let slides = [
  {
    caption: '',
    status: 'unlocked',
    content: `
      <div class="slide-content">
        <h2 class="headline">Explore the Frensville Ecosystem</h2>
        <input type="text" name="twitter" id="twitter-input" placeholder="What is your Twitter handle?" required>
        <button type="submit" data-slide="0" class="cta-button">Get Started</button>
      </div>
    `,
  },
];

let twitterAccount = '';

const createForm = (slideIndex) => {
  const form = document.createElement('form');
  form.innerHTML = slides[slideIndex].content;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const { twitter } = event.target.elements;
    if (twitter) {
      twitterAccount = twitter.value;
    }
    if (twitterAccount) {
      await submitQuestion(slideIndex, twitterAccount);
      event.target.reset();
    }
    showNextSlide(slideIndex);
  };
  return form;
};

const createSlide = (slideData, index) => {
  const slide = document.createElement('div');
  slide.className = 'slide-container';
  slide.innerHTML = `
    <div class="slide">
      ${slideData.content}
    </div>
  `;
  slide.appendChild(createForm(index));
  return slide;
};

const submitQuestion = async (slideIndex, twitter) => {
  const data = {
    records: [
      {
        fields: {
          Slide: `Slide ${slideIndex}`,
          Twitter: twitter,
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

const updateSlides = () => {
  const container = document.getElementById('slides-container');
  container.innerHTML = '';
  slides.forEach((slideData, index) => {
    const slide = createSlide(slideData, index);
    slide.style.display = index === 0 ? 'flex' : 'none';
    container.appendChild(slide);
  });
};

updateSlides();
