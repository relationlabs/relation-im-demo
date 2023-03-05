# Demo for building a Relation IM application
The demo is created through `vite3's` `react-ts` template. To construct a UI quickly, this demo uses the `Material UI` component. Developers can develop their own applications based on this demo or choose other scaffold tools and UI libraries.

---

# JS-SDK

`@relationlabs/auth`    The SDK for signature authentication.

`@relationlabs/im`  The SDK for IM tools.

Install
```bash
npm install --save @relationlabs/auth @relationlabs/im
```

For more information, please refer to relevant documents for using SDKs.

---

# Demo module explained

## Login component
Directory `src/components/login/`

Its main function is signature verification and initializing a `RelationIM` instance. Using the instance, the current user's basic information can be acquired.

```javascript
import { authByMetamask } from "@relationlabs/auth"
import RelationIM from "@relationlabs/im"

const signAndLogin = useCallback(async () => {
    const authResult = await authByMetamask()
    if (!authResult.error && authResult.token) {
        const {token, error} = await RelationIM.getRelationToken(authResult.token, APIKEY)
        if (!error && token) {
            const im = RelationIM.init({token, apiKey: APIKEY, connect: true})
            const userInfoRes = await im.getUserInfo()
            const { code, data } = userInfoRes
            if (Number(code) === 0) {
            }
        }
    }
}, [])

```

We can use the method  `authByMetamask()` to authenticate the signature. If successful, the `addressAuthToken` returned can be used to acquire a `unifiedAuthToken` . Namely, to authenticate in this way:   `RelationIM.getRelationToken(addressAuthToken, APIKEY)`

When the login is authenticated, call the method `im.getUserInfo()` to acquire the current user's basic information.

The Login component will not persist  `unifiedAuthToken` and `userInfo` , for re-login is required after refreshing the page. Developers can save this data in their own way if they want to persist the state.

---

## Relations component
Directory: `src/components/relations/`

The component has two sub-modules:

`Following` and `Recommend`

---

### **Following**

It shows the list of users that a user is following. Via the function, a user can say hi to their friends, delete them, or create channels.

Load the list
```javascript
const loadFollowing = async (reload = false) => {
    const im = RelationIM.getInstance()
    if (im) {
        const res = await im.getFollowing({ address: relationId, limit: 100, cursor: (!reload && cursor) || undefined })
        const { code, data } = res || {}
        if (Number(code) === 0) {
            const { cursor: nextCursor, list = [] } = data || {}
            setCursor(nextCursor)
            setFollowingList(list)
        }
    }
}
```

The list uses the `cursor` parameter returned by the last data page to acquire the next data page. If the return value  `cursor` is empty, it means all the data is already fetched.

Delete a friend
```javascript
const unfollow = async (relationId: string) => {
    const im = RelationIM.getInstance()
    if (im) {
        const res = await im.unfollow(relationId)
        const { code } = res || {}
        if (Number(code) === 0) {
        }
    }
}
```

Create a channel
```javascript
const createGroup = async () => {
    const im = RelationIM.getInstance()
    if (im) {
        const res = await im.channelCreate({
            members: checked,
            name: `Group ${new Date().getTime()}`,
            type: 'G',
        })
        const { code, data } = res || {}
        if (Number(code) === 0) {
            const { channelUuid } = data
            setCurrentChannel(channelUuid)
        }
    }
}
```

`checked` is the collection (array) of the `relationId` of the friends chosen.

If the channel is created successfully, a `channelUuid` will be acquired, which can be used as a parameter when sending messages.

---

### **Recommend**

List of users recommended by the system. One can add(follow), say hi to, and search for a user.

Add a friend
```javascript
const follow = async (relationId: string) => {
    const im = RelationIM.getInstance()
    if (im) {
        const res = await im.follow(relationId)
        const { code } = res || {}
        if (Number(code) === 0) {
        }
    }
}
```

Search for a user
```javascript
const findOne = async () => {
    const im = RelationIM.getInstance()
    if (im) {
        if (searchInputValue) {
            const res = await im.getUserInfo(searchInputValue)
            const { code, data } = res || {}
            if (Number(code) === 0) {
                setRecommendList([data])
            }
        } else {
            loadRecommend(true)
        }
    }
}
```

`searchInputValue` is the content to be searched. With a complete `relationId`, one can search for the respective user information.

---

## Channels component
Directory: `src/components/channels/`

Sub-modules in the component include:

`List`, `Conversation` and `channelInfo`

---

### **List**

Display the list of sessions and listen to new push messages via `Socket` .

Receive push messages:
```javascript
const onMessage = useCallback(() => {
    const im = RelationIM.getInstance()
    if (im) {
        im.bind(Im.RECEIVE_MSG_OK, (event: any) => {
            const imMessage = event['im-message']
            const { channelUuid } = imMessage
            if (!channels.some(channel => channel.channelUuid === channelUuid)) {
                setCurrentChannel(channelUuid)
            }
        })
    }
}, [])
```

When a new message is received without a respective session in the list of sessions, the current session can retrieve the new data and insert it to the list of sessions.

### **ChannelInfo**

A dialog displaying the details of a channel (group). It lists the name of the channel, avatars, and members in it.

### **Conversation**

The chat box displays the list of messages in the current session. Text messges can be sent here.

Display the last n messages.
```javascript
const loadRecentMessage = async () => {
    if (currentChannel && relationId) {
        const im = RelationIM.getInstance()
        if (im) {
            const res = await im.messageList({
                channelUuid: currentChannel,
                maxCreateAt: new Date().getTime(),
                limit: 50,
            })
            const { code, data } = res || {}
            if (Number(code) === 0 && Array.isArray(data)) setMessages(data)
        }
    }
}
```

To acquire the last 50 messages based on the current timestamp. Developers can choose to load previous messages when the first message is scrolled up on top and split the result in different pages using a parameter  `maxCreateAt` .

Receive push message
```javascript
const onMessage = useCallback(() => {
    const im = RelationIM.getInstance()
    if (im) {
        im.bind(Im.RECEIVE_MSG_OK, (event: any) => {
            setMessages((prev: any[]) => {
                const imMessage = event['im-message']
                return [...prev, imMessage]
            })
        })
    }
}, [])
```

Developers can choose to listen to push events triggered by new messages in different positions of their applications, or just do it once globally and distribute the new message to different modules.

Send a message
```javascript
const sendMessage = async () => {
    if (inputValue && currentChannel) {
        setLoading(true)
        const im = RelationIM.getInstance()
        if (im) {
            const res = await im.sendMessage({
                channelUuid: currentChannel,
                content: inputValue,
            })
            const { code } = res || {}
            if (Number(code) === 0) {
                setInputValue('')
                await loadRecentMessage()
            }
        }
        setLoading(false)
    }
}
```

Send the content in the input box to the current session.

Parsing the message: Please refer to the `@relationlabs/im` document.
