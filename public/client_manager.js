var messagesInOrder= [
    [0, "Hey are you alive?"],
    [1, "Yea i'm so alive, now chilling as well."],
    [0, "Good to hear... wow i feel different for some reason"],
    [1, "Is it cause my messages are coming over top of you like a warm hug?"],
    [0, "newest items at the top? "],
    [1, "Like a plant?? "],
    [0, "Ermmm ya or gravity?"],
    [1, "E X T R E M E L Y  valid"],
    [0, "slay."], 
    [1, "Bush did 911"],
];

var currentMessages = [];
var currentGroupChatPublicKey = '';
var currentGCBytes = null;

var COUNTER = 0;
var MAX_MESSAGES = 30;

var SEEK_REGEX = "/bob/";
var SEEK_ACTIVE = false;
var SEEK_FOUND_USER = "";
var SEEK_FOUND_ROOM = "";
//const CHAR_MAP = [
//    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
//    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
//    '~', ',', '.', '<', '>', '/', '\\', ':', ';', '\'', '\"', '-', '_', '+', '=', '|', 
//    '{', '}', '[', ']', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')'
//];
const CHAR_MAPS = [
    [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '~', ',', '.', '<', '>', '/', '\\', ':', ';', '\'', '\"', '-', '_', '+', '=', '|', 
        '{', '}', '[', ']', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')'
    ],
    [ 
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_'
    ],
    [ 
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_'
    ]

]
const CHAR_MAP = CHAR_MAPS[ 1 ];

let kkk = '';
for(let i = 0;i < CHAR_MAP.length;i++){
    kkk += CHAR_MAP[i];
}
console.log(kkk)

var RAND_ACCUMULATOR = [];
function RAND_ADD(asdf){
    RAND_ACCUMULATOR.push(asdf);
    if(RAND_ACCUMULATOR.length>3) RAND_ACCUMULATOR.shift();
}

document.getElementById('userIdArea').innerHTML = 'Anonymoos'

function toggleOptions( ovrideClose ) {
    var options = document.getElementById('options');

    if( ovrideClose ){
        options.classList.add('hidden');
    }
    else{
        if (options.classList.contains('hidden')) {
            options.classList.remove('hidden');
        } 
        else {
            options.classList.add('hidden');
        }
    }
}
function gentlyUpdateMessages( data ){
    
    data = data.total_gc;
    var messageContainer = document.getElementById('messageContainer');

    if( currentGroupChatPublicKey !== data.title ){
        currentGroupChatPublicKey = data.title;
        currentGCBytes = hexStringToUint8Array( currentGroupChatPublicKey );

        document.getElementById('exactHeader').innerText = convertArrayTo_FINAL_Ascii(data.pub_key,  CHAR_MAP);
        messageContainer.innerHTML = "";
        
        currentMessages = []; 
    }

    
    messageContainer.innerHTML = "";
    // jsonData.tmsent
    // jsonData.rnnce 
    // jsonData.msg + 
    // jsonData.pgn + 
    // jsonData.type;

    //let key = CHelper__B.ec.keyFromSecret( ENC_SEED );

    // go from back to front:
    // let indOfPrinter = -1;
    // for(let i = 0;i<currentMessages.length;i++){
    //     // If there are messages to print
    //     if( currentMessages[i].reqclone.rnnce === data.messages[0].reqclone.rnnce ){
    //         indOfPrinter = i;
    //         i = currentMessages.length;
    //     }
    // } 
    // indOfPrinter = indOfPrinter > -1 ? indOfPrinter: currentMessages.length-1

    currentMessages = data.messages;
    
    for(let i = 0;i < currentMessages.length;i++){ 
        //base64ToString
        if( currentMessages[i].reqclone.type > 0 ){
            currentMessages[i].reqclone.decedmsesag = base64ToString( 
                attemptDecrypt( ENC_SEED, currentMessages[i].reqclone.msg )
            );
            //currentMessages[i] = data.messages[i].reqclone;
            addMessage( currentMessages[i].reqclone.decedmsesag, false );
        } 
    } 
}
function addMessage(message, isOutgoing) {
    var messageContainer = document.getElementById('messageContainer');
    var messageElement = document.createElement('div');
    messageElement.className = 'message ' + (isOutgoing ? 'outgoing-mes' : 'incoming-mes');
    console.log(message )
    messageElement.textContent = message;

    // Insert the new message at the beginning of the message container
    messageContainer.insertBefore( messageElement, messageContainer.firstChild );

    // Trigger reflow to force CSS transition to work
    messageElement.offsetHeight;

    // Apply animation to the newly added message
    messageElement.classList.add('show');
 
    if (messageContainer.children.length > MAX_MESSAGES) {
        messageContainer.removeChild(messageContainer.lastChild);
    }

    // Automatically remove message after 5 seconds
    // setTimeout(function () {
    //     messageElement.remove();
    // }, 25000);
}

function totalVerificationOfDigestAndSignatureAtleast( messageObject ){
    // Verify time continuity of the saved server vals: relative to how they're coming in
}

function getThePublicHex(displayedSeed){
    let potKey = CHelper__B.ec.keyFromSecret(displayedSeed);
    let potPub = potKey.getPublic();
    return uint8ArrayToHexString(potPub );
}

function getDisplayedSeed( displayedSeed ){
    let potKey = CHelper__B.ec.keyFromSecret(displayedSeed);
    let potPub = potKey.getPublic();

    // Convert potPub to hex string
    // let pubRoomKeyDoneOnServ = Array.from(potPub)
    //     .map(byte => byte.toString(16).padStart(2, '0'))
    //     .join(''); 
    // pubRoomKeyDoneOnServ = "" + pubRoomKeyDoneOnServ;

    // Convert hex string to Uint8Array and process ithexStringToUint8Array(pubRoomKeyDoneOnServ)
    return convertArrayTo_FINAL_Ascii(potPub,  CHAR_MAP);
}

function seekBatch(usem){

    let addnedum='';
    if(usem===0) addnedum = 'room';
    else addnedum = 'user';


    for(let i = 0;i < 87;i++){

        let potSecret = "gen" + Date.now() + Math.random() + "." + Math.random();
        let DA_SEED = ''+( new CustomRandom_sha( potSecret ) ).nextHash();
        DA_SEED = ''+( new CustomRandom_sha( DA_SEED ) ).nextHash();

        let potDis = '';
        if( usem === 0 ) potDis += getDisplayedSeed( VERSION_NUMBER.toString() + ( new CustomRandom_sha( DA_SEED ) ).nextHash() );
        else potDis += getDisplayedSeed( ( new CustomRandom_sha( DA_SEED ) ).nextHash() );
 
        //console.log(potDis);
        let searchPotDis = potDis.substring(0, 16); 
        //console.log('_____');

        if( searchPotDis.indexOf(SEEK_REGEX) > -1 ){
            console.log('username found: ', potDis)
            SEEK_ACTIVE = false;
            document.getElementById('startSeekButton_'+addnedum).classList.remove('loading');
            if(usem===0){
                SEEK_FOUND_ROOM = DA_SEED;
                document.getElementById('secretMatch_'+addnedum).innerHTML = 
                    '<span class=\"key-info\">room key</span> secret <span class=\"warning-area\">'+'(copy into [room key])'+'</span>:' + 
                    '<span class=\"gened-key\"> '+SEEK_FOUND_ROOM+'</span>' + '<br>will display as:<br>' + 
                    '<span class=\"you-area\">' + potDis + '</span>';
                    SEEK_FOUND_ROOM = "";
            }
            else{
                SEEK_FOUND_USER = DA_SEED;//<- the actual user secret key
                document.getElementById('secretMatch_'+addnedum).innerHTML = 
                    'user secret <span class=\"warning-area\">'+'(copy into [user secret])'+'</span>:' + 
                    '<span class=\"gened-key\"> '+SEEK_FOUND_USER+'</span>' + '<br>will display as:<br>' + 
                    '<span class=\"you-area\">' + potDis + '</span>';
                SEEK_FOUND_USER = "";
            }

            
        } 
    } 
    if( SEEK_ACTIVE ){
        COUNTER += 60;
        document.getElementById('secretMatch_'+addnedum).innerHTML = 
            'searched: ' + COUNTER + ' keys';
        setTimeout( ()=>{seekBatch( usem );}, 30);
    }

}

function seek(usem){


    let addnedum='';
    if(usem===0) addnedum = 'room';
    else addnedum = 'user';


    COUNTER = 0;
    if( SEEK_ACTIVE ){
        SEEK_ACTIVE = false;
        document.getElementById('startSeekButton_'+addnedum).classList.remove('loading');
    }
    else {
        var regexToUseToSeek = ""+document.getElementById('regexVal_'+addnedum).value;
        regexToUseToSeek = filterOutBadChars( regexToUseToSeek, CHAR_MAP );
        SEEK_REGEX = regexToUseToSeek;
        document.getElementById('regexVal_'+addnedum).value = SEEK_REGEX;//setAttribute( 'value', SEEK_REGEX );

        if(SEEK_REGEX.length > 0 ){
            SEEK_ACTIVE = true;
            document.getElementById('startSeekButton_'+addnedum).classList.add('loading');
            seekBatch( usem );
        }
        else{
            document.getElementById('secretMatch_'+addnedum).innerHTML = 
                '<span class=\"death-area\">no valid username characters::ONLY::'+JSON.stringify(CHAR_MAP)+'</span>';
        }
    }
}
// Example of adding a message
addMessage('New message added!');