//Server API for sending commands to the server that are not over the socket
var ServerAPI = {}
ServerAPI.baseURL =  "http://" + "127.0.0.1" + ":43177"

ServerAPI.xmlRequest = function(type, req, to){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
            //console.log(":" + this.response)
			to(JSON.parse(this.response));
            //console.log("ehlo")
		}
	};
	xhr.open(type, ServerAPI.baseURL + req, true);
	xhr.send(null);
};


//CMD Legend::::
//0 start game from null game
//1	pause the game
//2 play the game (already created)
//3 terminate the game
ServerAPI.sendGameServerCmd = function(cmd){

    //How to handle the response from the server
    var confirmResponse = function(data){
		if(data.addressStatus === 'Address is invalid...'){
			//Menu.userEnteredAddressIsInvalid = true;
		}else{
			//Menu.userEnteredAddressIsInvalid = false;
		}
		if(data.error){
			//Menu.addNotif(''+data.addressStatus, 3);
		}
	};
    var command = '?cmd=' + cmd;
    command += '&seed=' + "348s97239dhsjf";
    ServerAPI.xmlRequest('GET', "/gamestate"+command, confirmResponse);
}

//

ServerAPI.simplyGetServerState = function(){
    //How to handle the response from the server
    var confirmResponse = function(data){
		//console.log(JSON.stringify(data))

		//Server says running the world
		if(data.srvrstate === "1"){
			//If in pause mode - undo it
			if(clientMode === 2){
				clientMode = 1
				document.getElementById("pauseMenu").classList.add("hidden")
			}

		}
		//Server says paused
		else if(data.srvrstate === "2"){
			//If client is actually in play mode
			if(clientMode === 1){
				clientMode = 2
				document.getElementById("pauseMenu").classList.remove("hidden")
			}
		}


		//Server says running
		if(clientMode === 1 || clientMode === 2){

		}
	};


    var command = ""
    ServerAPI.xmlRequest('GET', "/gamestatestatus"+command, confirmResponse);
}