import React from 'react'
import PropTypes from 'prop-types'

import { Button, ButtonToolbar } from 'react-bootstrap'

import style from './style.css'

const Confirmation = ({ okButton, cancelButton, extraButton, text, height, uniqueId }) => {
  const idPrefix = `confirmation-${uniqueId || ''}`
  let extra = null
  if (extraButton) {
    extra = (
      <Button id={`${idPrefix}-button-extra1`} bsSize='xsmall' className={`${style['confirmation-extra-button']} button-l`} bsStyle='info' onClick={extraButton.click}>
        {extraButton.label}
      </Button>
    )
  }
  let s = {}
  if (height) {
    s['height'] = height
  }
  return (
    <span className={style['confirmation-body']} style={s} id={`${idPrefix}-body`}>
      {typeof text === 'string'
        ? (
          <p className={style['confirmation-text']}>
            {text}
          </p>)
          : text }
      <ButtonToolbar className={style['confirmation-toolbar']}>
        <Button bsSize='xsmall' className={`button-l ${style['ok-button']}`} bsStyle='info' onClick={okButton.click} id={`${idPrefix}-button-ok`}>
          {okButton.label}
        </Button>
        <Button bsSize='xsmall' onClick={cancelButton.click} id={`${idPrefix}-button-cancel`}>
          {cancelButton.label}
        </Button>
        {extra}
      </ButtonToolbar>
    </span>)
}

Confirmation.propTypes = {
  okButton: PropTypes.object.isRequired,
  cancelButton: PropTypes.object.isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  height: PropTypes.number,
  extraButton: PropTypes.object,
  uniqueId: PropTypes.string,
}

export default Confirmation
