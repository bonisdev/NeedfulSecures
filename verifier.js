const fs = require('fs'); 
const { Hash } = require('sha3');

// Function to compute SHA-3 hash of a file
function getSha3Hash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = new Hash(512);  // Using SHA3-512
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const result = hash.digest('hex');
            resolve(result);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

// Usage
const filePath = './server.js';
getSha3Hash(filePath)
    .then(hash => {
        console.log(`SHA3-512 hash of the file is: ${hash}`);
    })
    .catch(err => {
        console.error(`Error: ${err.message}`);
    });
