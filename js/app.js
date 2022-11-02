let input = document.getElementById('input');
let output = document.getElementById('output');

let history = document.getElementById('history');
let historyTimeout = null;

let historyEnabled = false;

function fetchTranslation(from, text, to) {
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
                        <p class="historyInput">${input.value} <span>en ${lang}</span></p>
                        <p class="historyOutput">${output.value}</p>
                    </div>
                ` + history.innerHTML;
            }
        }, 1000);
    })
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

    let text = input.value;
    fetchTranslation(from, text, to);
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