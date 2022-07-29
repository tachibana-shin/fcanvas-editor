import type { DiffReturn } from "@tachibana-shin/diff-object"
import { v4 } from "uuid"

import { InMemoryFS } from "./InMemoryFS"

import DiffObjectWorker from "~/workers/diff-object?worker"

export class InMemoryFSWatch extends InMemoryFS {
  private diffObjectWorker?: Worker

  async getdiff() {
    // eslint-disable-next-line functional/no-throw-statement
    if (!this.backupMemory) throw new Error("Backup memory not found")

    if (!this.diffObjectWorker) this.diffObjectWorker = new DiffObjectWorker()

    const uid = v4()

    return new Promise<DiffReturn<false>>((resolve) => {
      const handle = ({
        data
      }: MessageEvent<{
        id: string
        diff: DiffReturn<false>
      }>) => {
        if (uid === data.id) resolve(data.diff)

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.diffObjectWorker!.removeEventListener("message", handle)
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.diffObjectWorker!.addEventListener("message", handle)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.diffObjectWorker!.postMessage({
        id: uid,

        oldMemory: this.backupMemory,
        newMemory: this.memory
      })
    })
  }
}
