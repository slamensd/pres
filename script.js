// Airtable config
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

// Array with all the slides
let slides = Array.from({ length: 12 }, (_, i) => ({
    src: `slides/Slide${i + 1}.png`,
    caption: `Slide ${i + 1}`,
    status: "unlocked"
}));

const createForm = (slideIndex) => {
    const form = document.createElement('form');
    form.innerHTML = `
        <input type="text" name="twitter" placeholder="Your Twitter Account" required>
        <textarea name="question" placeholder="Your Question"></textarea>
        <button type="button" class="skip" data-slide="${slideIndex}">Skip</button>
        <button type="submit" data-slide="${slideIndex}">Submit</button>
    `;
    form.onsubmit = async (event) => {
        event.preventDefault();
        const { twitter, question } = event.target.elements;
        if (twitter.value) {
            await submitQuestion(slideIndex, twitter.value, question.value);
            event.target.reset();
        }
        showNextSlide(slideIndex);
    };
    form.querySelector('.skip').onclick = () => showNextSlide(slideIndex);
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
