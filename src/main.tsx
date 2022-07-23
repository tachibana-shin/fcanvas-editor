// eslint-disable-next-line import/order
import ReactDOM from "react-dom/client"

import "virtual:windi.css"
import "virtual:windi-devtools"

import { Provider } from "react-redux"

import { App } from "./App"
import "./main.scss"
import { ToastProvider } from "./plugins/toast"
import { store } from "./stores"
import { darkTheme } from "./themes"

// eslint-disable-next-line import/order
import { BrowserRouter } from "react-router-dom"
// eslint-disable-next-line import/order
import { StrictMode } from "react"

// eslint-disable-next-line import/order
import ThemeProvider from "@mui/material/styles/ThemeProvider"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={darkTheme}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
