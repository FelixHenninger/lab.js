#
# This is the server logic of a Shiny web application. You can run the 
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)
library(RSQLite)
library(jsonlite)
library(tidyverse)
library(janitor)

# Increase maximum upload size
options(shiny.maxRequestSize = 100*1024^2)

processData <- function(database) {
  con <- dbConnect(
    drv=RSQLite::SQLite(),
    dbname=database
  )
  
  # Extract main table
  d <- dbGetQuery(
    conn=con,
    statement='SELECT * FROM labjs'
  )
  
  # Close connection
  dbDisconnect(
    conn=con
  )
  
  # Discard connection
  rm(con)
  
  d.meta <- map_dfr(d$metadata, fromJSON) %>%
    dplyr::rename(
      observation=id
    )
  
  d <- d %>%
    bind_cols(d.meta) %>%
    select(
      -metadata # Remove metadata column
    )
  
  # Remove temporary data frame
  rm(d.meta)
  
  count_unique <- function(x) {
    return(length(unique(x)))
  }
  
  information_preserved <- function(x, length) {
    return(
      count_unique(str_sub(x, end=i)) ==
        count_unique(x)
    )
  }
  
  # Figure out the length of the random ids needed
  # to preserve the information therein. (five characters
  # should usually be enougth, but better safe)
  for (i in 5:36) {
    if (
      information_preserved(d$session, i) &&
      information_preserved(d$observation, i)
    ) {
      break()
    }
  }
  
  d <- d %>%
    dplyr::mutate(
      session=str_sub(session, end=i),
      observation=str_sub(observation, end=i)
    )
  
  rm(i, count_unique, information_preserved)
  
  parseJSON <- function(input) {
    return(input %>%
      fromJSON(flatten=T) %>% {
        # Coerce lists
        if (class(.) == 'list') {
          discard(., is.null) %>%
            as_tibble()
        } else {
          .
        } } %>%
      # Sanitize names
      janitor::clean_names() %>%
      # Use only strings for now, and re-encode types later
      mutate_all(as.character)
    )
  }
  
  d.full <- d %>%
    dplyr::filter(payload == 'full')
  
  if (nrow(d.full) > 0) {
    d.full %>%
      group_by(observation, id) %>%
      do(
        { map_dfr(.$data, parseJSON) } %>%
          bind_rows()
      ) %>%
      ungroup() %>%
      select(-id) -> d.full
  } else {
    # If there are no full datasets, start from an entirely empty df
    # in order to avoid introducing unwanted columns into the following
    # merge steps.
    d.full <- tibble()
  }
  
  d %>%
    dplyr::filter(payload %in% c('incremental', 'latest')) %>%
    group_by(observation, id) %>%
    do(
      { map_dfr(.$data, parseJSON) } %>%
        bind_rows()
    ) %>%
    ungroup() %>%
    select(-id) -> d.incremental
  
  d.output <- d.full %>%
    bind_rows(
      d.incremental %>% filter(!(observation %in% d.full$observation))
    ) %>%
    type_convert()
  
  d.output %>%
    group_by(observation) %>%
    fill(matches('code'), .direction='down') %>%
    fill(matches('code'), .direction='up') %>%
    ungroup() -> d.output
  
  return(d.output)
}

# Define server logic required to draw a histogram
shinyServer(function(input, output) {
   
  output$downloadData <- downloadHandler(
    filename = function() {
      paste('labjs-export-', Sys.Date(), '.csv', sep='')
    },
    content = function(con) {
      write_csv(
        processData(input$database_file[1, 'datapath']),
        con
      )
    }
  )
})
