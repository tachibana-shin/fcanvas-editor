import CloseIcon from "@mui/icons-material/Close"
import Snackbar from "@mui/material/Snackbar"
import { createContext, useCallback, useContext, useState } from "react"
import { TransitionGroup } from "react-transition-group"

interface ToastOption {
  id: number
  message: string
}

const ToastContext = createContext(
  undefined as unknown as {
    addToast: (message: string) => void
    removeToast: (id: number) => void
  }
)

function Toast(props: ToastOption) {
  const { removeToast } = useToast()
  const { id, message } = props
  const [open, setOpen] = useState(true)

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => {
        setOpen(false)
        removeToast(id)
      }}
      color="dark"
      message={message}
      action={
        <CloseIcon
          fontSize="small"
          onClick={() => {
            setOpen(false)
            removeToast(id)
          }}
        />
      }
      disableWindowBlurListener
    />
  )
}

const ToastContainer = ({ toasts }: { toasts: ToastOption[] }) => {
  return (
    <TransitionGroup>
      {toasts.map((item) => {
        return <Toast key={item.id} id={item.id} message={item.message} />
      })}
    </TransitionGroup>
  )
}

// eslint-disable-next-line functional/no-let
let id = 1

export const ToastProvider = ({ children }: { children: JSX.Element }) => {
  const [toasts, setToasts] = useState<ToastOption[]>([])

  const addToast = useCallback(
    (message: string) => {
      setToasts((toasts): ToastOption[] => {
        return [
          ...toasts,
          {
            id: id++,
            message
          }
        ]
      })
    },
    [setToasts]
  )

  const removeToast = useCallback(
    (id: number) => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id))
    },
    [setToasts]
  )

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <ToastContainer toasts={toasts} />
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const toastHelpers = useContext(ToastContext)
  return toastHelpers
}
