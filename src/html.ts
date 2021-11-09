// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

// Special cases:
// 1. <noop> is an element that is not printed out, can be used to create a list of elements
// 2. Attribute name '__' gets transformed to ':' for namespace emulation
// 3. Emulate CDATA by <cdata> element

import { hArgumentParser } from "./h.js"
import { escapeHTML } from "./encoding.js"

export const SELF_CLOSING_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "command",
]

export const CDATA = (s: string) => "<![CDATA[" + s + "]]>"
export const HTML = (s: string) => s

// export function prependXMLIdentifier(s) {
//   return '<?xml version="1.0" encoding="utf-8"?>\n' + s
// }

// https://reactjs.org/docs/jsx-in-depth.html
export function markup(
  xmlMode: boolean,
  tag: string,
  attrs: any = {},
  children?: any[]
) {
  const hasChildren = children && children.length > 0

  let parts: string[] = []
  tag = tag.replace(/__/g, ":")

  // React fragment <>...</> and ours: <noop>...</noop>
  if (tag !== "noop" && tag !== "") {
    if (tag !== "cdata") {
      parts.push(`<${tag}`)
    } else {
      parts.push("<![CDATA[")
    }

    // Add attributes
    for (let name in attrs) {
      if (name && attrs.hasOwnProperty(name)) {
        let v = attrs[name]
        if (name === "html") {
          continue
        }
        if (name.toLowerCase() === "classname") {
          name = "class"
        }
        name = name.replace(/__/g, ":")
        if (v === true) {
          // s.push( ` ${name}="${name}"`)
          parts.push(` ${name}`)
        } else if (name === "style" && typeof v === "object") {
          parts.push(
            ` ${name}="${Object.keys(v)
              .filter((k) => v[k] != null)
              .map((k) => {
                let vv = v[k]
                vv = typeof vv === "number" ? vv + "px" : vv
                return `${k
                  .replace(/([a-z])([A-Z])/g, "$1-$2")
                  .toLowerCase()}:${vv}`
              })
              .join(";")}"`
          )
        } else if (v !== false && v != null) {
          parts.push(` ${name}="${escapeHTML(v.toString())}"`)
        }
      }
    }
    if (tag !== "cdata") {
      if (xmlMode && !hasChildren) {
        parts.push(" />")
        return parts.join("")
      } else {
        parts.push(">")
      }
    }

    if (!xmlMode && SELF_CLOSING_TAGS.includes(tag)) {
      return parts.join("")
    }
  }

  // Append children
  if (children && children.length > 0) {
    for (let child of children) {
      if (child != null && child !== false) {
        if (!Array.isArray(child)) {
          child = [child]
        }
        for (let c of child) {
          if (c.startsWith("<") || tag === "script" || tag === "style") {
            parts.push(c)
          } else {
            parts.push(escapeHTML(c.toString()))
          }
        }
      }
    }
  }

  if (attrs.html) {
    parts.push(attrs.html)
  }

  if (tag !== "noop") {
    if (tag !== "cdata") {
      parts.push(`</${tag}>`)
    } else {
      parts.push("]]>")
    }
  }
  return parts.join("")
}

export function html(itag: string, iattrs?: object, ...ichildren: any[]) {
  let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren)
  return markup(false, tag, attrs, children)
}

html.firstLine = "<!DOCTYPE html>"
html.html = true

export let h = html
