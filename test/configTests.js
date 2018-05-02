
import configurator from '../src/backend/config/configurator';
let config = configurator.get();

var should = require('should');
var assert = require('assert');

describe('Array', function () {
    describe('#BackendConfigTests()', function () {
        it('config should have certificate', function () {
            config.should.have.property('certificate');
        });
        it('config should have passphrase', function () {
            config.should.have.property('passphrase');
        });
        it('config should have idcardBaseUrl', function () {
            config.should.have.property('idcardBaseUrl');
        });
        it('config should have pwsBaseUrl', function () {
            config.should.have.property('pwsBaseUrl');
        });
        it('config should have photoBaseUrl', function () {
            config.should.have.property('photoBaseUrl');
        });
        it('config should have groupsBaseUrl', function () {
            config.should.have.property('groupsBaseUrl');
        });
        it('config should have groupsSearchUrl', function () {
            config.should.have.property('groupsSearchUrl');
        });
        it('config should have storeInGroupsWS', function () {
            config.should.have.property('storeInGroupsWS');
        });
        it('config should have groupAdmins', function () {
            config.should.have.property('groupAdmins');
        });
        it('config should have groupDisplayName', function () {
            config.should.have.property('groupDisplayName');
        });
        it('config should have groupDescription', function () {
            config.should.have.property('groupDescription');
        });
        it('config should have groupNameBase', function () {
            config.should.have.property('groupNameBase');
        });
        it('config should have groupNameLeaf', function () {
            config.should.have.property('groupNameLeaf');
        });
        it('config should have enableRegisterAPI', function () {
            config.should.have.property('enableRegisterAPI');
        });
        it('config should have enableGroupsAPI', function () {
            config.should.have.property('enableGroupsAPI');
        });
        it('config should have enablePWSAPI', function () {
            config.should.have.property('enablePWSAPI');
        });
        it('config should have enableIDCardAPI', function () {
            config.should.have.property('enableIDCardAPI');
        });        

        it('config should have enableConfigAPI', function () {
            config.should.have.property('enableConfigAPI');
        });
    });
});



