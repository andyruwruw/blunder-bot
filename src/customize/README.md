# Customize BlunderBot

I built some scripts here and added references to make adding functionality as easy as possible. 

These instructions will help you set up registering your bot, adding it to your server, configuring this repository for changes, and running!

References are provided in this same directory. 
- [Namespace Details](./NAMESPACE.md)
- [Starting References](./REFERENCES.md)

---

## 1. Step by Step

1. Register Your Bot
    - Visit [Discord's Application Portal](https://discordapp.com/developers/applications/me).
    - Select `New Application`.
    - Select `Save Changes` once you've named it..
    - On left hand size, select `Bot` and `Add Bot`.
    - Once you're Bot is setup, select `Click to Reveal Token`. 
    - This token will come in during step 3.
2. Invite Your Bot
    - From the Bot page, select `General Information` on the left.
    - Copy the `CLIENT ID` listed there.
    - Replace `CLIENTID` from the following link with what you copied and go to the link. https://discordapp.com/oauth2/authorize?&client_id=CLIENTID&scope=bot&permissions=8 
    - Add the Bot to your server.
3. Make Your Edits
    - Run the `python` script [custom.py](./custom.py) in the `customize` directory.
    - It will ask for the token you saved from step 1.
    - Make your edits to the new `server.js`. The python script edits it to create a new class that INHERITS from BlunderBot, allowing you to add functionality.
4. Run
    - From command line, within `src`, run `npm run start`.
    - For details on namespace visit [NAMESPACE.md](./NAMESPACE.md).
    - For some starting references visit [REFERENCES.md](./REFERENCES.md).
    - Send in pull requests for awesome additions!