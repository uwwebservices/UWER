import saml from 'passport-saml';
export default new saml.Strategy(
	{
		callbackUrl: 'https://idcard-poc-staging.herokuapp.com/login/callback',
		entryPoint: 'https://idp.u.washington.edu/idp/profile/SAML2/Redirect/SSO',
		issuer: 'http://ccan.cac.washington.edu/idcard',
		identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
	},
	function(profile, done) {
		return done(null, {
			UWNetID: profile.nameID,
			DisplayName: profile["urn:oid:2.16.840.1.113730.3.1.241"]
		})
});