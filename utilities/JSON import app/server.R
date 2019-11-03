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

processData <- function(datafile, labjs_column='labjs-data') {
  return(
    # TODO: Consider using fread from the data.table package
    # in order to auto-detect the file format
    read_csv(datafile) %>%
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
      # Remove column containing raw JSON
      select(-matches(labjs_column))
  )
}

# Define server logic
shinyServer(function(input, output) {
  output$downloadData <- downloadHandler(
    filename = function() {
      paste('labjs-export-', Sys.Date(), '.csv', sep='')
    },
    content = function(con) {
      write_csv(
        processData(
          input$data_file[1, 'datapath'],
          input$data_column
        ),
        con
      )
    }
  )
})
