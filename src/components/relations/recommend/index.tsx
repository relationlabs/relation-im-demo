import { useEffect, useState, useRef } from 'react'

import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'

import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import RelationIM from "@relationlabs/im"

import SayHiBtn from '../../sayHiBtn'

const Recommend = ({
    authenticated,
    setCurrentChannel,
}: {
    authenticated: boolean;
    setCurrentChannel: (current?: string) => void;
}) => {
    const [cursor, setCursor] = useState<undefined|null|string>(undefined)
    const [recommendList, setRecommendList] = useState<any>([])
    const [searchInputValue, setSearchInputValue] = useState('')

    useEffect(() => {
        loadRecommend()
    }, [authenticated])

    const loadRecommend = async (reload = false) => {
        if (authenticated) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.recommend({ limit: 10, cursor: (!reload && cursor) || undefined })
                const { code, data } = res || {}
                if (Number(code) === 0) {
                    const { cursor: nextCursor, list = [] } = data || {}
                    if (nextCursor && Array.isArray(list)) {
                        setCursor(nextCursor)
                        setRecommendList(list)
                    }
                }
            }
        }
    }

    const follow = async (relationId: string) => {
        if (authenticated) {
            const im = RelationIM.getInstance()
            if (im) {
                const res = await im.follow(relationId)
                const { code } = res || {}
                if (Number(code) === 0) {
                    setRecommendList((prev: any[]) => {
                        const nextList = [...prev]
                        nextList.some((user, index) => {
                            if (user.relationId === relationId) {
                                nextList[index].following = true
                            }
                        })
                        return nextList
                    })
                }
            }
        }
    }

    const findOne = async () => {
        if (authenticated) {
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
                       Recommend
                       <div style={{ flexGrow: 1 }} />
                       <TextField
                            className='search-text-field'
                            label="Search" 
                            size='small'
                            placeholder='find one'
                            onChange={e => {
                                setSearchInputValue(e.target.value)
                            }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => {
                                            findOne()
                                        }}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    </ListSubheader>
                }
            >
                {(recommendList || []).map((user: any, index: number) => {
                    return (
                        <ListItem
                            key={user?.relationId || index}
                            secondaryAction={
                                user?.following ? (
                                    <SayHiBtn
                                        relationId={user?.relationId}
                                        setCurrentChannel={setCurrentChannel}
                                    />
                                ) : (
                                    <IconButton
                                        edge="end"
                                        aria-label="follow"
                                        onClick={() => {
                                            if (user.relationId) {
                                                follow(user.relationId)
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                )
                            }
                        >
                            <ListItemAvatar>
                                <Avatar
                                    alt={`${user?.name ? `${user?.name} ` : ''}Avatar ${index}`}
                                    src={user?.avatar || 'https://relationlabs.ai/icon/avatar/avatar32.png'}
                                />
                            </ListItemAvatar>
                            <ListItemText primary={user?.name || 'Unknown'} />
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}

export default Recommend