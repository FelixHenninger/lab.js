#
# This is the server logic of a Shiny web application. You can run the
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(jsonlite)
library(tidyverse)
library(janitor)

# Increase maximum upload size
options(shiny.maxRequestSize = 250*1024^2)

processData <- function(datafile, format='csv', labjs_column='labjs-data',
  skip_rows=F, skip_range='', columns_omit=c()) {
  
  columns_omit <- purrr::flatten_chr(columns_omit)
  
  read_func <- switch(format,
    'csv'=read_csv,
    'csv2'=read_csv2,
    'tsv'=read_tsv,
    read_csv
  )
  
  if (skip_rows) {
    # The header row is the first line, unless this is skipped
    header_skip <- ifelse(skip_range[1] > 1, 0, skip_range[1])
    header <- read_func(datafile, skip=header_skip, n_max=1)
    
    # Load the remainder of the file
    data <- read_func(datafile, skip=skip_range[2], col_names=colnames(header))
  } else {
    data <- read_func(datafile)
  }
  
  return(
    data %>%
      # Provide a fallback for missing data
      mutate(
        !!labjs_column := recode(.[[labjs_column]], .missing='[{}]')
      ) %>%
      # Expand JSON-encoded data per participant
      group_by_all() %>%
      do(
        fromJSON(.[[labjs_column]], flatten=T)
      ) %>%
      ungroup() %>%
      select(
        # Remove column containing raw JSON
        -matches(labjs_column),
        -one_of(columns_omit)
      )
  )
}

# Define server logic
shinyServer(function(input, output) {
  data <- reactive({
    shiny::validate(
      need(
        input$data_file != '',
        message="Please select an input file"
      ),
      need(
        input$data_format != '',
        message="Please select a file format"
      ),
      need(
        input$data_column != '',
        message="Please choose a data column"
      )
    )
    
    processData(
      input$data_file[1, 'datapath'],
      input$data_format,
      input$data_column,
      input$skip_rows,
      input$skip_range,
      stringi::stri_split_fixed(input$columns_omit, '\n', omit_empty=T)
    )
  })
  
  output$downloadData <- downloadHandler(
    filename = function() {
      paste('labjs-export-', Sys.Date(), '.csv', sep='')
    },
    content = function(con) {
      write_csv(
        data(),
        con
      )
    },
    contentType='text/csv'
  )
  
  output$preview <- DT::renderDataTable({
    data()
  })
})
