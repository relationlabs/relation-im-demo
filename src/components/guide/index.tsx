import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import Login from '../login'
import Relations from '../relations'
import Channels from '../channels'

import './index.css'

const Guide = () => {
    const [authenticated, setAuthenticated] = useState(false)
    const [userInfo, setUserInfo] = useState<any>({})
    const [activeStep, setActiveStep] = useState(0)

    const [currentChannel, setCurrentChannel] = useState<string|undefined>()

    useEffect(() => {
        if (authenticated) {
            setActiveStep(prevActiveStep => {
                return prevActiveStep > 1 ? prevActiveStep : 1
            })
        } else {
            setActiveStep(0)
        }
    }, [authenticated])

    useEffect(() => {
        if (currentChannel) setActiveStep(2)
    }, [currentChannel])

    return (
        <Stepper activeStep={activeStep} orientation="vertical">
            <Step key='login-step'>
                <StepLabel>
                    Sign and Login
                </StepLabel>
                <div className='custom-step-content'>
                    <Login
                        authenticated={authenticated}
                        onFinish={(_authenticated, _userInfo) => {
                            setAuthenticated(_authenticated)
                            setUserInfo(_userInfo)
                        }}
                    />
                </div>
            </Step>

            <Step key='relations-step'>
                <StepLabel>
                    Recommend and Following
                </StepLabel>
                <div className='custom-step-content'>
                    <Relations
                        authenticated={authenticated}
                        userInfo={userInfo}
                        setCurrentChannel={setCurrentChannel}
                    />
                    <div className='chat-btn-wrap'>
                        <Button
                            variant='contained'
                            onClick={() => setActiveStep(prev => prev + 1)}
                        >
                            Chat
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => setActiveStep(prev => prev - 1)}
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </Step>

            <Step key='chat-step'>
                <StepLabel>
                    Channels
                </StepLabel>
                <div className='custom-step-content'>
                    <Channels
                        authenticated={authenticated}
                        userInfo={userInfo}
                        currentChannel={currentChannel}
                        setCurrentChannel={setCurrentChannel}
                    />
                </div>
            </Step>
        </Stepper>
    )
}

export default Guide