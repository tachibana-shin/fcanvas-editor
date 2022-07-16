import { render } from "preact"

import { App } from "./App"
import "virtual:windi.css"
import "virtual:windi-devtools"

import "./main.scss"

// eslint-disable-next-line no-undef
render(<App />, document.getElementById("app") as HTMLElement)
