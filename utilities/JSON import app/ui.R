#
# This is the user-interface definition of a Shiny web application. You can
# run the application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(shinythemes)

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  # Theme
  theme=shinytheme("flatly"),

  # Application title
  titlePanel(
    div(
      span('lab.js', style="font-family: monospace; font-size: 0.9em"),
      '· third-party data postprocessing' 
    ),
    "lab.js data postprocessing"
  ),

  hr(),

  # Upload control
  fileInput(
    "data_file",
    "Please upload your raw data file as CSV",
    multiple=FALSE,
    accept=c(
      "text/csv",
      "application/vnd.ms-excel",
      ".csv"
    )
  ),
  
  # Data column control
  textInput(
    "data_column",
    "Which column contains the JSON data?",
    "labjs-data"
  ),
  
  hr(),

  downloadButton(
    "downloadData",
    "Generate output CSV file"
  )
))