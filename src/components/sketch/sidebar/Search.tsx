import LinearProgress from "@mui/material/LinearProgress"
import { useState } from "react"

export function Search() {
  const [loading, setLoading] = useState(false)

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
    </div>
  )
}
