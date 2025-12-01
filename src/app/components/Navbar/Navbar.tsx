'use client'
import { AppBar, Box, Button, FormControlLabel, IconButton, Menu, MenuItem, Switch, Toolbar, Typography, styled } from '@mui/material'
import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { Settings,  } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun
import PricingPlans from '../Modals/Plan';
// import Switch from '@mui/material/Switch';
interface NavbarProps {
  handleDrawerToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // const [pricingPlansModal, setPricingPlansModal] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);
  const { mode, toggleMode } = useAppTheme();
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  }
  
  const router = useRouter();
  const { logout, memberId, isPremium } = useAuth();
  // console.log('memberId', memberId);

  return (
    <AppBar position="fixed" sx={{
    bgcolor: mode==='light'?'#fff':'000',
    // backgroundImage: 'linear-gradient(45deg,rgb(80, 68, 245) 0%,rgb(102, 85, 253) 100%)',
    // color: '#000',
    zIndex: (theme) => theme.zIndex.drawer + 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
    <Toolbar>
        {/* Mobile menu button */}
        <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2,
            color: 'grey',
            display: { md: 'none' }
            }}
        >
        <MenuIcon />
        </IconButton>

        {/* Dummy navbar content */}
        <Box
        onClick={() => router.push('/')}
        sx={{
            bgcolor: '#ffffff',
            color: 'primary.dark',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            mr: 1,
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
        }}>
        EquaSeed
        </Box>
        <Typography
        variant="h6"
        component="div"
        sx={{
            fontWeight: 700,
            letterSpacing: 1.2,
            color: 'text.primary',
        }}
        >
        Portal
        </Typography>
    {/* </Box> */}

        <Box sx={{ display: 'flex', marginLeft: 'auto', marginRight: '1rem', alignItems: 'center' }}>
            
<ThemedSwitch
  checked={mode === 'dark'}
  onChange={toggleMode}
  icon={<Brightness7Icon fontSize="small" sx={{color:'#f7d474ff'}} />}
  checkedIcon={<Brightness4Icon fontSize="small" sx={{color:'lightblue'}}  />}
/>                
        <IconButton  onClick={() => { router.push(`/settings`); }}>
            <Settings sx={{fontSize:'26px'}} />
        </IconButton>
        <Box sx={{ position: 'relative' }}>
            <IconButton
            id="account-button"
            aria-controls="account-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuOpen}
            >
            <AccountCircleIcon sx={{ fontSize: '26px' }} />
            </IconButton>
            <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            >
            <MenuItem onClick={() => { handleMenuClose(); router.push(`/member/${memberId}`); }}>
                View Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); router.push(`/feedback`); }}>
                Feedback
            </MenuItem>
            {/* <MenuItem>
              {isPremium?(<></>):(<PricingPlans />)}   
            </MenuItem> */}
            <MenuItem onClick={() => { logout(); router.push(`/auth/login`); }}>
                Logout
            </MenuItem>
            </Menu>
        </Box>
        </Box>
      
    </Toolbar>
    </AppBar>
  )
}

export default Navbar


const ThemedSwitch = styled(Switch)(({ theme }) => ({
  width: 58,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 7,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#ffd600',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'light' ? '#ffd600' : '#003892',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .MuiSwitch-track': {
    borderRadius: 20,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    opacity: 1,
  },
}));
