// (C)opyright 2021-07-20 Dirk Holtwick, holtwick.it. All rights reserved.

import type { VNodeQuery } from './vdom'
import { VDocumentFragment } from './vdom'

export function removeBodyContainer(body: VNodeQuery): VNodeQuery {
  const ehead = body.querySelector('head')
  const ebody = body.querySelector('body')
  if (ebody || ehead) {
    const body = new VDocumentFragment()
    ehead && body.appendChild(ehead.childNodes)
    ebody && body.appendChild(ebody.children)
    return body
  }
  return body
}

const object = {}
const hasOwnProperty = object.hasOwnProperty

/** Fallback for Object.hasOwn */
export function hasOwn(object: any, propertyName: string) {
  return hasOwnProperty.call(object, propertyName)
}
