import { useEffect, useState } from "react"

import type { Directory } from "~/libs/InMemoryFS"
import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"

export function Diff() {
  const [loading, setLoading] = useState(false)
  const [diff, setDiff] = useState<Directory>()

  const acceptDiff = useStoreState().editor.sketchId !== null

  useEffect(() => {
    if (!acceptDiff) return

    const handle = async () => {
      setLoading(true)

      try {
        setDiff(await fs.getdiff())
      } catch (err) {
        console.log(err)
      }

      setLoading(false)
    }

    fs.events.on("write", handle)
    fs.events.on("unlink", handle)

    return () => {
      fs.events.off("write", handle)
      fs.events.off("unlink", handle)
    }
  }, [acceptDiff])

  return (
    <div className="w-full h-full">
      {JSON.stringify(
        {
          loading,
          diff,
          acceptDiff
        },
        null,
        2
      )}
    </div>
  )
}
