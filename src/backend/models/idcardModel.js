import request from 'request';
import rp from 'request-promise';
import fs from 'fs';
import configurator from 'utils/configurator';
let config = configurator.get();

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

const IDCard = {
    ValidCard: cardnum => {
        let card = { magstrip: "", rfid: "" };
        if(cardnum.length === 16) {
            if(cardnum[0] !== ';') {
                card.rfid = cardnum;
            } else if(cardnum[0] === ';') {
                card.magstrip = cardnum.slice(1,14);
            } else {
                return false;
            }
        } else if(cardnum.length === 14) {
            card.magstrip = cardnum;
        } else {
            return false;
        }
        return card;
    },
    Get: async card => {
        let opts = Object.assign({}, options, { 
            url: `${config.idcardBaseUrl}?mag_strip_code=${card.magstrip}&prox_rfid=${card.rfid}`,
        });
        try {
            let res = await rp(opts);
            return res.Cards[0].RegID;
        } catch(ex) {
            console.log("GetCard Error", ex);
            return "";
        }
    },
    GetManyPhotos: async memberList => {
        let promises = [];
        for(let mem of memberList) {
            promises.push(IDCard.GetPhoto(mem.UWRegID).then((img) => {
                mem.Base64Image = img;
                return mem;
            }));
        }
        return await Promise.all(promises);
    },
    GetPhoto: regId => {
        let opts = Object.assign({}, options, { 
            url: `${config.photoBaseUrl}/${regId}-large.jpg`,
            encoding: null
        });
        return new Promise(function(resolve, reject) {
            // Have to use request instead of request-promise as we need a buffer to convert to base64
            request.get(opts, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
                    resolve(data);
                } else {
                    reject(new IDCardFormatError("Photo not found", 404));
                }
            });
        });
    }
}

export default IDCard;

function IDCardFormatError(message, code = 400) {
   this.message = message;
   this.statusCode = code;
   this.toString = function() {
      return this.message;
   };
}