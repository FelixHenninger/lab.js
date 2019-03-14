import React from 'react'

import { Table } from 'reactstrap'

import Group from './Group'
import Icon from '../../../../../Icon'

export default ({ groups, moveHandler, globalShuffle }) => {
  const nextGroup = Math.max(
    ...Object.keys(groups)
      .map(Number)
      .filter(x => !isNaN(x)),
    0
  ) + 1

  const entries = Object.entries(groups)

  return (
    <Table className="border-top-0">
      <tbody>
        {/* Default group */}
        <Group
          title={ globalShuffle ? "Default" : "Not shuffled" }
          groupId={ undefined }
          key={ -1 }
          columns={ groups['undefined'] }
          move={ moveHandler }
          children={
            entries.length > 0
              ? undefined
              : <small className="text-muted font-italic">
                  (no columns yet)
                </small>
          }
        />
        {/* Actual shuffled groups */}
        {
          entries
            .filter(([group]) => group !== 'undefined')
            .map(([group, columns]) =>
              <Group
                groupId={ group }
                key={ group }
                columns={ columns }
                move={ moveHandler }
              />
          )
        }
        {/* Empty group */}
        <Group
          groupId={ nextGroup }
          key={ nextGroup }
          move={ moveHandler }
        >
          <small className="text-muted">
            <span
              className="text-right d-inline d-lg-inline-block"
              style={{ width: '45%' }}
            >
              Drag columns into rows
            </span>
            <Icon icon="ellipsis-v" className="text-muted m-2" />
            <span
              className="text-left d-inline d-lg-inline-block"
              style={{ width: '45%' }}
            >
              to create independently shuffled groups
            </span>
          </small>
        </Group>
      </tbody>
    </Table>
  )
}
