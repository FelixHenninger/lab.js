import { stripIndent } from 'common-tags'

import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

// Bulk CSS property management ------------------------------------------------

const setGlobalCSSProperties = (properties: Record<string, string>) => {
  for (const [property, value] of Object.entries(properties)) {
    document.documentElement.style.setProperty(property, value)
  }
}

const getGlobalCSSProperties = (keys: string[]) => {
  const computedStyles = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    keys.map(k => [k, computedStyles.getPropertyValue(k)]),
  )
}

// Transition management -------------------------------------------------------

const insertStyles = () => {
  if (!document.querySelector('style#labjs-styleplugin')) {
    const s = document.createElement('style')
    s.id = 'labjs-styleplugin'
    s.innerHTML = stripIndent`
      .labjs-styleplugin-transition {
        transition-property: color, background-color, border-color;
        transition-duration: 1s;
      }
    `
    document.head.appendChild(s)
  }
}

const addClass = (elems: Element[]) => {
  elems.forEach(elem => elem.classList.add('labjs-styleplugin-transition'))
}
const removeClass = (elems: Element[]) => {
  elems.forEach(elem => elem.classList.remove('labjs-styleplugin-transition'))
}
const handleTransition = (elems: Element[]) => {
  addClass(elems)
  document.documentElement.addEventListener(
    'transitionend',
    () => removeClass(elems),
    { once: true },
  )
}

// Plugin proper ---------------------------------------------------------------

export default class Style implements Plugin {
  properties: Record<string, string>
  backup: Record<string, string>
  transition: boolean
  reverse: boolean
  transitionSelector = 'body, body > .container, header, main, footer'

  constructor({ properties = {}, reverse = true, transition = true } = {}) {
    this.properties = properties
    this.backup = {}
    this.transition = transition
    this.reverse = reverse
  }

  async handle(_: Component, event: string) {
    if (event === 'prepare' && this.transition) {
      insertStyles()
    } else if (event === 'run') {
      if (this.transition) {
        handleTransition([
          document.documentElement,
          ...Array.from(document.querySelectorAll(this.transitionSelector)),
        ])
      }
      this.backup = getGlobalCSSProperties(Object.keys(this.properties))
      setGlobalCSSProperties(this.properties)
    } else if (event === 'end' && this.reverse) {
      if (this.transition) {
        handleTransition([
          document.documentElement,
          ...Array.from(document.querySelectorAll(this.transitionSelector)),
        ])
      }
      setGlobalCSSProperties(this.backup)
    } else if (event === 'lock') {
      this.backup = {}
    }
  }
}
