import { createNewGroupModel, generateGroupName } from 'models/groupModel';
import should from 'should';
import assert from 'assert';

describe('Array', function () {
    describe('#BackendCreateNewGroupModelTests()', () => {
        //Create a test group and verify its properties
        var myId = 'Test Group ID';
        var myDisplayName = 'Test Group Display Name';
        var myDescription = 'This group is for unit tests';
        var myAdmins = ['admin1', 'admin2'];
        var myAdminsArray = [{ "id": "admin1" }, { "id": "admin2" }];

        var mygroup = createNewGroupModel(myId, myDisplayName, myDescription, myAdmins);

        it('New group should have an id', () => {
            mygroup.should.have.property('id', myId);
        });

        it('New group should have a displayName', () => {
            mygroup.should.have.property('displayName', myDisplayName);
        });

        it('New group should have a description', () => {
            mygroup.should.have.property('description', myDescription);
        });

        it('New group should have an admins array', () => {
            mygroup.should.have.property('admins', myAdminsArray);
        });

        it('New group admins arrary should have the right number of items', () => {
            mygroup.should.have.property('admins').with.lengthOf(2);
        });
    });
});
