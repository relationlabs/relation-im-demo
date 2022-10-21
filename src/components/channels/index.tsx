
import { useEffect, useState } from 'react'

import Paper from '@mui/material/Paper'

import ChannelList from './list'
import Conversation from './conversation'

import RelationIM from "@relationlabs/im"

import './index.css'

const Channels = ({
    authenticated,
    userInfo,
    currentChannel,
    setCurrentChannel
}: {
    authenticated: boolean;
    userInfo: any;
    currentChannel?: string;
    setCurrentChannel: (current?: string) => void;
}) => {
    const [cursor, setCursor] = useState<string|undefined|null>()
    const [channels, setChannels] = useState<any>([])
    

    useEffect(() => {
        loadUserChannels(true)
    }, [authenticated])

    useEffect(() => {
        if (currentChannel && !channels.some((channel: any) => channel?.channelUuid === currentChannel)) {
            loadUserChannels(true)
        }
    }, [currentChannel, channels])

    const loadUserChannels = async (reload = false) => {
        if (authenticated) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.userChannelsList({
                    cursor: (!reload && cursor) || undefined,
                    limit: 100
                })
                const { code, data } = res || {}
                if (Number(code) === 0) {
                    const { cursor: nextCursor, list = [] } = data || {}
                    if (nextCursor && Array.isArray(list)) {
                        setCursor(nextCursor)
                        setChannels(list)
                    }
                }
            }
        }
    }

    return (
        <Paper>
            <div className='channels-wrap'>
                <div className='left'>
                    <ChannelList
                        currentChannel={currentChannel}
                        setCurrentChannel={(current?: string) => {
                            setCurrentChannel(current)
                        }}
                        channels={channels}
                        authenticated={authenticated}
                    />
                </div>
                <div className='right'>
                    <Conversation
                        currentChannel={currentChannel}
                        relationId={userInfo?.relationId}
                    />
                </div>
            </div>
        </Paper>
    )
}

export default Channels