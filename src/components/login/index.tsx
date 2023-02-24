import { useCallback, useState } from 'react'

import Button from '@mui/material/Button'

import RelationIM from "@relationlabs/im"
import { authByMetamask } from "@relationlabs/auth"

const APIKEY = '581c6c4fa0b54912b00088aa563342a4'

const Login = ({
    authenticated = false,
    onFinish,
}: {
    authenticated: boolean;
    onFinish: (authenticated: boolean, userInfo: any) => void;
}) => {
    const [loading, setLoading] = useState(false)
    const [userInfo, setUserInfo] = useState<any>({})

    const signAndLogin = useCallback(async () => {
        setLoading(true)
        const authResult = await authByMetamask()
        if (!authResult.error && authResult.token) {
            const {token, error} = await RelationIM.getRelationToken(authResult.token, APIKEY)
            if (!error && token) {
              const im = RelationIM.init({token, apiKey: APIKEY, connect: true})
              const userInfoRes = await im.getUserInfo()
              const { code, data } = userInfoRes
              if (Number(code) === 0) {
                onFinish(true, data)
                setUserInfo(data)
              }
            }
        }
        setLoading(false)
    }, [])

    return (
        <div>
            {
                authenticated ? (
                    <Button
                        variant='outlined'
                    >
                        {userInfo?.name ? <div className='ellipsis' style={{ marginRight: 8, maxWidth: 120 }}>{userInfo.name}</div> : null}Authenticated
                    </Button>
                ) : (
                    <Button
                        disabled={loading}
                        variant='contained'
                        onClick={async () => {
                            await signAndLogin()
                        }}
                    >
                        Login
                    </Button>
                )
            }
        </div>
    )
}

export default Login