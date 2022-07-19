import isEmail from "validator/lib/isEmail"

export function validator<T extends string>(
  data: Record<T, string>,
  rules: Record<T, (v: string) => void | string>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = {} as any

  // eslint-disable-next-line functional/no-let
  let passed = true
  for (const key in rules) {
    const rule = rules[key]
    // eslint-disable-next-line functional/immutable-data
    errors[key] = rule(data[key]) ?? null

    if (errors[key]) passed = false
  }

  return {
    passed,
    errors: errors as Record<T, string | null>
  }
}

export function createRuleEmail() {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return "The email is required"

    if (!isEmail(v)) return "Please enter a valid email address"
  }
}
export function createRulePassword() {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return "The password is required"
  }
}
export function createRuleLength(min: number, max: number, name: string) {
  return (v: string) => {
    v = v.trim()
    if (v.length === 0) return `The ${name} is required`

    if (v.length < min) return `The ${name} required minimum ${min} characters`

    if (v.length > max) return `The ${name} limit ${max} characters`
  }
}
