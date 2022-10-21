# Relation IM示例demo开发指引
demo通过`vite3`的`react-ts`模版创建，为方便构建UI本示例使用了`Material UI`组件,开发者可以基于本示例开发应用，也可以自行选择脚手架工具与UI库开发应用

---

# JS-SDK

`@relationlabs/auth`    签名认证SDK

`@relationlabs/im`  im工具SDK

安装
```bash
npm install --save @relationlabs/auth @relationlabs/im
```

sdk详细使用说明请参照对应文档

---

# demo模块说明

## Login登录组件
目录`src/components/login/`

主要功能签名认证与`RelationIM`实例的初始化，并通过`RelationIM`实例获取当前用户的基础信息

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

通过 `authByMetamask()` 方法进行签名认证，成功后使用获取到的 `addressAuthToken` 换取 `unifiedAuthToken` ，即登录认证 `RelationIM.getRelationToken(addressAuthToken, APIKEY)`

登录认证通过后, 调用`im.getUserInfo()`方法即可获取当前登录用户的基本信息

Login登录组件并未对 `unifiedAuthToken` 和 `userInfo` 做持久化存储，因为刷新页面后需要重新登录，开发者可以用适当的方式保存上述数据，避免状态丢失

---

## Relations 组件
目录`src/components/relations/`

该组件内有两个子模块

`Following` 和 `Recommend`

---

### **Following**

主要展示已关注用户的列表，提供向好友打招呼/删除好友以及创建群聊的功能

加载列表
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

列表数据已上一页数据返回的 `cursor` 作为参数用来获取下一页的数据，返回值 `cursor` 为空则表示数据已拉取完毕

删除好友
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

创建群聊
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

`checked` 是已选中好友的 `relationId` 集合(数组)

群聊创建成功后，可以获取到 `channelUuid`，可以在发送消息时作为参数使用

---

### **Recommend**

主要引擎推荐的用户列表，提供添加好友（关注用户）/打招呼以及搜索单个用户的功能

添加好友
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

查找单个用户
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

`searchInputValue` 表示查找内容，输入完整的 `relationId` 即可查询到对方的基本信息

---

## Channels 组件
目录`src/components/channels/`

该组件内的子模块

`List`, `Conversation` 和 `channelInfo`

---

### **List**

展示会话列表，并通过 `Socket` 监听新的消息推送

接收消息推送
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

接受到新的消息后，如果会话列表里不存在此会话就可以主动刷新一次数据获取手动往会话列表里插入新会话

### **ChannelInfo**

一个展示群详情的对话框，展示群名称/头像/成员列表

### **Conversation**

聊天框，显示当前会话内的消息列表，可发送文本消息

显示最新的n条消息
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

根据当前时间去获取最新的50条消息，开发者可以在聊天框滚动到第一条消息时去加载过往消息，通过 `maxCreateAt` 参数分页

接收消息推送
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

开发者可以选择在应用的不同位置监听新消息的推送事件，也可以在全局只监听一次，然后将新消息分发给不同的模块

发送消息
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

将输入框中的内容发送到当前会话

消息内容解析: 请参照 `@relationlabs/im` 文档
