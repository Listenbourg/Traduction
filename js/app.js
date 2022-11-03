let input = document.getElementById('input');
let output = document.getElementById('output');

const translationSpeed = 200;

let translateTiemout = null;

let history = document.getElementById('history');
let historyTimeout = null;

let historyEnabled = false;

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let loading = document.getElementById('loading');
let loadingTimeout = null;

function fetchTranslation(from, text, to) {
    document.getElementById('errors').innerHTML = "";

    let url = `http://51.210.104.99:1841/translate?from=${from}&to=${to}&text=${text}`;

    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(response => {
        response = JSON.parse(response.contents);
        clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(() => {
            loading.style.opacity = "0";
        }, 500);

        let translation = response.response;
        output.innerHTML = translation;

        let lang = "Français";
        if(to == 'lis') {
            lang = "Listenbourgeois";
        }

        clearTimeout(historyTimeout);

        if (translation == "Error during translation processing") {
            document.getElementById('errors').innerHTML += `
                <div class="historyItem error">
                    <h3>La traduction ne s'est pas effectuée correctement !</h3>
                    <p>${translation}</p>
                </div>
            `;
        }

        historyTimeout = setTimeout(() => {
            if(!historyEnabled) {
                history.innerHTML = "";
                historyEnabled = true;
            }

            if(input.value.trim() !== "") {
                history.innerHTML = `
                    <div class="historyItem">
                        <p class="historyInput">${escapeHtml(input.value)} <span>en ${lang}</span></p>
                        <p class="historyOutput">${escapeHtml(output.value)}</p>
                    </div>
                ` + history.innerHTML;
            }
        }, 1000);
    })
    .catch(error => {
        document.getElementById('errors').innerHTML += `
            <div class="historyItem error">
                <h3>Une erreur est survenue !</h3>
                <p>${error}</p>
            </div>
        `;
    });
}

let frenchSelect = document.getElementById('frenchSelect');
let listenishSelect = document.getElementById('listenishSelect');

input.addEventListener('input', function() {
    let from = "fr";
    let to = "lis";

    clearTimeout(historyTimeout);

    if(frenchSelect.checked !== true) {
        from = "lis";
        to = "fr";
    }

    let text = escapeHtml(input.value);

    clearTimeout(translateTiemout);
    loading.style.opacity = "1";
    translateTiemout = setTimeout(() => {
        fetchTranslation(from, text, to);
    }, translationSpeed);
});

function Speak() {
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.text = output.value;
    msg.lang = "de-DE";
    msg.voice = voices[1];
    window.speechSynthesis.speak(msg);
}