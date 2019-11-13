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
shinyUI(navbarPage(
  # Header
  div(
    span('lab.js', style="font-family: monospace; font-size: 0.9em"),
    '· third-party data postprocessing' 
  ),
  
  # Theme
  theme=shinytheme("flatly"),

  tabPanel('Import from CSV',
    includeCSS("style.css"),
    sidebarPanel(
      # Upload control
      fileInput(
        "data_file",
        "Please upload your raw data",
        multiple=FALSE,
        accept=c(
          "text/csv", "application/vnd.ms-excel", "text/tab-separated-values",
          ".csv", ".tsv"
        )
      ),
      
      selectInput(
        'data_format',
        'Which format is it in?',
        c(
          'csv (comma delimited)'='csv',
          'csv2 (semicolon delimited)'='csv2',
          'tsv (tab delimited)'='tsv'
        )
      ),
      
      # Data column control
      textInput(
        "data_column",
        "Which column contains the lab.js data?",
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
      
      strong('Output filtering'),
      p(
        'Please enter one column name per row',
        class='text-muted'
      ),
      textAreaInput(
        'columns_omit',
        'Columns to omit',
        rows=3
      ),
      hr(),
    
      downloadButton(
        "downloadData",
        "Download data as CSV file",
        style="width: 100%"
      )
    ),
    
    mainPanel(
      DT::dataTableOutput('preview'),
    )
  )

))