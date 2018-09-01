import React from 'react'
import { Table } from 'reactstrap'

import Card from '../../Card'
import { FileTableBody, FileTableColGroup } from '../../FileTable'

export default ({ id, data }) =>
  <Card title="Files" wrapContent={ false }>
    <Table className="grid border-top-0">
      <FileTableColGroup />
      <FileTableBody />
    </Table>
  </Card>
