import { stripIndent } from 'common-tags'

const makeFooter = ({ submitButtonPosition='right', submitButtonText }) => {
  if (submitButtonPosition !== 'hidden') {
    return (
      stripIndent`
        <footer
          class="
            content-horizontal-${ submitButtonPosition }
            content-vertical-center
          "
        >
          <button type="submit" form="page-form">
            ${ submitButtonText }
          </button>
        </footer>
      `
    )
  } else {
    return ''
  }
}

const makeOptionRow = ({ label, coding }, { name, required=true }, widget) => {
  if (widget === 'radio') {
    return (
      stripIndent`
        <tr>
          <td>
            <input
              type="radio"
              name="${ name }"
              value="${ coding }"
              id="${ name }-${ coding }"
              ${ required ? 'required' : '' }
            >
          </td>
          <td>
            <label for="${ name }-${ coding }">
              ${ label }
            </label
          </td>
        </tr>
      `
    )
  } else if (widget === 'checkbox') {
    return (
      stripIndent`
        <tr>
          <td>
            <input
              type="checkbox"
              name="${ name }-${ coding }"
              id="${ name }-${ coding }"
              ${ required ? 'required' : '' }
            >
          </td>
          <td>
            <label for="${ name }-${ coding }">
              ${ label }
            </label
          </td>
        </tr>
      `
    )
  }
}

export const makePage = (items, options) =>
  stripIndent`
    <main
      class="
        content-horizontal-center
        content-vertical-center
      "
    >
      <div class="w-100 w-m text-left">
        <form id="page-form" style="display: block;">
          ${ items.map(processItem).join('\n') }
        </form>
      </div>
    </main>
    ${ makeFooter(options) }
  `

export const processItem = i => {
  switch (i.type) {
    case 'text':
      return (
        stripIndent`
          <div class="page-item page-item-text">
            <h3>${ i.title || '' }</h3>
            ${ i.content || '' }
          </div>
        `
      )
    case 'divider':
      return (
        stripIndent`
          <div class="page-item page-item-divider">
            <hr>
          </div>
        `
      )
    case 'input':
      return (
        stripIndent`
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${ i.label || '' }
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${ i.help || '' }
          </p>
          <input name="${ i.name }"
            ${ i.required ? 'required' : '' }
            class="w-100"
            ${ i.attributes && i.attributes.type ? `type="${ i.attributes.type }"` : '' }
          >
        `
      )
    case 'textarea':
      return (
        stripIndent`
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${ i.label || '' }
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${ i.help || '' }
          </p>
          <textarea name="${ i.name }"
            ${ i.required ? 'required' : '' }
            class="w-100"
            rows="3"
          ></textarea>
        `
      )
    case 'radio':
      return (
        stripIndent`
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${ i.label || '' }
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${ i.help || '' }
          </p>
          <table class="table-plain page-item-table">
            <colgroup>
              <col style="width: 7.5%">
              <col style="width: 92.5%">
            </colgroup>
            <tbody>
              ${ (i.options || []).map(o => makeOptionRow(o, i, 'radio')).join('\n') }
            </tbody>
          </table>
        `
      )
    case 'checkbox':
      return (
        stripIndent`
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${ i.label || '' }
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${ i.help || '' }
          </p>
          <table class="table-plain page-item-table">
            <colgroup>
              <col style="width: 7.5%">
              <col style="width: 92.5%">
            </colgroup>
            <tbody>
              ${ (i.options || []).map(o => makeOptionRow(o, i, 'checkbox')).join('\n') }
            </tbody>
          </table>
        `
      )
    default:
      console.error('Unknown page item type', i.type)
  }
}
