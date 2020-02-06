# BlunderBot
Discord bot that pairs with chess.com. 

**BlunderBot will organize your server in a chess club!**

- **Add games** and custom channels will be made with live updates posted after each move.

- **Player stats** and win / loss displayed on leaderboard.

- **Start tournaments** with brackets and game tracking.

- **Search the Archive** of games and profiles.

---

## 1. Using BlunderBot

### Inviting to Server

- [Visit Here](https://discordapp.com/oauth2/authorize?&client_id=675064106423943178&scope=bot&permissions=8) to invite BlunderBot.

### Custom Blunder Bot (For My Fellow Coders)

- I built scripts for you to easily start creating your own Custom Bot! [Visit here](./src/customize/README.md) for instructions.

---

## 2. Channels

*(Click for more details on each)*

- General
    - [general (text channel)](#general-(text-channel))
    - [leaderboards (text channel)](#leaderboards-(text-channel))
    - [discussion (voice channel)](#discussion-(voice-channel))
- Active Games
    - [lobby (text channel)](#(active-games)-lobby-(text-channel))
    - [*game channels* (text channel)](#*game-channels*-(text-channel))
- Tournament
    - [lobby (text channel)](#(tournament)-lobby-(text-channel))
    - [tournament (text channel)](#tournament-(text-channel))
    - [*game channels* (text channel)](#*game-channels*-(text-channel))
- Archive
    - [access (text-channel)](#access-(text-channel))
    - [profile-archive (text-channel)](#profile-archive-(text-channel))
    - [game-archive (text-channel)](#game-archive-(text-channel))



---

## 3. Commands
- `bb!check` 
    - Channel: Anywhere
    - *Mate!*
- `bb!help` 
    - Channel: Anywhere
    - *Displays list of commands.*
- `bb!setup` 
    - Channel: Anywhere
    - *Creates channels and categories.*
    - *Will ask for confirmation.*
- `bb!game <player1> <player2>` 
    - Channel: Active Games -> lobby
    - *Adds a game channel to `Active Games`.*
    - *If users have more than one game active, add game ID after player2: `bb!game <player1> <player2> <gameID>`*
    - *Game ID is the number found at the end of the URL on chess.com.*
- `bb!tournament [<playernames>]` 
    - Channel: Tournament -> lobby
    - *Starts a tournament with random bracket.*
    - *For loser bracket, add a `double-elim` before player names: `bb!tournament double-elim [<playernames>]`* 
    - *Player names should be their chess.com usernames separated by spaces.*
- `bb!archive games <player>` 
    - Channel: Archive -> access
    - *Lists saved players games indexed*
- `bb!archive games <player> <index>` 
    - Channel: Archive -> access
    - *Exports game into png that can be used at https://www.chess.com/analysis to run through the whole game*
- `bb!archive profile <player>` 
    - Channel: Archive -> access
    - *Lists saved players profile and stats*



---

## 4. Channels Extended

### General Channels

- `general (text channel)`
    - **Purpose:** General chat for public discussion.
    - **Permissions:** Open
    - **Commands:** `-`
- `leaderboards (text channel)`
    - **Purpose:** Logs win ratios after each completed match.
    - **Permissions:** BlunderBot Only
- `discussion (voice channel)`
    - **Purpose:** Voice channel for discussion
    - **Permissions:** Open
    - **Commands:** `-`
- `*game channels* (text channel)`
    - **Purpose:** Created for each match, tracks and displays each move.
    - **Permissions:** Open
    - **Commands:** `-`
### Active Games
- `(active games) lobby (text channel)`
    - **Purpose:** Start tracking a match, used for commands.
    - **Permissions:** Open
    - **Commands:** `bb!game`
### Tournament
- `(tournament) lobby (text channel)`
    - **Purpose:** Start a tournament, used for commands.
    - **Permissions:** Open
    - **Commands:** `bb!tournament`
- `tournament (text channel)`
    - **Purpose:** Displays the bracket for the current tournament and instructs players for matchmaking. 
    - **Permissions:** BlunderBot Only
### Archive
- `access (text-channel)`
    - **Purpose:** Used to access data from the archive, old games or profiles.
    - **Permissions:** Open
    - **Commands:** `bb!archive games`, `bb!archive profile`
- `profile-archive (text channel)`
    - **Purpose:** Database for profiles, access data through [access (text-channel)](#access-(text-channel))
    - **Permissions:** BlunderBot Only
- `game-archive (text channel)`
    - **Purpose:** Database for games, access data through [access (text-channel)](#access-(text-channel))
    - **Permissions:** BlunderBot Only

