let input = document.getElementById('input');
let output = document.getElementById('output');

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
    loading.style.opacity = "1";
    document.getElementById('errors').innerHTML = "";

    fetch('http://51.210.104.99:1841/translate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "from": from, "text": text, "to": to })
    })
    .then(response => response.json())
    .then(response => {
        clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(() => {
            loading.style.opacity = "0";
        }, 500);

        let tranlation = response.response;
        output.innerHTML = tranlation;

        let lang = "Français";
        if(to == 'lis') {
            lang = "Listenbourgeois";
        }

        clearTimeout(historyTimeout);

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
    translateTiemout = setTimeout(() => {
        fetchTranslation(from, text, to);
    }, 110);
});

function Speak() {
    let lang = "de-DE";
    if(frenchSelect.checked !== true) {
        lang = "fr-FR";
    }

    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.text = output.value;
    msg.lang = lang;
    msg.voice = voices[1];
    window.speechSynthesis.speak(msg);
}