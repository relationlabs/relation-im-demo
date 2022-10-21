import { useEffect, useState } from 'react'

import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'

import RelationIM from "@relationlabs/im"

import SayHiBtn from '../../sayHiBtn'

const CreateGroupBtn = ({
    createGroup
}: {
    createGroup: Function;
}) => {
    const [loading, setLoading] = useState(false)
    return (
        <Button
            disabled={loading}
            variant='outlined'
            size='small'
            onClick={async () => {
                setLoading(true)
                await createGroup()
                setLoading(false)
            }}
        >
            Create Group
        </Button>
    )
}

const Following = ({
    authenticated,
    relationId,
    setCurrentChannel,
}: {
    authenticated: boolean;
    relationId: string;
    setCurrentChannel: (current?: string) => void,
}) => {
    const [cursor, setCursor] = useState<undefined|null|string>(undefined)
    const [followingList, setFollowingList] = useState<any>([])
    const [checked, setChecked] = useState<string[]>([])

    useEffect(() => {
        loadFollowing(true)
    }, [authenticated])

    const loadFollowing = async (reload = false) => {
        if (authenticated) {
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
    }

    const unfollow = async (relationId: string) => {
        if (authenticated) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.unfollow(relationId)
                const { code } = res || {}
                if (Number(code) === 0) {
                    setFollowingList((prev: any[]) => {
                        const nextList = [...prev]
                        nextList.some((user, index) => {
                            if (user.relationId === relationId) {
                                nextList[index] = null
                            }
                        })
                        return nextList.filter(user => user)
                    })
                }
            }
        }
    }

    const createGroup = async () => {
        if (authenticated) {
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
    }

    return (
        <div className='relations-list-wrap'>
            <List
                sx={{
                    width: 360,
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: 300,
                }}
                subheader={
                    <ListSubheader className='relations-list-subheader' component="div">
                        Following
                        <div style={{ flexGrow: 1 }} />
                        {
                            checked.length > 0 && (
                                <CreateGroupBtn createGroup={createGroup} />
                            )
                        }
                        <IconButton
                                onClick={() => {
                                    loadFollowing(true)
                                }}
                        >
                                <RefreshIcon />
                        </IconButton>
                    </ListSubheader>
                }
            >
                {(followingList || []).map((user: any, index: number) => {
                    return user?.relationId ? (
                        <ListItem
                            key={user.relationId}
                            secondaryAction={
                                <div>
                                    <SayHiBtn
                                        relationId={user.relationId}
                                        setCurrentChannel={setCurrentChannel}
                                    />
                                    <IconButton
                                        edge="end"
                                        aria-label="follow"
                                        style={{ marginLeft: 8 }}
                                        onClick={() => {
                                            unfollow(user.relationId)
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            }
                        >
                            <ListItemButton
                                onClick={() => {
                                    setChecked(prev => {
                                        let next = []
                                        if (prev.indexOf(user.relationId) !== -1) {
                                            next = prev.filter(checkedId => checkedId !== user.relationId)
                                        } else {
                                            next = [...prev, user.relationId]
                                        }
                                        return next
                                    })
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        marginRight: 0,
                                        minWidth: 42,
                                    }}
                                >
                                    <Checkbox
                                        edge="start"
                                        checked={checked.indexOf(user.relationId) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemAvatar>
                                    <Avatar
                                        alt={`${user?.name ? `${user?.name} ` : ''}Avatar ${index}`}
                                        src={user?.avatar || 'https://relationlabs.ai/icon/avatar/avatar32.png'}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={user?.name || 'Unknown'} />
                            </ListItemButton>
                        </ListItem>
                    ) : null
                })}
            </List>
        </div>
    )
}

export default Following