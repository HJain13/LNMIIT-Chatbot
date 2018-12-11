var sentences = [];
var bestAnswer = '';
var query = '';
var cFlag = 0;
var cDomain = '';

const synth = window.speechSynthesis;
const speak = (action) => {
	utterThis = new SpeechSynthesisUtterance(action);
	const voices = synth.getVoices();
	utterThis.voice = voices[3];
	synth.speak(utterThis);
};

function genie(flag) {
	var node = document.getElementsByClassName("review-button")[0];
	if (node != undefined) node.parentNode.removeChild(node);		
	query = document.getElementById("query").value;
	if (query != '') {
		document.getElementById("chat").innerHTML += `
			<div class="columns is-marginless">
				<div class="column">
					<div class="has-text-right">
						<div class="is-chat-bubble-user">
								${query}
						</div>
					</div>
				</div>
			<div>
		`;
	}
	switch(cFlag) {
		case 0: 
			if(query.toLowerCase().search("complaint") != -1) {
				cFlag = 1;
				document.getElementById("chat").innerHTML += `
					<div class="columns is-marginless">
						<div class="column is-1 has-no-right-padding">
							<img src="http://www.askanthonyjohnson.com/wp-content/uploads/2017/11/bot-icon-2883144_640-300x300.png" alt="">
						</div>
						<div class="column is-11">
							<div class="is-chat-bubble-bot">
								Choose Complaint Domain
							</div>
						</div>
					</div>
					<div class="columns is-marginless review-button">
						<div class="column is-1 has-no-right-padding"></div>
						<div class="column is-11 has-no-vertical-padding">
							<div class="field is-grouped">
								<p class="control">
									<a class="button is-rounded" onclick="(function(){genie(0);cDomain='Academics'})();return false;">
										Academics 🏫
									</a>
								</p>
								<p class="control">
								<a class="button is-rounded" onclick="(function(){genie(0);cDomain='Maintenance'})();return false;">
										Maintenance 👷‍
									</a>
								</p>
							</div>
						</div>
					</div>
				`;
				window.scroll(0, document.getElementById("chat").scrollHeight);
				document.getElementById("query").value = "";
			} else {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = JSON.parse(xhttp.responseText);
						console.log(response);
						bestAnswer = response["best_answer"]["answer"];
						document.getElementById("chat").innerHTML += `
							<div>
								<div class="columns is-marginless">
									<div class="column is-1 has-no-right-padding">
										<img src="http://www.askanthonyjohnson.com/wp-content/uploads/2017/11/bot-icon-2883144_640-300x300.png" alt="">
									</div>
									<div class="column is-11">
										<div class="is-chat-bubble-bot">
											${bestAnswer}
										</div>
									</div>
								</div>
								<div class="columns is-marginless review-button">
									<div class="column is-1 has-no-right-padding"></div>
									<div class="column is-11 has-no-vertical-padding">
										<div class="field is-grouped">
											<p class="control">
												<a class="button is-rounded" onclick="review(1)">
													👍
												</a>
											</p>
											<p class="control">
												<a class="button is-rounded" onclick="review(0)">
													👎
												</a>
											</p>
										</div>
									</div>
								</div>
							</div>					
						`;
						if (flag == 1) {
							speak(bestAnswer);
						}
						window.scroll(0, document.getElementById("chat").scrollHeight);
						document.getElementById("query").value = "";
					}
				}
				xhttp.open("GET", "/api/answerv2/" + encodeURI(query), true);
				xhttp.send();
			}
			break;
		case 1: {
			if (cDomain == '') {
				cDomain = document.getElementById("query").value;
				document.getElementById("query").value = "";
			}
			document.getElementById("chat").innerHTML += `
				<div class="columns is-marginless">
					<div class="column">
						<div class="has-text-right">
							<div class="is-chat-bubble-user">
								Maintenance
							</div>
						</div>
					</div>
				<div>
			`;
			cFlag = 2;
			document.getElementById("chat").innerHTML += `
				<div class="columns is-marginless">
					<div class="column is-1 has-no-right-padding">
						<img src="http://www.askanthonyjohnson.com/wp-content/uploads/2017/11/bot-icon-2883144_640-300x300.png" alt="">
					</div>
					<div class="column is-11">
						<div class="is-chat-bubble-bot">
							Enter Your Complaint
						</div>
					</div>
				</div>
			`;
			window.scroll(0, document.getElementById("chat").scrollHeight);
		}
		break;
		case 2: {
			cReason = document.getElementById("query").value;
			document.getElementById("query").value = "";
			cFlag = 0;
			document.getElementById("chat").innerHTML += `
				<div class="columns is-marginless">
					<div class="column is-1 has-no-right-padding">
						<img src="http://www.askanthonyjohnson.com/wp-content/uploads/2017/11/bot-icon-2883144_640-300x300.png" alt="">
					</div>
					<div class="column is-11">
						<div class="is-chat-bubble-bot">
							Your complaints has been noted!
						</div>
					</div>
				</div>
			`;
		}
		break;
	}
  return false;
}

function review(flag){
	var node = document.getElementsByClassName("review-button")[0];
	if (node != undefined) node.parentNode.removeChild(node);
	var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

    }
	};
  xhttp.open("GET", "/api/review/" + encodeURI(JSON.stringify({ query: query, answer: bestAnswer, review: flag})), true);
  xhttp.send();
}

const dictate = () => {
	window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
	const recognition = new SpeechRecognition();
  recognition.start();
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
		document.getElementById("query").value = speechToText;
		genie(1);
    // paragraph.textContent = speechToText;
  }
}
