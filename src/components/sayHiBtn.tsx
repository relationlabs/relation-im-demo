import { useState } from 'react'

import Button from '@mui/material/Button'

import RelationIM from "@relationlabs/im"

const SayHiBtn = ({
    relationId,
    setCurrentChannel
}: {
    relationId: string;
    setCurrentChannel: (current?: string) => void;
}) => {
    const [loading, setLoading] = useState(false)

    const sayHi = async () => {
        setLoading(true)
        if (relationId) {
            const im = RelationIM.getInstance()
            if (im) {
               const res = await im.sendMessage({
                toRelationId: relationId,
                type: 'TEXT',
                content: 'Hi~'
               })
               const { code, data } = res || {}
               if (Number(code) === 0) {
                    const { channelUuid } = data
                    setCurrentChannel(channelUuid)
               }
            }
        }
        setLoading(false)
    }

    return (
        <Button
            disabled={loading}
            variant="outlined"
            size="small"
            onClick={() => {
                sayHi()
            }}
        >
            Say Hi
        </Button>
    )
}

export default SayHiBtn