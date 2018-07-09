import request from 'request';
import rp from 'request-promise';
import fs from 'fs';
import DefaultUser from 'Assets/defaultUser';
import config from 'config/config.json';

const options = {
    method: 'GET',
    url: "",
    agentOptions: {
        pfx: fs.readFileSync(config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3',
        simple: false,
        resolveWithFullResponse: true 
    },
    json: true
};

const IDCard = {
    ValidCard(cardnum) {
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
        // make sure we didn't catch a 14/16 character netid and treat it as a card
        if(!isNaN(parseInt(card.magstrip)) || !isNaN(parseInt(card.rfid))) {
           return card; 
        } else {
            return false;
        }
        
    },
    async Get(card) {
        let opts = Object.assign({}, options, { 
            url: `${config.idcardBaseUrl}?mag_strip_code=${card.magstrip}&prox_rfid=${card.rfid}`,
        });
        try {
            let res = await rp(opts);
            
            // Not doing anything with this info yet, but catching the difference
            if(res.Current.MagStripCode === card.magstrip.toString() || res.Current.ProxRFID === card.rfid.toString()) {
                console.log("NO REDIRECT");
            } else {
                console.log("REDIRECTED")
            }
            return res.Cards[0].RegID;
        } catch(ex) {
            console.log("GetCard Error", ex);
            return "";
        }
    },
    async GetManyPhotos(memberList) {
        let promises = [];
        for(let mem of memberList) {
            promises.push(this.GetPhoto(mem.UWRegID).then((img) => {
                mem.Base64Image = img;
                return mem;
            }));
        }
        return await Promise.all(promises);
    },
    async GetPhoto(regid) {
        let opts = Object.assign({}, options, { 
            url: `${config.photoBaseUrl}/${regid}-large.jpg`,
            encoding: null
        });
        try {
            let res = await rp(opts);
            return `data:image/jpeg;base64,${new Buffer.from(res).toString('base64')}`;
        } catch(ex) {
            return DefaultUser;
        }
    }
}

export default IDCard;