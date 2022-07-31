import { Layer, Rect, Stage } from "fcanvas"

const stage = new Stage({
  container: "app"
})

const layer = new Layer()
stage.add(layer)

const rect = new Rect({
  x: 0,
  y: 0,
  width: 200,
  height: 150,
  stroke: "#000"
})
layer.add(rect)
