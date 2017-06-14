import config from '../config.json';
import rp from 'request-promise';

export default {
    get: (magstrip, rfid) => {
        let options = {
            uri: config.idcardBaseUrl +  "?mag_strip_code=" + magstrip + "&prox_rfid=" + rfid,
            headers: {
                "Authorization": "Bearer " + config.idcardToken
            },
            json: true
        };
        rp(options)
          .then((parsedBody => {
            console.log(parsedBody)
          }))
          .catch((err) => {

          })
        return { "idcard": "idcard" };
    }
}