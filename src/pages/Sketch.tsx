import "./Index.scss"

import { doc, getDoc, getFirestore } from "@firebase/firestore"
import type { editor } from "monaco-editor"
import gen from "project-name-generator"
import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { useParams } from "react-router"

import { EditorFile } from "~/components/sketch/EditorFile"
import { Preview } from "~/components/sketch/Preview"
import { SideBar } from "~/components/sketch/SideBar"
import { ToolBar } from "~/components/sketch/ToolBar"
import { app } from "~/modules/firebase"
import { fs } from "~/modules/fs"
import { useToast } from "~/plugins/toast"
import sketchDefault from "~/templates/sketch-default"

export function Sketch() {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()
  const params = useParams()
  const dispatch = useDispatch()
  const { addToast } = useToast()

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
      getDoc(docRef)
        // eslint-disable-next-line promise/always-return
        .then((snap) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { fs: fsFile, name } = snap.data()!

          fs.fromFDBObject(fsFile)

          dispatch({
            type: "editor/setSketchName",
            payload: name
          })
          fs.createbatch(app, snap.id)
        })
        .catch(() => {
          addToast("Sketch not found")
        })
    } else {
      fs.fromFDBObject(sketchDefault)

      dispatch({
        type: "editor/setSketchName",
        payload: gen({
          words: 2
        }).spaced
      })

      addToast("Created sketch from template default")
    }
  }, [])

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
