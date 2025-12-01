'use client'

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { 
  Person,
  Email,
  Lock,
  Business,
  Badge
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/all';
import Link from 'next/link';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  tenantName: string;
}

const defaultForm: RegisterForm = {
  name: '',
  email: '',
  password: '',
  role: Role.Admin,
  tenantName: '',
};

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterForm>(defaultForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name as string]: value as string }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Registration failed');
        setLoading(false);
        return;
      }

      if (data.token) {
        login(data.token);
        setSuccess(true);
      } else {
        setError('Registration succeeded but no token returned.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Box 
        component="form" 
        onSubmit={handleRegister}
        sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          p: 4,
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
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
            <Badge fontSize="medium" />
          </Box>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Create Institution Account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Register as a Admin to manage your institution
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Registration successful! Redirecting...
          </Alert>
        )}

        <TextField
          fullWidth
          label="Full Name"
          name="name"
          variant="outlined"
          value={form.name}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          variant="outlined"
          value={form.email}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Institution Name"
          name="tenantName"
          variant="outlined"
          value={form.tenantName}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Business sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            value={form.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleSelectChange}
              label="Account Type"
              required
              sx={{ textAlign: 'left' }}
            >

              {[ 'Admin', 'Moderator', 'Editor', 'Viewer', 'Finance' ].map((c) => (
                <MenuItem key={c} value={c} sx={{ color: '#6D6976' }}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            'Create Institution Account'
          )}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link href={`/auth/login`} style={{ textDecoration: 'none' }}>
            <Button 
              size="small" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 500,
                color: '#4361ee',
                p: 0,
                pb:0.6,
                minWidth: 'auto'
              }}
            >
              Sign in
            </Button>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
