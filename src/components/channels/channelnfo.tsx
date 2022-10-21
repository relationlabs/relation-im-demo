import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import Avatar from '@mui/material/Avatar'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText';

const ChannelInfo = ({
    open,
    onClose,
    channelInfo,
}: {
    open: boolean;
    onClose: Function;
    channelInfo: any;
}) => {
    return (
        <Dialog open={open} onClose={() => {
            onClose()
        }}>
            <DialogTitle>Group Info</DialogTitle>
            <div className='channel-info'>
                <div className='header'>
                    <Avatar src={channelInfo?.icon} alt={channelInfo?.name || 'Icon'} />
                    <h2 className='group-name'>
                        {channelInfo?.name || ''}
                    </h2>
                </div>
                <div className='members'>
                    <List>
                        {
                            (channelInfo?.members || []).map((member: any) => {
                                return member?.relationId ? (
                                    <ListItem key={member.relationId}>
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt={member?.name || 'Avatar'}
                                                    src={member?.avatar}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={member?.name || 'Unknown'}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ) : null
                            })
                        }
                    </List>
                </div>
            </div>
        </Dialog>
    )
}

export default ChannelInfo