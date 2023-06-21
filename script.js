$(document).ready(function() {
    // Replace these with your own values
    const airtableBaseId = 'appMQObOvMIuSBflv';
    const airtableTableName = 'Slides';
    const airtableApiKey = 'keyzbt7lLQxpiP1MO';

    const slides = [
        { number: 1, caption: 'Welcome to Frensville', unlocked: true, imageUrl: 'slides/Slide1.png' },
        { number: 2, caption: 'Our Mission', unlocked: false, imageUrl: 'slides/Slide2.png' },
        // add more slides
    ];

    const saveSlides = function() {
        localStorage.setItem('slides', JSON.stringify(slides));
    };

    const loadSlides = function() {
        const savedSlides = JSON.parse(localStorage.getItem('slides'));
        if (savedSlides) slides = savedSlides;
    };

    const updateSlides = function() {
        $('#slides-container').empty();  // Clear the slides container

        slides.forEach((slide, index) => {
            const slideContainer = $('<div>', { class: 'slide-container', id: `slide-${slide.number}` });
            const slideDiv = $('<div>', { class: 'slide' });
            const formContainer = $('<div>', { class: 'form-container' });
            if (slide.unlocked) slideDiv.css('display', 'block');

            const slideImg = $('<img>', { src: slide.imageUrl, alt: `Slide ${slide.number}` });
            const slideCaption = $('<p>', { text: slide.caption });

            const twitterInput = $('<input>', { type: 'text', placeholder: 'Your Twitter handle' });
            const questionInput = $('<textarea>', { rows: 3, placeholder: 'Your question' });
            const submitButton = $('<button>', { text: 'Submit', click: function() {
                const data = {
                    fields: {
                        "Slide": slide.number,
                        "Twitter": twitterInput.val(),
                        "Question": questionInput.val()
                    }
                };
                $.ajax({
                    url: `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${airtableApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(data),
                    success: function() {
                        if (index + 1 < slides.length) {
                            slides[index + 1].unlocked = true;
                            saveSlides();
                            updateSlides();
                        }
                    }
                });
            }});
            const skipButton = $('<button>', { text: 'Skip', click: function() {
                if (index + 1 < slides.length) {
                    slides[index + 1].unlocked = true;
                    saveSlides();
                    updateSlides();
                }
            }});

            slideDiv.append(slideImg, slideCaption);
            formContainer.append(twitterInput, questionInput, submitButton, skipButton);
            slideContainer.append(slideDiv, formContainer);
            $('#slides-container').append(slideContainer);
        });
    };

    loadSlides();  // Load slides from local storage
    updateSlides();  // Display slides
});
