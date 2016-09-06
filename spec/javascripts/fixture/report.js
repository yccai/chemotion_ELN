const settings = [  {text: "formula", checked: true},
                  {text: "material", checked: true},
                  {text: "description", checked: true},
                  {text: "purification", checked: true},
                  {text: "tlc", checked: true},
                  {text: "observation", checked: true},
                  {text: "analysis", checked: true},
                  {text: "literature", checked: true} ]

const originalState = {
  settings: settings,
  configs: [ {text: "Page Break", checked: true} ],
  checkedAllSettings: true,
  checkedAllConfigs: true,
  processingReport: false
}

export { originalState, settings }
