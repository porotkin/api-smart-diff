import { DiffPath } from "./types"

export const typeOf = (value: any) => {
  if (Array.isArray(value)) {
    return "array"
  }
  return typeof value == null ? "null" : typeof value
}

export const resolveObjValue = (obj: any, path: string) => {
  let value = obj
  for (const key of parsePath(path)) {
    value = typeOf(value) === "array" ? value[+key] : value[key]
    if (value === undefined) {
      break
    }
  }
  return value
}

export const parsePath = (path: string): string[] => {
  const [_, ...pathArr] = path.split("/")
  return pathArr
}

export const buildPath = (path: DiffPath): string => {
  return "/" + path.join("/")
}

export const findExternalRefs = (source: any | any[]): string[] => {
  if (typeof source !== "object") {
    return []
  }
  let refs: Set<string> = new Set()
  if (typeOf(source) === "array") {
    for (const item of source) {
      if (typeof item === "object") {
        refs = new Set([...refs, ...findExternalRefs(item)])
      }
    }
  } else {
    for (const key of Object.keys(source)) {
      if (key === "$ref") {
        const [external] = source[key].split("#")
        refs.add(external)
      } else {
        if (typeof source[key] === "object") {
          refs = new Set([...refs, ...findExternalRefs(source[key])])
        }
      }
    }
  }
  return [...refs]
}