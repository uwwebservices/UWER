//@ts-check
import { Certificate, IDCardWebService } from 'ews-api-lib';
import { API } from '../routes';
import DefaultUser from 'Assets/defaultUser';

const baseUrl = process.env.IDCARDBASEURL;

const DefaultUserBuffer = new Buffer.from(DefaultUser.replace('data:image/jpeg;base64,', ''), 'base64');

const IDCard = {
  async Setup(certificate) {
    IDCardWebService.Setup(certificate, baseUrl);
  },

  /**
   * Do some basic checking to see if the present card is valid
   * @param cardnum magstrip or rfid value to validate
   * @returns boolean
   */
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

  /**
   * Gets a regid from a valid card magstrip/rfid
   * @param card An object with magstrip and rfid strings
   * @returns UWRegID
   */
  async Get(card) {
    return await IDCardWebService.GetRegID(card.magstrip, card.rfid);
  },

  /**
   * Get user photo from RegID
   * @param regid The user's regid
   * @returns A buffer of a user's photo or the default user buffer
   */
  async GetPhoto(regid) {
    const photo = await IDCardWebService.GetPhoto(regid);
    return photo !== null ? photo : DefaultUserBuffer;
  },

  /**
   * Get photos for a list of members
   * @param groupName the groupname the user is a member of
   * @param membersList The members to get photos for
   * @returns List of members with photos added
   */
  async GetManyPhotos(groupName, memberList) {
    for (let mem of memberList) {
      mem.Base64Image = await this.GetOnePhoto(groupName, mem.UWRegID);
    }
    return memberList;
  },

  /**
   * Generate a url to proxy a photo
   * @param groupName The short group name
   * @param uwRegId The user to generate a photo for
   * @returns boolean
   */
  async GetOnePhoto(groupName, uwRegID) {
    return 'api' + API.GetMemberPhoto.replace(':group', groupName).replace(':identifier', uwRegID);
  }
};

export default IDCard;
