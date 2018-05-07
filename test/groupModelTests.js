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
        var myAdminsArray = [{ "id": "admin1", "type": "dns" }, { "id": "admin2", "type": "dns" }];

        var mygroup = createNewGroupModel(myId, myDisplayName, myDescription, myAdmins);

        it('New group should have an id', () => {
            mygroup.data.should.have.property('id', myId);
        });

        it('New group should have a displayName', () => {
            mygroup.data.should.have.property('displayName', myDisplayName);
        });

        it('New group should have a description', () => {
            mygroup.data.should.have.property('description', myDescription);
        });

        it('New group should have an admins array', () => {
            mygroup.data.should.have.property('admins', myAdminsArray);
            mygroup.data.admins[0].should.have.property('id', myAdminsArray[0].id);
            mygroup.data.admins[0].should.have.property('type', "dns");
        });

        it('New group admins arrary should have the right number of items', () => {
            mygroup.data.should.have.property('admins').with.lengthOf(2);
        });
    });
});
