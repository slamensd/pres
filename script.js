// Airtable config
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

let slides = Array.from({ length: 12 }, (_, i) => ({
    src: `slides/Slide${i + 1}.png`,
    caption: `Slide ${i + 1}`,
    status: "unlocked"
}));

let twitterAccount = '';

const createForm = (slideIndex) => {
    const form = document.createElement('form');
    form.innerHTML = `
        ${slideIndex === 0 ? '<input type="text" name="twitter" id="twitter-input" placeholder="Your Twitter Account" required>' : ''}
        <textarea name="question" placeholder="Your Question"></textarea>
        <div class="buttons">
            ${slideIndex > 0 ? '<button type="button" class="prev" data-slide="'+slideIndex+'">Previous</button>' : ''}
            <button type="button" class="skip" data-slide="${slideIndex}">Skip</button>
            <button type="submit" data-slide="${slideIndex}">Submit</button>
        </div>
    `;
    form.onsubmit = async (event) => {
        event.preventDefault();
        const { twitter, question } = event.target.elements;
        if (twitter) {
            twitterAccount = twitter.value;
        }
        if (twitterAccount) {
            await submitQuestion(slideIndex, twitterAccount, question.value);
            event.target.reset();
        }
        showNextSlide(slideIndex);
    };
    form.querySelector('.skip').onclick = () => showNextSlide(slideIndex);
    if (slideIndex > 0) {
        form.querySelector('.prev').onclick = () => showPreviousSlide(slideIndex);
    }
    return form;
};

const createSlide = (slideData, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide-container';
    slide.innerHTML = `
        <div class="slide">
            <img src="${slideData.src}" alt="Slide">
            <p>${slideData.caption}</p>
        </div>
    `;
    slide.appendChild(createForm(index));
    return slide;
};

const submitQuestion = async (slideIndex, twitter, question) => {
    const data = {
        "records": [
            {
                "fields": {
                    "Slide": `Slide ${slideIndex + 1}`,
                    "Twitter": twitter,
                    "Question": question
                }
            }
        ]
    };
    await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
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

updateSlides();
