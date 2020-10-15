import React, { Component } from 'react';
import ConfirmModal from 'Components/ConfirmModal';
import Tooltip from '@material-ui/core/Tooltip';
import FA from 'react-fontawesome';
import Button from '@material-ui/core/Button';
import ContentModal from 'Components/ContentModal';

export default class Configure extends Component {
  constructor(props) {
    super(props);
    this.state = { deleting: false, open: false, emailTooltipText: 'Group Email Copied' };
  }
  groupEmailCopied = copiedText => {
    this.setState({ open: true });
    setTimeout(() => {
      this.setState({ open: false });
    }, 2000);
  };
  csvify = groupName => {
    window.open(`/api/csv/${groupName}.csv`);
  };
  gws = gwsUrl => {
    window.open(gwsUrl, '_blank');
  };
  deleteSubgroup = async subgroup => {
    this.setState({ deleting: true });
    await this.props.deleteCallback(subgroup);
  };
  render() {
    let subgroup = this.props.subgroup;
    let groupName = subgroup.name;
    let SelectButton =
      groupName === this.props.selectedGroup ? (
        <span>
          <Button color="primary" variant="contained" onClick={() => this.gws(subgroup.url)} disabled={this.state.deleting}>
            <FA name="group" />
            &nbsp;GWS
          </Button>
          <ConfirmModal
            openButtonText={this.state.deleting ? 'Deleting' : 'Delete'}
            openButtonIcon={this.state.deleting ? 'spinner' : 'remove'}
            confirmCallback={() => this.deleteSubgroup(groupName)}
            dialogContent={`This will delete the leaf group and all members, are you sure you want to delete ${groupName}?`}
            dialogTitle={`Delete ${groupName}?`}
            openButtonDisabled={this.state.deleting}
            openButtonIconSpin={this.state.deleting}
          />
          <Button color="primary" variant="contained" disabled={this.state.deleting} onClick={() => this.csvify(groupName)}>
            <FA name="file-excel-o" />
            &nbsp; CSV
          </Button>
        </span>
      ) : (
        <Button color="default" variant="contained" onClick={() => this.props.updateGroupName(groupName)}>
          <FA name="check" />
          &nbsp;Select
        </Button>
      );
    return (
      <div className={groupName === this.props.selectedGroup ? 'subgroupItem selected' : 'subgroupItem'}>
        <div className="subgroupName">
          {subgroup.display}
          {subgroup.private && (
            <Tooltip title="Private Group - Member list hidden" placement="top" onClose={this.handleTooltipClose}>
              <span className="subgroupPrivate">
                <FA name="lock" />
              </span>
            </Tooltip>
          )}
          {subgroup.email && (
            <span className="subgroupPrivate">
              <ContentModal openWithIcon={true} dialogTitle="Group Email" showCancelButton={false} approveButtonColor="default" approveButtonText="Close" openButtonIcon="envelope-o" iconButtonTitle="Group Email Enabled">
                <div>{subgroup.email}</div>
              </ContentModal>
            </span>
          )}
        </div>
        <div className="subgroupButtons">{SelectButton}</div>
      </div>
    );
  }
}
