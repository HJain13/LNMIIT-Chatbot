var sentences = [];

function genie(){
	var query = document.getElementById('query').value;
	document.getElementById('chat').innerHTML = document.getElementById('chat').innerHTML + '<div class="columns is-marginless"><div class="column"><div class="has-text-right"><div class="is-chat-bubble-user">'+query+'</div></div></div><div>';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(xhttp.responseText);
			console.log(response);
			var bestAnswer = response['best_answer']['answer'];
			document.getElementById('chat').innerHTML = document.getElementById('chat').innerHTML + '<div class="columns is-marginless"><div class="column is-1 has-no-right-padding"><img src="http://www.askanthonyjohnson.com/wp-content/uploads/2017/11/bot-icon-2883144_640-300x300.png" alt=""></div><div class="column is-11"><div class="is-chat-bubble-bot">'+bestAnswer+'</div></div>';
			window.scroll(0, document.getElementById('chat').scrollHeight);
			document.getElementById('query').value = '';
		}
	};
	xhttp.open("GET", "/api/answer/"+encodeURI(query), true);
	xhttp.send();
	return false;
}