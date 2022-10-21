import { useState, useEffect, useCallback, useRef } from 'react'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import SendIcon from '@mui/icons-material/Send'
import UserIcon from '@mui/icons-material/Person'

import RelationIM, { Im, messageParser } from "@relationlabs/im"

import ChannelInfo from './channelnfo'

const ActionBtn = ({
    text,
    action,
    color = 'primary',
}: {
    text: string;
    color?: "primary" | "inherit" | "secondary" | "success" | "error" | "info" | "warning" | undefined;
    action: Function;
}) => {
    const [loading, setLoading] = useState(false)
    return (
        <Button
            disabled={loading}
            variant='outlined'
            color={color}
            onClick={async () => {
                setLoading(true)
                await action()
                setLoading(false)
            }}
        >
            {text}
        </Button>
    )
}

const SysMsg = ({
    content
}: {
    content: string
}) => {
    return (
        <div className='message-sys'>
            <div className='message-sys-content'>
                {content || ''}
            </div>
        </div>
    )
}

const TextMsg = ({
    content,
}: {
    content: string;
}) => {
    return (
        <div className='message-bubble'>
            {content || ''}
        </div>
    )
}

const CardMsg = ({
    parsedMsg
}: {
    parsedMsg: any
}) => {
    const { parsedContent, content, fromName } = parsedMsg
    if (parsedContent && typeof parsedContent === 'object') {
        const { contentAction } = parsedContent
        if (contentAction === 'joinGroup') {
            const { groupName, groupId } = parsedContent
            if (groupId) {
                return <JoinGroupCard groupId={groupId} groupName={groupName} fromName={fromName} />
            }
        }
    }
    return (
        <div className='message-bubble'>
            {content || ''}
        </div>
    )
}

const JoinGroupCard = ({
    groupName,
    fromName,
    groupId,
}: {
    groupName?: string;
    fromName?: string;
    groupId: string;
}) => {
    const join = async () => {
        const im = RelationIM.getInstance()
        if (im) {
            const res = await im.channelJoin(groupId)
            const { code } = res || {}
            if (Number(code) === 0) {
                alert('success')
            }
        }
    }
    return (
        <div className='message-bubble message-join-group'>
            <div className='message-join-group-content'>
                {fromName} invite YOU to Join Group {groupName}
            </div>
            <div className='message-join-group-btn'>
                <ActionBtn
                    action={join}
                    text='Join'
                />
            </div>
        </div>
    )
}

const Conversation = ({
    currentChannel,
    relationId,
}: {
    currentChannel?: string;
    relationId?: string;
}) => {
    const [loading, setLoading] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const [messages, setMessages] = useState<any>([])
    const [channelInfo, setChannelInfo] = useState<any>({})
    const [channelInfoOpen, setChannelInfoOpen] = useState(false)

    const init = useRef(false)

    useEffect(() => {
        loadRecentMessage()
        if (currentChannel) {
            onMessage()
            loadCurrentChannelInfo()
        }
    }, [currentChannel, relationId])

    const onMessage = useCallback(() => {
        if (!init.current) {
            const im = RelationIM.getInstance()
            if (im) {
                im.bind(Im.RECEIVE_MSG_OK, (event: any) => {
                    setMessages((prev: any[]) => {
                        const imMessage = event['im-message']
                        return [...prev, imMessage]
                    })
                })
            }
            init.current = true
        }
    }, [])

    const loadCurrentChannelInfo = async () => {
        
        const im = RelationIM.getInstance()
        if (im && currentChannel) {
            const channelInfoRes = await im.channelInfo(currentChannel)
            const { code, data } = channelInfoRes || {}
            if (Number(code) === 0 && data) {
                setChannelInfo(data)
            }
        }
    }

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

    const leaveGroup = async () => {
        if (currentChannel) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.channelMemberLeave(currentChannel)
                const { code } = res || {}
                if (Number(code) === 0) {
                    alert('success')
                }
            }
        }
    }

    const disbandGroup = async () => {
        if (currentChannel) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.channelDisband(currentChannel)
                const { code } = res || {}
                if (Number(code) === 0) {
                    alert('success')
                }
            }
        }
    }

    return (
        <div className="conversation-wrap">
            <div className='conversation-header'>
                {
                    channelInfo?.type === 'G' && currentChannel && (
                        <>
                            <IconButton onClick={() => setChannelInfoOpen(true)}>
                                <UserIcon />
                            </IconButton>
                            <ChannelInfo
                                open={channelInfoOpen}
                                onClose={() => setChannelInfoOpen(false)}
                                channelInfo={channelInfo}
                            />
                            <div style={{ flexGrow: 1 }} />
                            <ActionBtn text='Leave Group' color='warning' action={leaveGroup} />
                            <div style={{ width: 8 }} />
                            <ActionBtn text='Disband Group' color='warning' action={disbandGroup} />
                        </>
                    )
                }
            </div>
            <div className="messages">
                {
                    (messages || []).map((msg: any) => {
                        const parsedMsg = messageParser(msg)
                        const { parsedContent, type } = parsedMsg
                        if (type === 'SYS') return <SysMsg content={parsedContent} />
                        return (
                            <div key={msg?.id || msg?.sendUuid} className={`message-bubble-wrap${msg?.from === relationId ? ' my-self' : ''}`}>
                                <Avatar
                                    alt={`${msg?.fromName || 'Avatar'}`}
                                    src={msg?.fromAvatar || 'https://relationlabs.ai/icon/avatar/avatar32.png'}
                                />
                                <div className='message-content'>
                                    <div className='message-from ellipsis'>
                                        {msg?.fromName || ''}
                                    </div>
                                    {
                                        type === 'TEXT' && <TextMsg content={parsedContent} />
                                    }
                                    {
                                        type === 'CARD' && <CardMsg parsedMsg={parsedMsg} />
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="input-area">
                <TextField
                    value={inputValue}
                    label="Input"
                    variant="filled"
                    fullWidth
                    onChange={e => {
                        setInputValue(e.target.value)
                    }}
                />
                <Button
                    disabled={loading}
                    className='send-btn'
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={sendMessage}
                >
                    Send
                </Button>
            </div>
        </div>
    )
}

export default Conversation