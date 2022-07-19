import CloseIcon from "@mui/icons-material/Close"
import { Snackbar } from "@mui/material"
import { useState } from "react"

export function createSnackbar() {
  interface Message {
    type: "error" | "success"
    message: string
  }

  const [messageSnackbar, setMessageSnackbar] = useState<Message | null>(null)
  const openSnackbar = (message: Message) => {
    setMessageSnackbar(message)
  }
  const closeSnackbar = () => {
    setMessageSnackbar(null)
  }

  const snackbar = (
    <Snackbar
      open={messageSnackbar !== null}
      autoHideDuration={3000}
      onClose={closeSnackbar}
      color="dark"
      message={messageSnackbar?.message}
      action={<CloseIcon fontSize="small" onClick={closeSnackbar} />}
    />
  )

  return {
    openSnackbar,
    closeSnackbar,
    snackbar
  }
}
