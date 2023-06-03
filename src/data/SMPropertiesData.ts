import { App } from "../App"
import { Simfile } from "../chart/sm/Simfile"
import { SimfileProperty } from "../chart/sm/SimfileTypes"
import { Icons } from "../gui/Icons"
import { NumberSpinner } from "../gui/element/NumberSpinner"
import { DirectoryWindow } from "../gui/window/DirectoryWindow"
import { ActionHistory } from "../util/ActionHistory"
import { FileHandler } from "../util/FileHandler"
import { AUDIO_EXT, IMG_EXT } from "./FileData"

type SMPropertyGroupData = {
  title: string
  items: SMPropertyData[]
}

type SMPropertyCustomInput = {
  type: "custom"
  create: (app: App, sm?: Simfile) => HTMLElement
}
type SMPropertyStringInput = {
  type: "string"
}
type SMPropertyFileInput = {
  type: "file"
  typeName: string
  accept: string[]
}
type SMPropertyNumberInput = {
  type: "number"
  step?: number
  precision?: number
  min?: number
  max?: number
}

type SMPropertyInput =
  | SMPropertyStringInput
  | SMPropertyFileInput
  | SMPropertyNumberInput
  | SMPropertyCustomInput

type SMPropertyData = {
  title: string
  propName: SimfileProperty
  input: SMPropertyInput
}

export const SM_PROPERTIES_DATA: SMPropertyGroupData[] = [
  {
    title: "Metadata",
    items: [
      {
        title: "Title",
        propName: "TITLE",
        input: {
          type: "string",
        },
      },
      {
        title: "Subtitle",
        propName: "SUBTITLE",
        input: {
          type: "string",
        },
      },
      {
        title: "Artist",
        propName: "ARTIST",
        input: {
          type: "string",
        },
      },
      {
        title: "Credit",
        propName: "CREDIT",
        input: {
          type: "string",
        },
      },
      {
        title: "Genre",
        propName: "GENRE",
        input: {
          type: "string",
        },
      },
      {
        title: "Origin",
        propName: "ORIGIN",
        input: {
          type: "string",
        },
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Audio Track",
        propName: "MUSIC",
        input: { type: "file", typeName: "audio", accept: AUDIO_EXT },
      },
      {
        title: "Background Image",
        propName: "BACKGROUND",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
      {
        title: "Banner Image",
        propName: "BANNER",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
      {
        title: "CD Title",
        propName: "CDTITLE",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
      {
        title: "CD Image",
        propName: "CDIMAGE",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
      {
        title: "Jacket",
        propName: "JACKET",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
      {
        title: "Disc Image",
        propName: "DISCIMAGE",
        input: { type: "file", typeName: "image", accept: IMG_EXT },
      },
    ],
  },
  {
    title: "Song",
    items: [
      {
        title: "Song Preview",
        propName: "SAMPLESTART",
        input: {
          type: "custom",
          create: (app, sm) => {
            const updateValues = () => {
              if (toSpinner.value < fromSpinner.value) {
                toSpinner.setValue(fromSpinner.value)
              }
              const lastStart =
                (sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART ?? "0"
              const lastLength =
                (sm ?? app.chartManager.loadedSM!).properties.SAMPLELENGTH ??
                "10"
              const newStart = fromSpinner.value.toString()
              const newLength = (toSpinner.value - fromSpinner.value).toString()
              ActionHistory.instance.run({
                action: app => {
                  ;(sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART =
                    newStart
                  ;(sm ?? app.chartManager.loadedSM!).properties.SAMPLELENGTH =
                    newLength
                  fromSpinner.setValue(parseFloat(newStart))
                  toSpinner.setValue(
                    parseFloat(newStart) + parseFloat(newLength)
                  )
                },
                undo: () => {
                  ;(sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART =
                    lastStart
                  ;(sm ?? app.chartManager.loadedSM!).properties.SAMPLELENGTH =
                    lastLength
                  fromSpinner.setValue(parseFloat(lastStart))
                  toSpinner.setValue(
                    parseFloat(lastStart) + parseFloat(lastLength)
                  )
                },
              })
            }
            const fromSpinner = NumberSpinner.create(
              parseFloat(
                (sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART ?? "0"
              ),
              undefined,
              3,
              0
            )
            fromSpinner.onChange = value => {
              if (value === undefined) {
                fromSpinner.setValue(
                  parseFloat(
                    (sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART ??
                      "0"
                  )
                )
                return
              }
              updateValues()
            }
            const toSpinner = NumberSpinner.create(
              parseFloat(
                (sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART ?? "0"
              ) +
                parseFloat(
                  (sm ?? app.chartManager.loadedSM!).properties.SAMPLELENGTH ??
                    "10"
                ),
              undefined,
              3,
              0
            )
            toSpinner.onChange = value => {
              if (value === undefined) {
                toSpinner.setValue(
                  parseFloat(
                    (sm ?? app.chartManager.loadedSM!).properties.SAMPLESTART ??
                      "0"
                  ) +
                    parseFloat(
                      (sm ?? app.chartManager.loadedSM!).properties
                        .SAMPLELENGTH ?? "10"
                    )
                )
                return
              }
              updateValues()
            }

            const container = document.createElement("div")
            const to = document.createElement("div")
            to.innerText = "to"
            container.classList.add("flex-row", "flex-column-gap")
            container.replaceChildren(fromSpinner.view, to, toSpinner.view)
            return container
          },
        },
      },
    ],
  },
]

export function createInputElement(
  app: App,
  data: SMPropertyData,
  sm?: Simfile
) {
  switch (data.input.type) {
    case "custom":
      return data.input.create(app, sm)
    case "string": {
      const input = document.createElement("input")
      input.type = "text"
      input.autocomplete = "off"
      input.spellcheck = false
      input.onkeydown = ev => {
        if (ev.key == "Enter") input.blur()
      }
      input.onblur = () => {
        const lastValue = (sm ?? app.chartManager.loadedSM!).properties[
          data.propName
        ]
        const newValue = input.value
        ActionHistory.instance.run({
          action: app => {
            ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
              newValue
            input.value = newValue
          },
          undo: () => {
            ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
              lastValue
            input.value = lastValue ?? ""
          },
        })
      }
      input.value =
        (sm ?? app.chartManager.loadedSM!).properties[data.propName] ?? ""
      return input
    }
    case "number": {
      const inputData = data.input
      const spinner = NumberSpinner.create(
        parseFloat(
          (sm ?? app.chartManager.loadedSM!).properties[data.propName]!
        ) ?? 15,
        inputData.step,
        inputData.precision,
        inputData.min,
        inputData.max
      )
      spinner.onChange = value => {
        if (value === undefined) {
          spinner.setValue(
            parseFloat(
              (sm ?? app.chartManager.loadedSM!).properties[data.propName] ??
                "0"
            )
          )
          return
        }
        const lastValue = (sm ?? app.chartManager.loadedSM!).properties[
          data.propName
        ]
        const newValue = value.toString()
        ActionHistory.instance.run({
          action: app => {
            ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
              newValue
            spinner.setValue(parseFloat(newValue))
          },
          undo: () => {
            ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
              lastValue
            spinner.setValue(parseFloat(lastValue ?? "0"))
          },
        })
      }
      return spinner.view
    }
    case "file": {
      const inputData = data.input
      const container = document.createElement("div")
      container.classList.add("flex-row", "flex-column-gap")
      const input = document.createElement("input")
      input.type = "text"
      input.autocomplete = "off"
      input.spellcheck = false
      input.placeholder = "click to select a file"
      input.onclick = ev => {
        ev.preventDefault()
        input.blur()
        const dir = app.chartManager.smPath.split("/").slice(0, -1).join("/")
        if (window.nw) {
          const fileSelector = document.createElement("input")
          fileSelector.type = "file"
          fileSelector.accept = inputData.accept.join(",")
          fileSelector.onchange = () => {
            const newValue = FileHandler.getRelativePath(
              dir,
              fileSelector.value
            )
            const lastValue =
              (sm ?? app.chartManager.loadedSM!).properties[data.propName] ?? ""
            ActionHistory.instance.run({
              action: app => {
                ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
                  newValue
                input.value = newValue
              },
              undo: () => {
                ;(sm ?? app.chartManager.loadedSM!).properties[data.propName] =
                  lastValue
                input.value = lastValue
              },
            })
          }
          fileSelector.click()
        } else {
          app.windowManager.openWindow(
            new DirectoryWindow(
              app,
              {
                title: `Select a${
                  inputData.typeName.match(/^[aieouAIEOU].*/) ? "n" : ""
                } ${inputData.typeName} file...`,
                accepted_file_types: inputData.accept,
                disableClose: true,
                callback: (path: string) => {
                  const newValue = FileHandler.getRelativePath(dir, path)
                  const lastValue =
                    (sm ?? app.chartManager.loadedSM!).properties[
                      data.propName
                    ] ?? ""
                  ActionHistory.instance.run({
                    action: app => {
                      ;(sm ?? app.chartManager.loadedSM!).properties[
                        data.propName
                      ] = newValue
                      input.value = newValue
                    },
                    undo: () => {
                      ;(sm ?? app.chartManager.loadedSM!).properties[
                        data.propName
                      ] = lastValue
                      input.value = lastValue
                    },
                  })
                },
              },
              (sm ?? app.chartManager.loadedSM!).properties[data.propName]
                ? dir +
                  "/" +
                  (sm ?? app.chartManager.loadedSM!).properties[data.propName]
                : app.chartManager.smPath
            )
          )
        }
      }
      input.value =
        (sm ?? app.chartManager.loadedSM!).properties[data.propName] ?? ""
      container.appendChild(input)
      const deleteButton = document.createElement("button")
      deleteButton.style.height = "100%"
      deleteButton.classList.add("delete")
      deleteButton.disabled = true
      deleteButton.onclick = () => {
        input.value = ""
        deleteButton.disabled = true
      }
      const icon = document.createElement("img")
      icon.classList.add("icon")
      icon.style.height = "12px"
      icon.src = Icons.TRASH
      deleteButton.appendChild(icon)
      container.appendChild(deleteButton)
      return container
    }
  }
}
