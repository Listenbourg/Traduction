let ERROR_DIV = document.getElementById("errors");

let input = document.getElementById("input");
let output = document.getElementById("output");

const translationSpeed = 200;

let translateTiemout = null;

let history = document.querySelector(".history .card-content");
let historyTimeout = null;
let historyEmpty = true;
let historyEnabled = false;

function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "’");
}

let loading = document.getElementById("translateLoading");
let loadingTimeout = null;

function fetchTranslation(from, text, to) {
	ERROR_DIV.innerHTML = "";
	ERROR_DIV.classList.remove("visible");

	let url = `http://51.210.104.99:1841/translate?from=${from}&to=${to}&text=${text}`;

	fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
		method: "GET",
	})
		.then((response) => response.json())
		.then((response) => {
			response = JSON.parse(response.contents);

			clearTimeout(loadingTimeout);
			loadingTimeout = setTimeout(() => {
				translateLoading.classList.remove("visible");
			}, 500);

			// interprête la trad
			let translation = response.response;
			let scores = JSON.parse(response.detail_reponse);

			console.log(text, response);

			// détecte les mots inconnus (entre deux #)
			// regex : /(?<=\#)(.*?)(?=\#)/g
			// remplacer avec un span

			// c'est copilot qui a fait ça moi j'avais la flemme

			let words = translation.split(" ");
			let newWords = [];
			for (let i = 0; i < words.length; i++) {
				let wordSearch = words[i];
				let score = scores.find(({ word }) => word === wordSearch).score;

				// generate id
				let wordID =
					Math.random().toString(36).substring(2, 15) +
					Math.random().toString(36).substring(2, 15);

				if (score == -1) {
					// le mot correspond pas
					let newWord = wordSearch.replace(/#/g, "");
					newWords.push(
						`<span id="notice_${wordID}" class="word unknown-word" onmouseover="showWord('${escapeHtml(
							newWord
						)}', 'notice_${wordID}', 0)">${newWord}</span>`
					);
				} else if (score < 1) {
					// le mot correspond pas totalement
					let newWord = wordSearch.replace(/#/g, "");
					newWords.push(
						`<span id="notice_${wordID}" class="word unexact-word" onmouseover="showWord('${escapeHtml(
							newWord
						)}', 'notice_${wordID}', ${score})">${newWord}</span>`
					);
				} else {
					// le mot correspond
					let newWord = wordSearch.replace(/#/g, "");
					newWords.push(
						`<span id="notice_${wordID}" class="word perfect-word" onmouseover="showWord('${escapeHtml(
							newWord
						)}', 'notice_${wordID}', ${score})">${newWord}</span>`
					);
				}
			}

			translation = newWords.join(" ");

			// affiche la trad
			if (document.getElementsByClassName("placeholder").length !== 0) {
				document.getElementsByClassName("placeholder")[0].remove();
			}

			output.innerHTML = translation;

			// détermine la langue
			let lang = "Français";
			if (to == "lis") {
				lang = "Listenbourgeois";
			}

			// error handling
			if (translation == "Error during translation processing") {
				ERROR_DIV.innerHTML =
					`<h3>La traduction ne s'est pas effectuée correctement !</h3>\n` +
					`<p>${translation}</p>`;
				ERROR_DIV.classList.add("visible");
			}

			// historique
			clearTimeout(historyTimeout);

			historyTimeout = setTimeout(() => {
				if (!historyEnabled) {
					history.innerHTML =
						'<div class="history-line"><div class="history-result">Historique vide, vous n\'avez pas encore traduit quelque chose !</div></div>';
					historyEnabled = true;
					historyEmpty = true;
				}

				if (input.value.trim() !== "") {
					history.innerHTML =
						`
                        <div class="history-line">
                    <div class="history-source">${escapeHtml(
											input.value
										)} - EN ${lang.toUpperCase().trim()}</div>
                    <div class="history-result">${escapeHtml(
											output.innerText
										)}</div>
                </div>` + (historyEmpty ? "" : history.innerHTML);

					historyEmpty = false;
				}
			}, 1000);
		})
		.catch((error) => {
			console.error(error);
			ERROR_DIV.innerHTML += `
                <h3>Une erreur est survenue !</h3>
                <p>${error}</p>
        `;
			ERROR_DIV.classList.add("visible");
		});
}

let frenchSelect = document.getElementById("frenchSelect");
let listenishSelect = document.getElementById("listenishSelect");

input.addEventListener("input", function () {
	let from = "fr";
	let to = "lis";

	clearTimeout(historyTimeout);

	if (frenchSelect.checked !== true) {
		from = "lis";
		to = "fr";
	}

	let text = escapeHtml(input.value);

	clearTimeout(translateTiemout);
	translateLoading.classList.add("visible");
	translateTiemout = setTimeout(() => {
		fetchTranslation(from, text, to);
	}, translationSpeed);
});

function Speak() {
	var msg = new SpeechSynthesisUtterance();
	var voices = window.speechSynthesis.getVoices();
	msg.text = output.innerText;
	msg.lang = "de-DE";
	msg.voice = voices[1];
	window.speechSynthesis.speak(msg);
}

function showWord(word, span, score) {
	let str = `"${word}" correspond à <B>${Math.round(score * 100)}%</B>`;

	let theme = "tomato";
	if (score == 0) {
		theme = "wrong";
	} else if (score == 1) {
		theme = "default";
	}

	tippy(document.getElementById(span), {
		theme: theme,
		content: str,
		placement: "bottom",
		arrow: false,
		allowHTML: true,
	});
}
