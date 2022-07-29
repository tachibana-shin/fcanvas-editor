import Input from "@mui/material/Input"
import LinearProgress from "@mui/material/LinearProgress"
import { useState } from "react"

import { search } from "./logic/search"
window.search = search
export function Search() {
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [replace, setReplace] = useState("")
  const [include, setInclude] = useState("")
  const [exclude, setExclude] = useState("")

  return (
    <div className="w-full">
      {loading && (
        <div className="w-100 absolute top-0 left-0">
          <LinearProgress
            color="inherit"
            sx={{
              height: 2
            }}
          />
        </div>
      )}

      <Input size="small" />
    </div>
  )
}
