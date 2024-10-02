const fs = require('fs');
const express = require('express');
const multer  = require('multer');
const path = require('path');
const bodyParser = require('body-parser');// Require CryptoJS library
const CryptoJS = require('crypto-js');  
var EdDSA = require('elliptic').eddsa;
var eCurve = new EdDSA('ed25519');
const SHA256 = require('crypto-js/sha256');

var {SHA3} = require('sha3');
var hasher = new SHA3(256);



// Not needed on the server because we dont have the user's secret keys anyways
// <--- maybe? may wanna exchange /admin encryptiion

/*
// Function to generate RSA key pair
function generateRSAKeyPair() {
    var rsaKey = CryptoJS.lib.WordArray.random(256/8); // 2048-bit key size
    return {
        privateKey: rsaKey.toString(CryptoJS.enc.Base64),
        publicKey: rsaKey.toString(CryptoJS.enc.Base64)
    };
} 
// Function to encrypt data using AES
function encryptData(data, key) {
    var encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    return encryptedData;
} 
// Function to sign the hash of data using RSA
function signDataHash(dataHash, privateKey) {
    var signature = CryptoJS.RSA.sign(dataHash, privateKey);
    return signature.toString(CryptoJS.enc.Base64);
} 
// Function to verify the signature of the hash using RSA public key
function verifySignature(dataHash, signature, publicKey) {
    return CryptoJS.RSA.verify(dataHash, publicKey, signature);
}

// // Function to convert a string to Base64
function stringToBase64(str) {
    // Convert string to a UTF-8 encoded byte array
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert the byte array to a Base64 string
    return btoa(String.fromCharCode.apply(null, utf8Bytes));
} 
// Function to convert a Base64 string back to a regular string
function base64ToString(base64) {
    // Decode the Base64 string to a byte string
    const byteString = atob(base64);
    // Convert the byte string to a byte array
    const utf8Bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        utf8Bytes[i] = byteString.charCodeAt(i);
    }
    // Decode the UTF-8 byte array back to a regular string
    return new TextDecoder().decode(utf8Bytes);
}
const CHAR_MAP = [ 
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_'
];
function filterOutBadChars(stringArray, charmap){
    let asciiString = '';
    for (let i = 0; i < stringArray.length; i++) { 
        asciiString += charmap.indexOf( stringArray.charAt(i) ) > -1 ? stringArray.charAt(i) : '';//charmap[array[i]%charmap.length];
    }
    return asciiString;
}

function convertArrayTo_FINAL_Ascii(array, charmap) { 
    let asciiString = '';
    for (let i = 0; i < array.length; i++) { 
        asciiString += charmap[array[i]%charmap.length];
    }
    return asciiString;
}
*/

function is32ByteArray(input) {
    // Check if the input is an array
    if (!Array.isArray(input)) {
        return false;
    }
    // Check if the array has exactly 32 elements
    if (input.length !== 32) {
        return false;
    }
    // Check if every element in the array is an integer between 0 and 255
    for (let i = 0; i < input.length; i++) {
        if (typeof input[i] !== 'number' || !Number.isInteger(input[i]) || input[i] < 0 || input[i] > 255) {
            return false;
        }
    }
    return true;
}
function isStringLessThan80Chars(input) {
    // Check if the input is a string
    if (typeof input !== 'string') {
        return false;
    }
    // Check if the string length is less than 40 characters
    if (input.length >= 80) {
        return false;
    }
    return true;
}
function isPositiveInteger(input) {
    // Check if the input is a number, is an integer, and is greater than 0
    if (typeof input === 'number' && Number.isInteger(input) && input > 0) {
        return true;
    }
    return false;
}


class LogItAll{
    constructor( debConf ){
        this.debug = debConf.debug;
    }
    log( strms ){
        let t = Date.now();
        if( this.debug ){
            console.log( { time: t, data: strms } );
        }
    }
    blast( strms ){
        let t = Date.now();
        console.log( { time: t, data: strms } );
    }
}
const Blog = new LogItAll({ debug: false });


const TRUECONFIG = {
    // Pagination chunks
    paginationChunks: 30,
    nonceRecycleTime: 4000,         // The min amount of time before you accept the same nonce (api reqs must be in the last sliding window of time to be accepted)
    maxGroupChatsPerSecond: 0.01,   // Maximum amount of gc's allowed to start per second
    maxPingsPerSecond: 13,          // Maximum amount of requests per second before rejecting an IP
    allowSocketConnections: false,
    ipBlacklist: [],
    adminSecretRooms: [             // add the public full room key to this array to allow it to be posted to
                                //<-   if there's >0 then it prohibits the creation of public rooms
    ],
    lastHundredRPublic: true,       // Keep track of the last 100 messages to display on the homepage (seperate fetch call)
    adminPanelIsPublic: true,       // Key for showing others
    theseConfigsPublic: true        //  '/admin' also displays these configs

}
 
Blog.log( TRUECONFIG );

 

// IP happenings...
const IP_HAPPS = {}
function checkipaddress(req){
    // TODO  check ohow ez it is to modify a single character in the "dip2" variable as defined
    let dip2 = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let dr = new CustomRandom( dip2, hasher );
    let hsh_ind = ''+dr.nextHash();
    let slot = IP_HAPPS[ hsh_ind ]; 
    
    if( slot ){
        let currTime = Date.now();

        slot.lastHit = currTime;
    }
    else{
        IP_HAPPS[hsh_ind] = {lastHit: Date.now()}
    }

    let rawj = req.body;
    // Sanitize the inputs
    if( !is32ByteArray( rawj.room ) ) return false;
    if( !isStringLessThan80Chars( rawj.rnnce )) return false;
    // if( !isStringLessThan80Chars( rawj.msg )) return false;??????  TODO calc the bytes
    if( !isPositiveInteger( rawj.tmsent )) return false;
    if( !isPositiveInteger( rawj.pgn )) return false;
    if( !isPositiveInteger( rawj.type )) return false;

    return true;

}

// Track unique random nums happenings 
var NNC_HAPPS = {};
var NNC_ARRAY = [];

// TODO check if this is really fast
function checkNonce(nonceString){
    return NNC_HAPPS[ ''+nonceString ];
}
function addNonce( nonceString ){

    // IF IN THIS FUNCTION, ALREADY PASSED the CHECKED !checkNonce() if statemetn
    let nUnonceObj = {
        tme: Date.now(),
        nnc: nonceString
    };
    NNC_HAPPS[''+nonceString] = nUnonceObj;
    NNC_ARRAY.push( nUnonceObj );

    // So you'll be adding a new one, just check if u need to delete any of them in the mean time

    let cuTme = Date.now(); 
    for( let i = NNC_ARRAY.length-1;i > -1;i-- ){    // The whole reason we have an array : just step through

        if( NNC_ARRAY[ i ].tme + TRUECONFIG.nonceRecycleTime < cuTme ){
            let objExpelled = NNC_ARRAY.splice( i, 1 )[0];
            delete NNC_HAPPS[objExpelled.nnc];
        }
 
    }

    return true;
}

// Group chats
const GCS = {};
function getChat( hashIdent, pubKey ){
    let gc = GCS[ hashIdent ];
    if( gc ){
        return gc;
    }
    gc = addChat( hashIdent, pubKey ); 
    return gc;
}
function addChat( roomHash, pubKey ){
    GCS[''+roomHash] = createGroupChat( roomHash, pubKey );
    return GCS[''+roomHash];
}


function createGroupChat( roomHash, pubKey ){
    return{
        "title": roomHash,
        "pub_key": pubKey,
        "date_created": Date.now(),
        "total_bytes": 0,
        //  ^^^ All internal stuff, the user cant verify
        // any of this, that's why only send messages
        "messages": []  // {bytes, from, sig, message, message_hash}
    };
}

function addMessage( gc, sanitizedJson ){
    // Nonce and signature passed, all good
    // and SANTIZED - double check for this
    if( sanitizedJson.type > 0 && sanitizedJson.msg.length > 0 ){
        let nuMessage = {
            timeadded: Date.now(),
            reqclone: sanitizedJson
        };
        gc.messages.push( nuMessage );
    } 
    
    //TODO add bytes calculator

    return {
        title: gc.title,
        pub_key: gc.pub_key,
        date_created: gc.date_created,
        total_bytes: gc.total_bytes,
        total_messages: gc.messages.length,
        messages: getLastElements( gc.messages, TRUECONFIG.paginationChunks )  // {bytes, from, sig, message, message_hash}

    }
}

// const crypto = require('crypto');
// const algorithm = 'aes-256-cbc';
// const fsExtra = require('fs-extra');
// var EdDSA = require('elliptic').eddsa;
// var ec = new EdDSA('ed25519');

 
 
const app = express();
app.use(bodyParser.json()); 
const PORT = process.env.PORT || 80; // Use port 8080 by default


 



class CustomRandom {

	constructor(newHash, hashver){
        this.firstHash = "" + newHash;
		this.hash = "@bonisdev"+newHash;
		this.runs = 0;
		this.precalced = [];
		this.precalcedCounter = -1;
		this.sha3_256Link = hashver;

		for(let p = 0;p < 0;p++){
			this.precalced.push(this.random());
		}
	}
	nextHash(){
		this.sha3_256Link.reset();
		this.hash = toHexString(
			this.sha3_256Link.update(this.hash).digest()
		);
		return this.hash;
	}
	numFromHash(seed){
		const nBits = 52;
		seed = seed.slice(0, nBits / 4);
		const r = parseInt(seed, 16);
		let X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1)
		return X;
	}
	random(){
		this.runs++;
		return this.numFromHash(this.nextHash());
	}
	random_pre(){
		this.precalcedCounter = 
			(this.precalcedCounter + 1) % 
			this.precalced.length;
		return this.precalced[this.precalcedCounter];
	}
}

function toHexString(byteArray) {
	return Array.prototype.map.call(byteArray, function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('');
}


function uint8ToHexString( uint8Bytes ){
    let outt = '';
    for(let i = 0;i < uint8Bytes.length;i++){
        outt += ''+uint8Bytes[i].toString(16)
    }
    return outt;
}
function getLastElements(arr, count) {
    // If the array length is less than the count, return the whole array
    if (arr.length <= count) {
        return arr;
    }
    // Otherwise, return the last `count` elements
    return arr.slice(-count);
}


var RAND = new CustomRandom("3423dfsdfsdf4"+Date.now()+Math.random(), hasher);
Blog.log(RAND.random());
var perfectRandomTest = new CustomRandom( 'hellobozo', hasher );
Blog.log('perfectRandomTest', perfectRandomTest.nextHash())







// Begin SERVER
function timeToListen(){
    Blog.log('Begin serving');

    app.use(express.static(path.join(__dirname, 'public')));
    
    app.get('/', (req, res) => { 
        checkipaddress(req, res);
        res.sendFile( path.join(__dirname, 'index.html'));
    });
    app.get('/tget', (req, res) => { 
        checkipaddress(req, res);
        res.json( {t: Date.now()} );
    });
    // Get all stats of the server
    app.get('/admin', (req, res) => {
        checkipaddress(req, res);
        // For demonstration, sending back a response with received parameters
        res.json( {allIps: IP_HAPPS, gcs: GCS, nonces: NNC_ARRAY} );
    });
    app.get('/map', (req, res) => {
        checkipaddress(req, res);
        res.sendFile( path.join(__dirname, 'mapex.html'));
    });
    
    app.post('/trib', (req, res) => {

        // TODO add logic for blacklisting IP's
        checkipaddress(req, res);
        // TODO santize the input of the json 
        const jsonData = req.body;
        
        Blog.log('pub')
        Blog.log(jsonData.room)
        Blog.log( uint8ToHexString(jsonData.room) )

        var publicRoomKey = Buffer.from( jsonData.room ).toString( 'hex' );
        publicRoomKey = ""+publicRoomKey;

        let key = eCurve.keyFromPublic( jsonData.room, 'hex' );
 
        // Make the msg hash yourself:
        var digstsion = '' +
            jsonData.tmsent + 
            jsonData.rnnce + 
            jsonData.msg + 
            jsonData.pgn +  // pagination (default 0 (newest))
            jsonData.type;  //type=0=> no post just want an update
                            //type=1=> text post
                            //type=2=> image file
                            //type=3=> sound file type
                            //type=4=> any other file type
        
        Blog.log('digstsion ' + digstsion);
        let timeOfMeRn = Date.now();
        
        var ourHash = (new CustomRandom(digstsion, hasher )).nextHash();
        // Check for a unique hash
        if( ''+ourHash === ''+jsonData.msghash && !checkNonce(''+jsonData.rnnce) ){
            // Check for correct timing window, so bad actors cant hold on to messages for a long time
            if( jsonData.tmsent < timeOfMeRn && jsonData.tmsent > timeOfMeRn - TRUECONFIG.nonceRecycleTime ){
                //Finally verify the hashes sig we got w da everything
                let vrifeid = key.verify( ourHash, jsonData.sig );
                Blog.log('vrifeid '+ vrifeid);

                if( vrifeid ){
                    //let potDis = convertArrayTo_FINAL_Ascii( jsonData.room, CHAR_MAP );

                    // Get group chat:
                    let gc = getChat( publicRoomKey, jsonData.room );//potDis );
                    // If it is possible to add nonce, that was the final important thing
                    addNonce( jsonData.rnnce );

                    // TODO apply the limits to a poster here (if not on the super whitelist)
                    
                    //if on bad list:
                    //return res.status(999).json({ error: "LEAVE. now. seariously not cool showing your face around here. I've reported this" });

                            // also returns the group chat, so just return the result of adding the newest message
                    let returnResponce = addMessage( gc, jsonData );

                    return res.json({total_gc: returnResponce});
                }
                else{
                    // Add a black list strike to the incident
                    return res.status(566).json({ error: "not verifying sig" });
                }
            }
            else{
                // Has happened too often
                return res.status(577).json({ error: "timing and nonce are off" });
            }
        }
        else{
            // Malformed  - add to banned IP list.
            Blog.log('malformed key check: banned ip now ahahah');
            // Add a black list strike to the incident
            return res.status(588).json({ error: "very angry about this" });
        }

        
        return;

    });
 
    
    // Start the server
    app.listen(PORT, () => {
        Blog.blast(`Server is running on http://localhost:${PORT}`);
    });
 
    
}

 
timeToListen();