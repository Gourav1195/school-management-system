'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Login failed');
        setLoading(false);
        return;
      }

      login(data.token);
      setSuccess(true);

      // Optional: redirect after a short delay
      setTimeout(() => router.push('/'), 1000);

    } catch (err) {
      console.log(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'backgroud.default',
        p: 2
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          p: 4,
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              bgcolor: '#4361ee',
              color: 'white',
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Lock fontSize="medium" />
          </Box>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Sign in to continue to your account
          </Typography>
        </Box>

        {error && (
          <Box
            sx={{
              bgcolor: '#ffebee',
              color: '#f44336',
              p: 1.5,
              borderRadius: 2,
              mb: 2,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box component="span" sx={{ fontSize: 14 }}>{error}</Box>
          </Box>
        )}

        {success && (
          <Box
            sx={{
              bgcolor: '#e8f5e9',
              color: '#43a047',
              p: 1.5,
              borderRadius: 2,
              mb: 2,
              textAlign: 'left',
              fontSize: 14,
            }}
          >
            Login successful! Redirecting...
          </Box>
        )}

        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Button
            size="small"
            sx={{ textTransform: 'none', fontSize: 14 }}
          >
            Forgot password?
          </Button>
        </Box>

        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#4361ee',
            '&:hover': { bgcolor: '#3a56d4' },
            fontSize: 16,
            fontWeight: 500,
            mt: 1
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            success ? 'Redirecting...' : 'Sign In'
          )}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Don&apos;t have an account?{' '}
          <Button
            size="small"
            onClick={() => router.push(`/auth/register`)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              color: '#4361ee',
              p: 0,
              pb:0.6,
              minWidth: 'auto'
            }}
          >
            Sign up
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}