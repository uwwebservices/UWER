import config from '../config.json';
import rp from 'request-promise';
import fs from 'fs';

export default {
    get: (cardnum) => {
        let magstrip = "", rfid = "";
        if(cardnum.length === 16) {
            if(cardnum[0] !== ';') {
                rfid = cardnum;
            } else if(cardnum[0] === ';') {
                magstrip = cardnum.substring(1,14);
            } else {
                throw "Invalid Card Number";
            }
        } else if(cardnum.length === 14) {
            magstrip = cardnum;
        } else {
            throw "Invalid Card Number";
        }

        let options = {
            method: 'GET',
            url: config.idcardBaseUrl +  "?mag_strip_code=" + magstrip + "&prox_rfid=" + rfid,
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            },
            json: true
        };
        return rp(options)
          .then((parsedBody) => {
            return parsedBody.Cards[0].RegID;
          })
          .catch((err) => {
            console.log('IDCardWS Error: ', err.message);
            throw "Error calling IDCardWS Card Service";
          });
    },
    getPhoto: (regId) => {
        let options = {
            method: 'GET',
            url: config.photoBaseUrl + regId + '-large.jpg',
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            }
        };
        return rp(options)
          .then((body) => {
              return "image/jpeg;base64," + new Buffer(body).toString('base64');
          })
          .catch((err) => {
            console.log('IDCardWS Error: ', err.message);
            throw "Error Calling IDCardWS Photo Service";
          });
    }
}