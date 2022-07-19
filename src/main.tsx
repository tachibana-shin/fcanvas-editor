import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"

import "virtual:windi.css"
import "virtual:windi-devtools"

import { App } from "./App"
import "./main.scss"
import { darkTheme } from "./theme"
import { store } from "./store"

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
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
