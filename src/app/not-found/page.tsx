'use client'
import { Button, Box, Typography, Container, useTheme } from '@mui/material';
import Link  from 'next/link';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        p: 3
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 300,
                height: 300,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    color="primary"
                    sx={{ fontSize: '5rem', lineHeight: 1 }}
                  >
                    4
                  </Typography>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography
                      variant="h1"
                      fontWeight="bold"
                      color="white"
                      sx={{ fontSize: '3rem', lineHeight: 1 }}
                    >
                      0
                    </Typography>
                  </Box>
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    color="primary"
                    sx={{ fontSize: '5rem', lineHeight: 1 }}
                  >
                    4
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              color="white"
              gutterBottom
              sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }}
            >
              Page Not Found
            </Typography>
            
            <Typography
              variant="h6"
              component="p"
              color="rgba(255, 255, 255, 0.9)"
              sx={{ mb: 3, maxWidth: 500 }}
            >
              The page you&apos;re looking for doesn&apos;t exist or has been moved. 
              Please check the URL or navigate back to our homepage.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Link href={'/'}>
              <Button
                // component={Link}
                // to="/"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                  }
                }}
              >
                Return Home
              </Button>
              </Link>
              <Link href={'/'}>
              <Button
                // component={Link}
                // to="/contact"
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Contact Support
              </Button>
              </Link>
            </Box>
            
            <Typography
              variant="body2"
              color="rgba(255, 255, 255, 0.7)"
              sx={{ mt: 4, maxWidth: 500 }}
            >
              Error code: 404 | Not Found
            </Typography>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;