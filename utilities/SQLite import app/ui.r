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
  titlePanel("lab.js database export"),
  
  hr(),
  
  # Upload control
  fileInput(
    "database_file",
    "Please upload your database file",
    multiple=FALSE,
    accept=c(
      "application/x-sqlite3",
      ".sqlite",
      ".sqlite3"
    )
  ),
  
  downloadButton(
    "downloadData",
    "Generate CSV file"
  )
))
