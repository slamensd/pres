// script.js

let slideData = [
    // Dummy slide data to represent your slides
    { src: 'slides/Slide1.png', caption: '' },
    { src: 'slides/Slide2.png', caption: '' },
    { src: 'slides/Slide3.png', caption: '' },
    // ...
    // Add more slides as needed
    { src: 'slides/Slide12.png', caption: '' }
];

let currentIndex = 0;

// Your Airtable API Key and base ID
const apiKey = 'keyzbt7lLQxpiP1MO';
const baseId = 'appMQObOvMIuSBflv';
const tableName = 'Slides';

let twitterHandle = '';

// Headers for Airtable API
const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
};

const fetchQuestions = async (slideIndex) => {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={Slide}='${slideIndex}'`, {
        headers: headers
    });
    const data = await response.json();
    return data.records.map(record => record.fields.Question);
};

const createForm = (index) => {
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const label = document.createElement('label');
    label.innerText = index === 0 ? 'What is your Twitter handle?' : 'Questions?';
    formContainer.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type here...';
    formContainer.appendChild(input);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const submitButton = document.createElement('button');
    submitButton.className = 'button';
    submitButton.innerText = 'Submit';
    submitButton.onclick = () => {
        if (index === 0) {
            twitterHandle = input.value;
        } else {
            postDataToAirtable(index, twitterHandle, input.value);
        }
        input.value = '';
        currentIndex++;
        updateSlides();
    };
    buttons.appendChild(submitButton);

    if (index > 0) {
        const skipButton = document.createElement('button');
        skipButton.className = 'button';
        skipButton.innerText = 'Skip';
        skipButton.onclick = () => {
            currentIndex++;
            updateSlides();
        };
        buttons.appendChild(skipButton);
    }

    formContainer.appendChild(buttons);
    return formContainer;
};

const createSlide = async (slideData, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide-container';
    slide.innerHTML = `
        <div class="slide">
            ${index !== 0 ? '<button class="prev">Previous</button>' : ''}
            ${index !== 0 ? '<img src="'+slideData.src+'" alt="Slide">' : ''}
            <p>${slideData.caption}</p>
        </div>
    `;
    slide.querySelector('.slide').appendChild(createForm(index));
    if (index !== 0) {
        const questions = await fetchQuestions(`Slide ${index}`);
        const questionLog = document.createElement('div');
        questionLog.className = 'question-log';
        questionLog.innerHTML = questions.map(question => `<p>${question}</p>`).join('');
        slide.appendChild(questionLog);
        slide.querySelector('.prev').onclick = () => {
            currentIndex--;
            updateSlides();
        };
    }
    return slide;
};

const postDataToAirtable = (slideNumber, twitterHandle, question) => {
    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "fields": {
                "Slide": `Slide ${slideNumber}`,
                "Twitter": twitterHandle,
                "Question": question
            }
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
};

const updateSlides = async () => {
    const slidesContainer = document.getElementById('slidesContainer');
    slidesContainer.innerHTML = '';
    const slides = await Promise.all(slideData.map((data, index) => createSlide(data, index)));
    slidesContainer.append(...slides);
    slides.forEach((slide, index) => slide.style.display = index === currentIndex ? 'flex' : 'none');
};

document.addEventListener('DOMContentLoaded', () => {
    updateSlides();
});
