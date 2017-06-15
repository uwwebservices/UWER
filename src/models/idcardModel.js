import config from '../config.json';
import rp from 'request-promise';
import fs from 'fs';

const options = {
            method: 'GET',
            url: "",
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            },
            json: true
        };

export default {
    get: (cardnum) => {
        let magstrip = "", rfid = "";
        if(cardnum.length === 16) {
            if(cardnum[0] !== ';') {
                rfid = cardnum;
            } else if(cardnum[0] === ';') {
                magstrip = cardnum.substring(1,14);
            } else {
                throw new IDCardFormatError();
            }
        } else if(cardnum.length === 14) {
            magstrip = cardnum;
        } else {
            throw new IDCardFormatError();
        }
        let opts = Object.assign({}, options, { 
            url: config.idcardBaseUrl +  "?mag_strip_code=" + magstrip + "&prox_rfid=" + rfid,
        });

        return rp(opts)
          .then((parsedBody) => {
            return parsedBody.Cards[0].RegID;
          })
          .catch((err) => {
              throw err;
          });
    },
    getPhoto: (regId) => {
        let opts = Object.assign({}, options, { 
            url: config.photoBaseUrl + regId + '-large.jpg',
        });
        return rp(opts)
          .then((body) => {
              return "image/jpeg;base64," + new Buffer(body).toString('base64');
          })
          .catch((err) => {
            throw err;
          });
    }
}

function IDCardFormatError() {
   this.message = "Invalid Card Number";
   this.statusCode = 400;
   this.toString = function() {
      return this.message;
   };
}