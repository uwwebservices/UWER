import React, { Component } from 'react';
import ConfirmModal from 'Components/ConfirmModal';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FA from 'react-fontawesome';
import Button from '@material-ui/core/Button';
import ContentModal from 'Components/ContentModal';

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { deleting: false, closeTooltips: null }
    }
    csvify = groupName => {
      let filePath = `/api/csv/${groupName}.csv`;
      var link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
      link.click();
    }
    gws = groupName => {
      window.open(`https://groups.uw.edu/group/${groupName}`, "_blank")
    }
    deleteSubgroup = async subgroup => {
      this.setState({deleting: true});
      await this.props.deleteCallback(subgroup.id);
    }
    render() {
      let groupName = this.props.subgroup.id;
      let SelectButton = groupName === this.props.selectedGroup ? (
        <span>
          <Button color="primary" variant="raised" onClick={() => this.gws(groupName)} disabled={this.state.deleting}>
            <FA name="group" />&nbsp;GWS
          </Button>
          <ConfirmModal openButtonText={this.state.deleting ? "Deleting" : "Delete"}
            openButtonIcon={this.state.deleting ? "spinner" : "remove"}
            confirmCallback={() => this.deleteSubgroup(this.props.subgroup)} 
            dialogContent={`This will delete the leaf group and all members, are you sure you want to delete ${groupName}?`} 
            dialogTitle={`Delete ${groupName}?`}
            openButtonDisabled={this.state.deleting}
            openButtonIconSpin={this.state.deleting}
          />
          <Button color="primary" variant="raised" disabled={this.state.deleting} onClick={() => this.csvify(this.props.subgroup.id)}>
            <FA name="file-excel-o" />&nbsp;
            CSV
          </Button>
        </span>
      ) : (
        <Button color="default" variant="raised" onClick={() => this.props.updateGroupName(this.props.subgroup.id)}><FA name="check" />&nbsp;Select</Button>
      );
      return (
        <div className={groupName === this.props.selectedGroup ? "subgroupItem selected" : "subgroupItem"}>
            <div className="subgroupName">{this.props.displayGroupName(groupName)} 
              {this.props.private && 
                <Tooltip
                  title="Private Group - Member list hidden"
                  placement="top"
                  onClose={this.handleTooltipClose}
                >
                  <span className="subgroupPrivate">
                    <FA name="lock" />
                  </span>                  
                </Tooltip>
              } 
              {this.props.email && 
                <span className="subgroupPrivate">
                  <ContentModal 
                    openWithIcon={true} 
                    dialogTitle="Group Email" 
                    showCancelButton={false} 
                    approveButtonColor="default" 
                    approveButtonText="Close" 
                    openButtonIcon="envelope-o"
                    iconButtonTitle="Group Email Enabled"
                  >
                    <div>{this.props.email}</div>
                  </ContentModal>
                </span>
              }             
            </div>
            <div className="subgroupButtons">
              {SelectButton}
            </div>
        </div>
      )
    }
}