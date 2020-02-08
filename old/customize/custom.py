# Creates .env for discord token.
# Get discord token from https://discordapp.com/developers/applications/me
# Instructions in README.md
# Provided .gitignore keeps .env private.
def setSecret():
    dotenv = open("../.env", "w+")
    token = in("Discord Token: ")
    print("Writing .env")
    dotenv.write("discordToken=\"" + token + "\"")
    dotenv.close()

# Writes over server.js to provide a customizable Class that inherits from the original BlunderBot
def restructureServer():
    server = open("../server.js", "w+")
    print("Writing server.js")
    server.write("// Dependencies\nlet dotenv = require('dotenv');\n\n// Importing class\nlet BlunderBot = require('./scripts/blunderbot.js');\n\n// Secret Token Kept in .env\n// Retrieving using dotenv\ndotenv.config();\nlet discordToken = process.env.discordToken;\n\nclass CustomBlunderBot extends BlunderBot {\n\tconstructor(options) {\n\t\tsuper(options);\n\t\t// Your Code Here\n\t}\n\n\t// Your Custom Methods Here\n \n}\n\nlet server = new CustomBlunderBot({\n\ttoken: discordToken,\n\tautorun: true\n});")
    server.close()

def main():
    print("Setting Up for Customization")
    setSecret()

main()