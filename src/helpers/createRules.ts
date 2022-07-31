import isEmail from "validator/lib/isEmail"

export function createRuleEmail() {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return "The email is required"

    if (!isEmail(v)) return "Please enter a valid email address"

    return true
  }
}
export function createRulePassword() {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return "The password is required"

    return true
  }
}
export function createRuleLength(min: number, max: number, name: string) {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return `The ${name} is required`

    if (v.length < min) return `The ${name} required minimum ${min} characters`

    if (v.length > max) return `The ${name} limit ${max} characters`

    return true
  }
}
