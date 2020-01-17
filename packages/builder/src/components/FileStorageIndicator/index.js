import React from 'react'
import { connect } from 'react-redux'

import { Progress } from 'reactstrap'

import { sizeFromDataURI } from '../../logic/util/dataURI'

const StorageLevel = ({ space }) =>
  <Progress
    value={ space }
    max={ 50 * 1024 }
    style={{
      height: '25px',
    }}
  >
    <span className="pl-2">
      { (space / 1024).toFixed(1) } / 50 MB
    </span>
  </Progress>

const mapStateToProps = (state) => ({
  space: Object.entries(state.files.files)
    .reduce((acc, [, { content }]) => acc + sizeFromDataURI(content), 0)
})

export default connect(mapStateToProps)(StorageLevel)
