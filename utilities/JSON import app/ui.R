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
  
  # Data filtering
  strong('Data filtering'),
  p(
    'Some tools (i.e. Qualtrics) include further metadata in the header',
    'section of their CSV outputs. These are non-standard and cannot',
    'be usefully loaded into R. If necessary, please exclude them below.'
  ),
  p(
    'We assume that the first row that\'s not skipped is the file header,',
    'and that the actual data starts only after the skip range.',
    'Please also note that empty lines are skipped automatically.',
    class='text-muted'
  ),
  checkboxInput(
    "skip_rows",
    "Skip header rows in the input file",
    value=FALSE
  ),
  sliderInput(
    "skip_range",
    "Rows to skip",
    min=1, max=10, step=1,
    value=c(2, 3)
  ),
  
  hr(),

  downloadButton(
    "downloadData",
    "Generate output CSV file"
  )
))