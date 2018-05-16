import React, { Component } from 'react';
import ConfirmModal from 'Components/ConfirmModal';
import FA from 'react-fontawesome';

import { Button } from 'material-ui';

export default class Configure extends Component {
    constructor(props) {
        super(props);
    }
    csvify = (groupName) => {
      console.log("CSVING", groupName)
    }
    render() {
      let groupName = this.props.groupName;
      return (
        <div>
          {groupName} 
          <ConfirmModal buttonText="Delete" confirmCallback={() => this.props.deleteCallback(this.props.groupName)} dialogContent={`This will delete the leaf group and all members, are you sure you want to delete ${groupName}?`} dialogTitle={`Delete ${groupName}?`} />
          <Button color="primary" variant="raised" onClick={() => this.csvify(groupName)}>
          <FA name="file-excel-o" />&nbsp;
          CSV
          </Button>
        </div>
      )
    }
}