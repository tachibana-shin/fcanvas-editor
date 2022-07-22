import ReactDOM from "react-dom/client"

import "virtual:windi.css"
import "virtual:windi-devtools"

import { App } from "./App"
import "./main.scss"
import { ToastProvider } from "./plugins/toast"
import { darkTheme } from "./themes"

// eslint-disable-next-line import/order
import { BrowserRouter } from "react-router-dom"
// eslint-disable-next-line import/order
import { StrictMode } from "react"

// eslint-disable-next-line import/order
import ThemeProvider from "@mui/material/styles/ThemeProvider"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
