import React, { Component } from 'react';
import ConfirmModal from 'Components/ConfirmModal';
import FA from 'react-fontawesome';

import Button from '@material-ui/core/Button';

export default class Configure extends Component {
    constructor(props) {
        super(props);
    }
    csvify = groupName => {
      let filePath = `/api/csv/${groupName}.csv`;
      var link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
      link.click();
    }
    gws = groupName => {
      console.log("GOING TO", groupName)
      window.open(`https://groups.uw.edu/group/${groupName}`, "_blank")
    }
    render() {
      let groupName = this.props.groupName;
      let SelectButton = groupName === this.props.selectedGroup ? (
        <span>
          <Button color="primary" variant="raised" onClick={() => this.gws(this.props.groupName)}><FA name="group" />&nbsp;GWS</Button>
          <ConfirmModal buttonText="Delete" confirmCallback={() => this.props.deleteCallback(this.props.groupName)} dialogContent={`This will delete the leaf group and all members, are you sure you want to delete ${groupName}?`} dialogTitle={`Delete ${groupName}?`} />
          <Button color="primary" variant="raised" onClick={() => this.csvify(groupName)}>
          <FA name="file-excel-o" />&nbsp;
          CSV
          </Button>
        </span>
      ) : (
        <Button color="default" variant="raised" onClick={() => this.props.updateGroupName(groupName)}><FA name="check" />&nbsp;Select</Button>
      );
      return (
        <div className="subgroupItem">
          <div className="subgroupName">{groupName}</div>
          <div className="subgroupButtons">
            {SelectButton}
            
          </div>
        </div>
      )
    }
}