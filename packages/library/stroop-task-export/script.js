// Define study
const study = lab.core.deserialize({
  "title": "root",
  "type": "lab.flow.Sequence",
  "plugins": [
    {
      "type": "metadata",
      "path": "lab.plugins.Metadata"
    },
    {
      "type": "lab.plugins.Debug",
    },
    {
      "type": "lab.plugins.Download",
      "filePrefix": "stroop-task",
      "path": undefined
    }
  ],
  "parameters": {},
  "files": {},
  "responses": {},
  "hooks": {},
  "content": [
    {
      "type": "lab.html.Screen",
      "responses": {
        "keypress(Space)": "continue"
      },
      "title": "Instruction",
      "content": "\u003Cheader class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Ch1\u003EStroop Task\u003C\u002Fh1\u003E\n\u003C\u002Fheader\u003E\n\u003Cmain\u003E\n  \u003Cp\u003E\n    Welcome to the \u003Cstrong\u003EStroop experiment\u003C\u002Fstrong\u003E!\n  \u003C\u002Fp\u003E\n  \u003Cp\u003E\n    In this experiment, your task will be to \n    \u003Cstrong\u003Eidentify the color of the word shown \n    on the screen\u003C\u002Fstrong\u003E.\u003Cbr\u003E\n    The word itself is immaterial &mdash; \n    you can safely ignore it.\n  \u003C\u002Fp\u003E\n  \u003Cp\u003E\n    To indicate the color of the word, \n    please use the keys \u003Cstrong\u003Er\u003C\u002Fstrong\u003E, \n    \u003Cstrong\u003Eg\u003C\u002Fstrong\u003E, \u003Cstrong\u003Eb\u003C\u002Fstrong\u003E and \n    \u003Cstrong\u003Eo\u003C\u002Fstrong\u003E for \n    \u003Cspan style=\"color: red;\"\u003Ered\u003C\u002Fspan\u003E, \n    \u003Cspan style=\"color: green;\"\u003Egreen\u003C\u002Fspan\u003E, \n    \u003Cspan style=\"color: blue;\"\u003Eblue\u003C\u002Fspan\u003E and \n    \u003Cspan style=\"color: orange;\"\u003Eorange\u003C\u002Fspan\u003E, \n    respectively.\u003Cbr\u003E\n    Please answer quickly, and as \n    accurately as you can.\n  \u003C\u002Fp\u003E\n\u003C\u002Fmain\u003E\n\u003Cfooter class=\"content-vertical-center content-horizontal-center\"\u003E\n  Please press the space bar when you're ready.\n\u003C\u002Ffooter\u003E\n",
      "parameters": {},
      "files": {},
      "hooks": {}
    },
    {
      "type": "lab.canvas.Frame",
      "context": "\u003Cmain class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Ccanvas \u002F\u003E\n\u003C\u002Fmain\u003E\n\n\u003Cfooter class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Cp\u003E\n    What's the \u003Cem\u003Ecolor\u003C\u002Fem\u003E of \n    the word shown above? \u003Cbr\u003E\n    Please press \u003Ckbd\u003Er\u003C\u002Fkbd\u003E for red,\n    \u003Ckbd\u003Eg\u003C\u002Fkbd\u003E for green,\n    \u003Ckbd\u003Eb\u003C\u002Fkbd\u003E for blue and \u003Ckbd\u003Eo\u003C\u002Fkbd\u003E for orange.\n  \u003C\u002Fp\u003E\n\u003C\u002Ffooter\u003E\n",
      "contextSelector": "canvas",
      "files": {},
      "parameters": {},
      "responses": {
        "": ""
      },
      "title": "Practice frame",
      "hooks": {},
      "content": [
        {
          "type": "lab.flow.Loop",
          "responses": {
            "": ""
          },
          "templateParameters": [
            {
              "color": "red",
              "word": "red",
              "phase": "practice"
            },
            {
              "color": "green",
              "word": "green",
              "phase": "practice"
            },
            {
              "color": "blue",
              "word": "blue",
              "phase": "practice"
            },
            {
              "color": "orange",
              "word": "orange",
              "phase": "practice"
            }
          ],
          "title": "Practice task",
          "parameters": {},
          "files": {},
          "sample": {
            "mode": "draw-shuffle"
          },
          "hooks": {},
          "shuffleGroups": [],
          "template": [
            {
              "type": "lab.flow.Sequence",
              "responses": {
                "": ""
              },
              "title": "Trial",
              "parameters": {},
              "files": {},
              "hooks": {},
              "content": [
                {
                  "type": "lab.canvas.Screen",
                  "content": [
                    {
                      "type": "i-text",
                      "left": 0,
                      "top": 0,
                      "angle": 0,
                      "width": 18.69,
                      "height": 36.16,
                      "stroke": null,
                      "strokeWidth": 1,
                      "fill": "black",
                      "text": "+",
                      "fontStyle": "normal",
                      "fontWeight": "normal",
                      "fontSize": "72",
                      "fontFamily": "sans-serif",
                      "lineHeight": 1.16,
                      "textAlign": "center"
                    }
                  ],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "": ""
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Fixation cross",
                  "timeout": "500",
                  "hooks": {}
                },
                {
                  "type": "lab.canvas.Screen",
                  "content": [
                    {
                      "type": "i-text",
                      "left": 0,
                      "top": 0,
                      "angle": 0,
                      "width": 331.08,
                      "height": 36.16,
                      "stroke": null,
                      "strokeWidth": 1,
                      "fill": "${ this.parameters.color }",
                      "text": "${ this.parameters.word }",
                      "fontStyle": "normal",
                      "fontWeight": "bold",
                      "fontSize": "72",
                      "fontFamily": "sans-serif",
                      "lineHeight": 1.16,
                      "textAlign": "center"
                    }
                  ],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "keydown(r)": "red",
                    "keydown(g)": "green",
                    "keydown(b)": "blue",
                    "keydown(o)": "orange"
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Stroop screen",
                  "correctResponse": "${ this.parameters.color }",
                  "hooks": {}
                },
                {
                  "type": "lab.canvas.Screen",
                  "content": [],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "": ""
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Inter-trial interval",
                  "timeout": "500",
                  "hooks": {}
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "lab.canvas.Frame",
      "context": "\u003Cmain class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Ccanvas \u002F\u003E\n\u003C\u002Fmain\u003E\n\n\u003Cfooter class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Cp\u003E\n    What's the \u003Cem\u003Ecolor\u003C\u002Fem\u003E of \n    the word shown above? \u003Cbr\u003E\n    Please press \u003Ckbd\u003Er\u003C\u002Fkbd\u003E for red,\n    \u003Ckbd\u003Eg\u003C\u002Fkbd\u003E for green,\n    \u003Ckbd\u003Eb\u003C\u002Fkbd\u003E for blue and \u003Ckbd\u003Eo\u003C\u002Fkbd\u003E for orange.\n  \u003C\u002Fp\u003E\n\u003C\u002Ffooter\u003E\n",
      "contextSelector": "canvas",
      "files": {},
      "parameters": {},
      "responses": {
        "": ""
      },
      "title": "Task frame",
      "hooks": {},
      "content": [
        {
          "type": "lab.flow.Loop",
          "responses": {
            "": ""
          },
          "templateParameters": [
            {
              "color": "red",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "red",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "red",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "red",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "red",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "red",
              "word": "orange",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "green",
              "word": "orange",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "blue",
              "word": "orange",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "red",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "green",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "blue",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "orange",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "orange",
              "phase": "task"
            },
            {
              "color": "orange",
              "word": "orange",
              "phase": "task"
            }
          ],
          "title": "Stroop task",
          "parameters": {},
          "files": {},
          "sample": {
            "mode": "draw-shuffle"
          },
          "hooks": {},
          "shuffleGroups": [],
          "template": [
            {
              "type": "lab.flow.Sequence",
              "responses": {
                "": ""
              },
              "title": "Trial",
              "parameters": {},
              "files": {},
              "hooks": {},
              "content": [
                {
                  "type": "lab.canvas.Screen",
                  "content": [
                    {
                      "type": "i-text",
                      "left": 0,
                      "top": 0,
                      "angle": 0,
                      "width": 18.69,
                      "height": 36.16,
                      "stroke": null,
                      "strokeWidth": 1,
                      "fill": "black",
                      "text": "+",
                      "fontStyle": "normal",
                      "fontWeight": "normal",
                      "fontSize": "72",
                      "fontFamily": "sans-serif",
                      "lineHeight": 1.16,
                      "textAlign": "center"
                    }
                  ],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "": ""
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Fixation cross",
                  "timeout": "500",
                  "hooks": {}
                },
                {
                  "type": "lab.canvas.Screen",
                  "content": [
                    {
                      "type": "i-text",
                      "left": 0,
                      "top": 0,
                      "angle": 0,
                      "width": 331.08,
                      "height": 36.16,
                      "stroke": null,
                      "strokeWidth": 1,
                      "fill": "${ this.parameters.color }",
                      "text": "${ this.parameters.word }",
                      "fontStyle": "normal",
                      "fontWeight": "bold",
                      "fontSize": "72",
                      "fontFamily": "sans-serif",
                      "lineHeight": 1.16,
                      "textAlign": "center"
                    }
                  ],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "keydown(r)": "red",
                    "keydown(g)": "green",
                    "keydown(b)": "blue",
                    "keydown(o)": "orange"
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Stroop screen",
                  "correctResponse": "${ this.parameters.color }",
                  "hooks": {}
                },
                {
                  "type": "lab.canvas.Screen",
                  "content": [],
                  "files": {},
                  "parameters": {},
                  "responses": {
                    "": ""
                  },
                  "viewport": [
                    800,
                    600
                  ],
                  "title": "Inter-trial interval",
                  "timeout": "500",
                  "hooks": {}
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "lab.html.Screen",
      "responses": {
        "": ""
      },
      "title": "Thanks",
      "content": "\u003Cheader class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Ch1\u003EThank you!\u003C\u002Fh1\u003E\n\u003C\u002Fheader\u003E\n\u003Cmain\u003E\n  \u003Cp\u003E\n    You did a great job, thanks for taking the time!\n  \u003C\u002Fp\u003E\n\u003C\u002Fmain\u003E\n\u003Cfooter class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Cp\u003E\n    If you have any questions or comments about this \n    experiment,\u003Cbr\u003E please be invited to contact\n    \u003Ca href=\"http:\u002F\u002Ffelixhenninger.com\"\u003E\n    Felix Henninger\u003C\u002Fa\u003E.\n  \u003C\u002Fp\u003E\n\u003C\u002Ffooter\u003E\n",
      "timeout": "10",
      "parameters": {},
      "files": {},
      "hooks": {}
    }
  ]
})

// Let's go!
study.run()
