'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Stack,
  Container
} from '@mui/material';
import { 
  Lock as LockIcon, 
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const UnauthorizedPage = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Fix for "NextRouter was not mounted" error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get error message from search params (app directory)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const errorMessage = searchParams?.get('message') || 
    "You don't have permission to access this page";

  const handleGoBack = () => {
    if (mounted) router.back();
  };

  const handleGoHome = () => {
    if (mounted) router.push('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #d0e0ff 100%)',
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#ffebee',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              border: '5px solid #f4433620'
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: '#f44336' }} />
          </Box>
          
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            gutterBottom
            sx={{ color: '#f44336', mb: 1 }}
          >
            Access Denied
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}
          >
            {errorMessage}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}
          >
            Please contact your administrator if you believe this is an error.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Go Back
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 500,
                backgroundColor: '#4361ee',
                '&:hover': {
                  backgroundColor: '#3a56d4'
                }
              }}
            >
              Go to Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;