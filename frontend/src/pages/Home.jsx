import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, TextField } from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import '../App.css'
import { AuthContext } from '../contexts/AuthContext'



const Home = () => {

    const navigate = useNavigate()
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);
    const handleJoinVideoCall = async()=>{
        await  addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
    <>
    
    <div className="navBar">
        <div style={{display:'flex', alignItems:'center'}}>
            <h2>Root Call</h2>
        </div>
        <div style={{display: 'flex', alignItems:'center'}}>
            <IconButton onClick={()=>{
              navigate("/history")
            }}>
              <RestoreIcon/>
            </IconButton>
              <p>History</p>
            <button onClick={()=>{
              localStorage.removeItem("token")
              navigate("/auth")
            }}>
              Logout
            </button>
        </div>
    </div>
    <div className="meetContainer">
      <div className="leftPannel">
        <div>
          <h2 style={{marginBottom:"25px"}}>Providing Quality video call </h2>
          <div style={{display: 'flex', gap:"10px"}}>
              <TextField onChange={e => setMeetingCode(e.target.value)}></TextField>
              <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
          </div>
        </div>
      </div>
      <div className="rightPannel">
        <img src="/VCimage.png" alt="vc image" />
      </div>
    </div>
    </>
  )
}

export default withAuth(Home)