import should from 'should';
import assert from 'assert';
import config from 'config/config.json';


describe('Array', () => {
    describe('#BackendConfigTests()', () => {
        it('config should have certificate', () => {
            config.should.have.property('certificate');
        });
        it('config should have uwca', () => {
            config.should.have.property('uwca');
        });
        it('config should have passphrase', () => {
            config.should.have.property('passphrase');
        });
        it('config should have idcardBaseUrl', () => {
            config.should.have.property('idcardBaseUrl');
        });
        it('config should have pwsBaseUrl', () => {
            config.should.have.property('pwsBaseUrl');
        });
        it('config should have photoBaseUrl', () => {
            config.should.have.property('photoBaseUrl');
        });
        it('config should have groupsBaseUrl', () => {
            config.should.have.property('groupsBaseUrl');
        });
        it('config should have groupsSearchUrl', () => {
            config.should.have.property('groupsSearchUrl');
        });
        it('config should have IdPCallbackUrl', () => {
            config.should.have.property('IdPCallbackUrl');
        });
        it('config should have IdPEntryPoint', () => {
            config.should.have.property('IdPEntryPoint');
        });
        it('config should have IdPIssuer', () => {
            config.should.have.property('IdPIssuer');
        });
        it('config should have groupAdmins', () => {
            config.should.have.property('groupAdmins');
        });
        it('config should have groupDisplayName', () => {
            config.should.have.property('groupDisplayName');
        });
        it('config should have groupDescription', () => {
            config.should.have.property('groupDescription');
        });
        it('config should have groupNameBase', () => {
            config.should.have.property('groupNameBase');
        });
        it('config should have groupNameLeaf', () => {
            config.should.have.property('groupNameLeaf');
        });
    });
});