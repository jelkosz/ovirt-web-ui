import React from 'react';
import classNames from 'classnames';

import {selectText} from './index';

// Displays text that is not expected to fit within its container. Also adds an onClick handler that selects the text.
export const Overflow = ({className, value}) => <div className={classNames('co-m-overflow', className)}>
  <input className="co-m-invisible-input co-m-overflow__input" value={value || '-'} readOnly spellCheck="false" onClick={selectText} />
  <div className="co-m-overflow__gradient"></div>
</div>;