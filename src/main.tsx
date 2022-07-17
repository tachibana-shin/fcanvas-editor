import { render } from "preact"
import { Provider } from "react-redux"

import "virtual:windi.css"
import "virtual:windi-devtools"

import { App } from "./App"
import "./main.scss"
import { store } from "./store"

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app") as HTMLElement
)
