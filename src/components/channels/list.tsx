import { useRef, useCallback, useEffect } from 'react'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText';

import RelationIM, { Im } from "@relationlabs/im"

const ChannelList = ({
  currentChannel,
  channels = [],
  setCurrentChannel,
  authenticated,
}: {
  channels: any[];
  authenticated: boolean;
  currentChannel?: string;
  setCurrentChannel: (current?: string) => void
}) => {
    const init = useRef(false)

    useEffect(() => {
      if (authenticated) {
        onMessage()
      }
    }, [authenticated])

    const onMessage = useCallback(() => {
      if (!init.current) {
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
          init.current = true
      }
    }, [])
    return (
        <div className='channels-list'>
          <List>
              {(channels || []).sort((a, b) => {
                if (a?.channelUuid === currentChannel) return -1
                if (b?.channelUuid === currentChannel) return 1
                return 0
              }).map((channel, index) => {
                const active = currentChannel === channel?.channelUuid
                // const lastMessageContent = channel?.lastMessageContent || ''
                // const parsedContent = lastMessageContent
                return (
                  <ListItem className={active ? 'active-channel' : ''} key={channel?.channelUuid || index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setCurrentChannel(channel?.channelUuid)
                      }}
                    >
                      <ListItemAvatar>
                          <Avatar
                              alt={channel?.channelType || 'Channel'}
                              src={channel?.channelIcon}
                          />
                      </ListItemAvatar>
                      <ListItemText
                        primary={channel?.displayName || 'Unknown'}
                        /*
                        secondary={
                          <div className='ellipsis'>
                            {parsedContent?.content || ''}
                          </div>
                        }
                        */
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
          </List>
        </div>
    )
}

export default ChannelList