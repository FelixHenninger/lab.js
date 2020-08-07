import React from 'react'

import { Field, useFormikContext } from 'formik'
import { FormGroup, Label, Col, InputGroup } from 'reactstrap'

import Hint from '../../../../../Hint'
import { Input } from '../../../../../Form'
import { integerOrPlaceholder } from '../../../Behavior/components/Timeline/util'

const switchLabels = ({
  templateParameters={ rows: [] },
  sample={ n: undefined }
}, labels) => {
  const samples = parseInt(sample.n)
  const parameters = templateParameters.rows.length

  if (samples < parameters) {
    return labels[0]
  } else if (isNaN(samples) || samples === parameters) {
    return labels[1]
  } else {
    return labels[2]
  }
}

export default () => {
  const { values } = useFormikContext()

  return <FormGroup row>
    <Label xs={ 2 } for="sampleN">
      Sample
      <Hint
        title="Sampling"
        className="float-right"
        placement="left"
      >
        <p className="font-weight-bold">
          Control how many, and which of the above parameter sets are used.
        </p>
        <p className="text-muted">
          The <strong>sample size</strong> defines the number of loop iterations. The <strong>mode</strong> determines how the iterations are drawn from the entries above.
        </p>
        <dl className="text-muted">
          <dt>Sequential</dt>
          <dd>Proceed in order, starting from the top. If more samples are requested than entries are available, start over.</dd>

          <dt>Random order</dt>
          <dd>Present entries in shuffled order<br /> (only available without sampling).</dd>

          <dt>Sample without replacement</dt>
          <dd>Draw entries at random, starting over when all are exhausted. Shuffles the result for a completely random order.</dd>

          <dt>Sample w/o replacement (in blocks)</dt>
          <dd>As above, but without shuffling.<br /> If the number of samples exceeds the number of entries, this results in blocks of all entries in random order.</dd>

          <dt>Sample with replacement</dt>
          <dd>Draw entries without regard to which have been selected before.</dd>
        </dl>
      </Hint>
    </Label>
    <Col xs={10}>
      <InputGroup>
        <Field
          name="sample.n"
          component={ Input }
          pattern={ integerOrPlaceholder }
          placeholder={
            (values.sample || {}).mode === 'draw-replace'
              ? 'As many as rows above'
              : 'Use all'
          }
          className="text-monospace"
        />
        <Field
          name={ 'sample.mode' }
          as="select"
          className="form-control custom-select text-monospace"
        >
          <option value="sequential">
            In sequence
          </option>
          <option value="draw-shuffle">
            {
              switchLabels(values, [
                'Sampled without replacement',
                'In random order',
                'Sampled without replacement (then shuffled)'
              ])
            }
          </option>
          <option value="draw">
            Sampled without replacement (in blocks)
          </option>
          <option value="draw-replace">
            Sampled with replacement
          </option>
        </Field>
      </InputGroup>
    </Col>
  </FormGroup>
}
