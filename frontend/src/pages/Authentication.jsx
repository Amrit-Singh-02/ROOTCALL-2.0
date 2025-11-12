import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState()
  const [message, setMessage] = React.useState()
  const [formState, setFormState] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  const {handleRegister, handleLogin} = React.useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ RANDOM BACKGROUND IMAGE - Using Lorem Picsum
  // Generates a random seed for a unique image on every page load
  const [backgroundImage] = React.useState(() => {
    const randomSeed = Math.random().toString(36).substring(7);
    const imageUrl = `https://picsum.photos/seed/${randomSeed}/1920/1080`;
    // console.log("🖼️ Background Image URL:", imageUrl);
    return imageUrl;
  });

  let handleAuth = async()=>{
    try{
      if(formState === 0){
        let result = await handleLogin(username, password)
      }
      if(formState === 1){
        let result = await handleRegister(name, username, password)
        
        setUsername("")
        setMessage(result)
        setOpen(true)
        setError("")
        setFormState(0)
        setPassword("")
        setName("")
      }
    }catch(err){
      let message = (err.response.data.message);
      setError(message)
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* ✅ FULL SCREEN BACKGROUND WITH RANDOM LOREM PICSUM IMAGE */}
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c3e50', // Fallback dark color if image fails to load
        }}
      >
        <CssBaseline />
        
        {/* ✅ CENTERED FORM CARD - Semi-transparent white background */}
        <Paper 
          elevation={6} 
          sx={{ 
            width: { xs: '90%', sm: '500px', md: '450px' },
            padding: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)', // 95% white, 5% transparent
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* ✅ Logo - clickable to navigate to home "/" */}
            <img
              src="/logoB.png"
              alt="Root Call Logo"
              onClick={() => navigate('/')}
              style={{
                cursor: 'pointer',
                width: '200px',
                marginBottom: '40px',
              }}
            />

            {/* Avatar with lock icon */}
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            {/* Sign In / Sign Up Toggle Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button 
                variant={formState === 0 ? "contained" : "outlined"} 
                onClick={() => {setFormState(0)}}
              >
                Sign In
              </Button>
              <Button 
                variant={formState === 1 ? "contained" : "outlined"} 
                onClick={() => {setFormState(1)}}
              >
                Sign Up
              </Button>
            </Box>

            {/* Form Fields */}
            <Box component="form" noValidate sx={{ width: '100%' }}>
              
              {/* Full Name field - only shows during Sign Up (formState === 1) */}
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullname"
                  label="Full Name"
                  name="fullname"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              
              {/* Username field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              {/* Password field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Error message - only shows when error exists */}
              {error && <p style={{color:"red", marginTop: '10px'}}>{error}</p>}

              {/* Login/Register Button */}
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Success message snackbar - shows after successful registration */}
      <Snackbar 
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />

    </ThemeProvider>
  );
}