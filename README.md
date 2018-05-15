# LNMIIT-Chatbot

## Steps to Setup the Project

1. `git clone` this repository

2. Install Node.js on your system (This project was built using v8 LTS of Node.js)

3. run `npm install` on terminal of your system (This will install all dependencies and modules for the project)

4. run `npm start` to start up the project

---

## Steps to change the knowledge bank

1. Open `data` folder from the root of the project folder

2. Open the `content.txt` and modify it to your liking.

---

## Folder Structure

    ¦   .gitignore
    ¦   index.js                    --> Server Initialization Code
    ¦   package-lock.json
    ¦   package.json
    ¦   README.md                   --> Read Me File
    ¦   
    +---api                         --> BackEnd
    ¦       bot.js                  --> Answering Algorithm
    ¦       routes.js
    ¦       
    +---data
    ¦       content.txt             --> Knowledge Bank
    ¦       processed.txt
    ¦       sentences.txt
    ¦       
    +---node_modules
    +---public                      --> FrontEnd
        ¦   index.html
        ¦   
        +---css
        ¦       bulma.min.css
        ¦       index.css
        ¦       
        +---js
                genie.js
            
