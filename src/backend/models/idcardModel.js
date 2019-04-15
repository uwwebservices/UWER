import request from 'request';
import rp from 'request-promise';
import fs from 'fs';
import DefaultUser from 'Assets/defaultUser';
import { API } from '../routes';

const CERTIFICATEFILE = process.env.CERTIFICATEFILE;
const PASSPHRASEFILE = process.env.PASSPHRASEFILE;
const IDCARDBASEURL = process.env.IDCARDBASEURL;
const PHOTOBASEURL = process.env.PHOTOBASEURL;

const DefaultUserBuffer = new Buffer(
  DefaultUser.replace('data:image/jpeg;base64,',''),
  'base64'
);

const options = {
  method: 'GET',
  url: '',
  agentOptions: {
    pfx: fs.readFileSync(CERTIFICATEFILE),
    passphrase: fs.readFileSync(PASSPHRASEFILE, { encoding: 'utf8' }).toString(),
    securityOptions: 'SSL_OP_NO_SSLv3',
    simple: false,
    resolveWithFullResponse: true
  },
  json: true
};

const IDCard = {
  ValidCard(cardnum) {
    let card = { magstrip: '', rfid: '' };
    if (cardnum.length === 16) {
      if (cardnum[0] !== ';') {
        card.rfid = cardnum;
      } else if (cardnum[0] === ';') {
        card.magstrip = cardnum.slice(1, 14);
      } else {
        return false;
      }
    } else if (cardnum.length === 14) {
      card.magstrip = cardnum;
    } else {
      return false;
    }
    // make sure we didn't catch a 14/16 character netid and treat it as a card
    if (!isNaN(parseInt(card.magstrip)) || !isNaN(parseInt(card.rfid))) {
      return card;
    } else {
      return false;
    }
  },
  async Get(card) {
    let opts = Object.assign({}, options, {
      url: `${IDCARDBASEURL}?mag_strip_code=${card.magstrip}&prox_rfid=${card.rfid}`
    });
    try {
      let res = await rp(opts);

      // Not doing anything with this info yet, but catching the difference
      if (res.Current.MagStripCode === card.magstrip.toString() || res.Current.ProxRFID === card.rfid.toString()) {
        //console.log("NO REDIRECT");
      } else {
        //console.log("REDIRECTED")
      }
      return res.Cards[0].RegID;
    } catch (ex) {
      console.log('GetCard Error', ex);
      return '';
    }
  },
  async GetManyPhotos(groupName, memberList) {
    for (let mem of memberList) {
      mem.Base64Image = await this.GetOnePhoto(groupName, mem.UWRegID);
    }
    return memberList;
  },
  async GetOnePhoto(groupName, uwRegID) {
    return 'api' + API.GetMemberPhoto
      .replace(':group', groupName)
      .replace(':identifier', uwRegID);
  },
  async GetPhoto(regid) {
    let opts = Object.assign({}, options, {
      url: `${PHOTOBASEURL}/${regid}-large.jpg`,
      encoding: null
    });

    try {
      let res = await rp(opts);
      return new Buffer.from(res);
    } catch (ex) {
      console.log(`Error fetching photo: ${ex}`);
      return DefaultUserBuffer;
    }
  }
};

export default IDCard;
