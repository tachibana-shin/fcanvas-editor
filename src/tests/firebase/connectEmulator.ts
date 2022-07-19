export function connectEmulator<T>(
  t: T,
  fn: (t: T, url: string) => void,
  port: number
) {
  fn(
    t,
    `https://${port}-${process.env.GITPOD_WORKSPACE_ID}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`
  )
}
