import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"

import "virtual:windi.css"
import "virtual:windi-devtools"

import { App } from "./App"
import "./main.scss"
import { store } from "./store"

// eslint-disable-next-line import/order
import { BrowserRouter } from "react-router-dom"
// eslint-disable-next-line import/order
import { StrictMode } from "react"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
