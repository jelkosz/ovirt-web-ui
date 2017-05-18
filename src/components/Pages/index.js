import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import VmDetail from '../VmDetail'
import VmDialog from '../VmDialog/index'
import { selectVmDetail, selectPoolDetail } from '../../actions/index'

class VmDetailPage extends React.Component {
  componentWillMount () {
    this.props.getVms({ vmId: this.props.match.params.id })
  }

  render () {
    let { match, vms } = this.props
    if (vms.getIn(['vms', match.params.id])) {
      return (<VmDetail vm={vms.getIn(['vms', match.params.id])} />)
    }
    return null
  }
}

VmDetailPage.propTypes = {
  vms: PropTypes.object.isRequired,
  getVms: PropTypes.func.isRequired,
  route: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

class PoolDetailPage extends React.Component {
  componentWillMount () {
    this.props.getPools({ poolId: this.props.match.params.id })
  }
  render () {
    let { match, vms } = this.props
    if (vms.getIn(['pools', match.params.id, 'vm'])) {
      return (<VmDetail vm={vms.getIn(['pools', match.params.id, 'vm'])} pool={vms.getIn(['pools', match.params.id])} isPool />)
    }
    return null
  }
}

PoolDetailPage.propTypes = {
  vms: PropTypes.object.isRequired,
  getPools: PropTypes.func.isRequired,
  route: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

class VmDialogPage extends React.Component {
  componentWillMount () {
    if (this.props.match.params.id) {
      this.props.getVms({ vmId: this.props.match.params.id })
    }
  }

  render () {
    let { match, vms } = this.props
    if ((match.params.id && vms.getIn(['vms', match.params.id])) || !match.params.id) {
      return (<VmDialog vm={vms.getIn(['vms', match.params.id])} />)
    }
    return null
  }
}

VmDialogPage.propTypes = {
  vms: PropTypes.object.isRequired,
  getVms: PropTypes.func.isRequired,
  route: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

const VmDetailPageConnected = connect(
  (state) => ({
    vms: state.vms,
  }),
  (dispatch) => ({
    getVms: ({ vmId }) => dispatch(selectVmDetail({ vmId })),
  })
)(VmDetailPage)

const PoolDetailPageConnected = connect(
  (state) => ({
    vms: state.vms,
  }),
  (dispatch) => ({
    getPools: ({ poolId }) => dispatch(selectPoolDetail({ poolId })),
  })
)(PoolDetailPage)

const VmDialogPageConnected = connect(
  (state) => ({
    vms: state.vms,
  }),
  (dispatch) => ({
    getVms: ({ vmId }) => dispatch(selectVmDetail({ vmId })),
  })
)(VmDialogPage)

export {
  PoolDetailPageConnected as PoolDetailPage,
  VmDetailPageConnected as VmDetailPage,
  VmDialogPageConnected as VmDialogPage,
}
