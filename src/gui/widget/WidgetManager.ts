import { Container } from "pixi.js"
import { App } from "../../App"
import { ChartManager } from "../../chart/ChartManager"
import { ErrorHistrogramWidget as ErrorHistogramWidget } from "./ErrorHistogramWidget"
import { NoteLayoutWidget } from "./NoteLayoutWidget"
import { Widget } from "./Widget"

export class WidgetManager extends Container {
  app: App
  chartManager: ChartManager
  children: Widget[] = []

  constructor(chartManager: ChartManager) {
    super()
    this.app = chartManager.app
    this.chartManager = chartManager
    this.addChild(new NoteLayoutWidget(this))
    this.addChild(new ErrorHistogramWidget(this))
    this.zIndex = 2
  }

  update() {
    this.x = this.app.renderer.screen.width / 2
    this.y = this.app.renderer.screen.height / 2
    this.children.forEach(child => child.update())
  }

  startPlay() {
    this.children.forEach(child => child.startPlay())
  }

  endPlay() {
    this.children.forEach(child => child.endPlay())
  }
}
