import Recommend from './recommend'
import Following from './following'

import './index.css'

const Relations = ({
    authenticated = false,
    userInfo = {},
    setCurrentChannel,
}: {
    authenticated: boolean;
    userInfo: any;
    setCurrentChannel: (current?: string) => void;
}) => {
    return (
        <div className='relations-wrap'>
            <Following setCurrentChannel={setCurrentChannel} relationId={userInfo?.relationId} authenticated={authenticated} />
            <Recommend setCurrentChannel={setCurrentChannel} authenticated={authenticated} />
        </div>
    )
}

export default Relations