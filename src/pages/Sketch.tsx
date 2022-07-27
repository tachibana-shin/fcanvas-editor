import "./Index.scss"

import { doc, getDoc, getFirestore } from "@firebase/firestore"
import { Icon } from "@iconify/react"
import type { editor } from "monaco-editor"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"

import { EditorFile } from "~/components/sketch/EditorFile"
import { Preview } from "~/components/sketch/Preview"
import { SideBar } from "~/components/sketch/SideBar"
import { ToolBar } from "~/components/sketch/ToolBar"
import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"
import sketchDefault from "~/templates/sketch-default"
import { useCreateSketch } from "~/useActions/editor-actions"

export function Sketch() {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()
  const params = useParams()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const createSketch = useCreateSketch()

  useEffect(() => {
    const db = getFirestore(app)

    if (params.userId && params.sketchId) {
      const docRef = doc(
        db,
        "users",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.userId!,
        "sketches",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.sketchId!
      )
      // eslint-disable-next-line promise/catch-or-return
      getDoc(docRef)
        // eslint-disable-next-line promise/always-return
        .then((snap) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { fs: template, name } = snap.data()!

          createSketch({
            id: snap.id,
            name,
            template
          })
        })
        .catch(() => {
          addToast("Sketch not found")
        })
        .finally(() => setLoading(false))
    } else {
      createSketch({
        template: sketchDefault
      })

      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="absolute w-full h-full flex items-center justify-center text-sm">
        <div className="text-center">
          <Icon icon="line-md:loading-loop" className="w-45px h-45px" />
          <br />
          Fetching Sketch...
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <ToolBar />

      <div className="flex h-full">
        <SideBar editorRef={editorRef} />

        <div className="flex relative w-full flex-1">
          <div className="w-full h-full flex">
            <EditorFile editorRef={editorRef} />
            <Preview editorRef={editorRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
