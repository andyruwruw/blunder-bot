# Namespace

Documentation of Method and Variable names claimed by BlunderBot to function.

BlunderBot inherits already from `Discord.Client` from `discord.io`, a Web-Socket object linked to Discord.

---

## 1. Discord.Client 

### A. Variables
- [`this.id`](#--`this.id`)
- `this.username`
- `this.bot`
- `this.avatar`
- `this.servers`
- `this.channels`
- `this.users`
- `this.connected`
- `this.inviteURL`

- `this.directMessages`
- `this.internals`
- `this.presence`
- `this.verified`
- `this.mfa_enabled`
- `this.email`
- `this.discriminator`

### B. Methods
- `this.connect`
---

## 2. BlunderBot

### A. Variables
- `this._permissions`
- `this._channels`
- `this._categories`
- `this._events`
- `this._eventsCount`
- `this._discordAPI`
- `this._chessAPI`
- `this._trackedGames`
- `this._serverKeys`

### B. Methods

---

## 3. Item Descriptions

### - `this.id`
- **From**: Discord.Client
- **Type**: String
- **Description**: Bot's ID. When logged into a server, this is the Bot's User Object's ID.
### - `this.username`
- **From**: Discord.Client
- **Type**: String
- **Description**: Bot's username, also the Bot's name. This is the name that will appear when the Bot messages.
### - `this.bot`
- **From**: Discord.Client
- **Type**: Boolean
- **Description**: Is this a Bot?
### - `this.avatar`
- **From**: Discord.Client
- **Type**: String
- **Description**: Image ID for Bot.
### - `this.servers`
- **From**: Discord.Client
- **Type**: Object
- **Description**: Server Objects by ID.
- **Structure**:
```
{ 
    'Server ID': {
        large: Boolean,
        features: [],
        joined_at: String,
        member_count: Number,
        afk_channel_id: String,
        region: String,
        vanity_url_code: null,
        channels: Object,
        system_channel_id: null,
        roles: Object,
        icon: String,
        afk_timeout: Number,
        discovery_splash: null,
        lazy: Boolean,
        name: String,
        unavailable: Boolean,
        members: Object,
        application_id: null,
        rules_channel_id: null,
        premium_tier: Number,
        preferred_locale: String,
        splash: null,
        mfa_level: Number,
        public_updates_channel_id: null,
        premium_subscription_count: Number,
        default_message_notifications: Number,
        owner_id: String,
        description: null,
        banner: null,
        emojis: Object,
        verification_level: Number,
        id: String,
        system_channel_flags: Number,
        explicit_content_filter: Number,
        voiceSession: null,
        self_mute: Boolean,
        self_deaf: Boolean } },
    },

    // ...more of these
}
```
### - `this.channels`
- **From**: Discord.Client
- **Type**: Object
- **Description**: Channel Objects by ID.
- **Structure**:
```
{ 
    'Channel ID': {
        members: Object,
        permisions: Object,
        guild_id: String, // (Server ID)
        user_limit: Number,
        type: Number, // (0: Text, 2: Voice, 4: Category)
        position: Number, // (Order of Channels)
        parent_id: String, // (Category ID)
        nsfw: Boolean,
        name: String,
        id: String,

        last_message_id: String, // (Text Channels Only) 
        rate_limit_per_user: Number, // (Text Channels Only)
        bitrate: Number, // (Voice Channels Only)
    },

    // ...more of these
}
```
### - `this.users`
- **From**: Discord.Client
- **Type**: Object
- **Description**: User Objects by ID.
- **Structure**:
```
{ 
    'User ID': {
        username: String,
        id: String,
        discriminator: Number,
        avatar: String,
        bot: Boolean,
        game: Object
    },

    // ...more of these
}
```
### - `this.connected`
- **From**: Discord.Client
- **Type**: Boolean
- **Description**: Is the Bot connected?
### - `this.verified`
- **From**: Discord.Client
- **Type**: Boolean
- **Description**: Is the Bot connected?
### - `this.internals`
- **From**: Discord.Client
- **Type**: Object
- **Description**: Inicialization variables.
- **Structure**:
```
{ 
  oauth: {},
  version: String,
  settings: {},
  token: String,
  gatewayUrl: String,
  sequence: Number,
  sessionID: String 
}
```
### - `this.presence`
- **From**: Discord.Client
- **Type**: Object
- **Description**: About current login status.
- **Structure**:
```
{ 
  status: 'online' | 'offline',
  since: Number
}
```
### - `this.directMessages`
- **From**: Discord.Client
- **Type**: Object
- **Description**: Direct Messages to Bot.
### - `this.inviteURL`
- **From**: Discord.Client
- **Type**: String | null
- **Description**: -
### - `this.mfa_enabled`
- **From**: Discord.Client
- **Type**: Boolean
### - `this.email`
- **From**: Discord.Client
- **Type**: String | null
### - `this.discriminator`
- **From**: Discord.Client
- **Type**: Number

### - `this.connect`
- **From**: Discord.Client
- **Type**: Function
- **Description**: 
