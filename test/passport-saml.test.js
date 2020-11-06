import { ExpansionPanelActions } from '@material-ui/core';
import { Strategy } from 'passport-saml';

describe('passport-saml tests', () => {
    var saml, req, options;

    beforeEach(function() {
       
    });

    it('should display "google" text on page', async () => {
        const strat = new Strategy({
            callbackUrl: "",
            entryPoint: "",
            issuer: "",
            identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
            privateKey: ""
        },
        function(profile, done) {
            return done(null, {
                UWNetID: profile['urn:oid:0.9.2342.19200300.100.1.1'] || profile.nameID,
                DisplayName: profile['urn:oid:2.16.840.1.113730.3.1.241']
              });
        });

        expect(strat.name).toBe('saml');
    });
});