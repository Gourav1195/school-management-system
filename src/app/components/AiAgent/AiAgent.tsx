'use client';

import { useState } from 'react';
import {
  Box, TextField, Button, Typography,
  CircularProgress, Paper, Stack
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';

export default function AIChatPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await apiClient('/api/ai/querry', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // },
        body: JSON.stringify({ query }),
      });
      if (!res) return; 
      const data = await res.json();
      console.log('AI response:', data.response);

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const message = data?.response?.message || 'No response from AI';
      setResponse(message);
    } catch (err: any) {
      console.error('AI Chat error:', err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ask ERP AI
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask something like 'Show total salary paid this month'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </Stack>

      {loading && <CircularProgress />}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}

      {response && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, bgcolor: '#f0f4ff' }}>
          <Typography variant="subtitle2" gutterBottom>AI says:</Typography>
          <Typography>{response}</Typography>
        </Paper>
      )}
    </Box>
  );
}
