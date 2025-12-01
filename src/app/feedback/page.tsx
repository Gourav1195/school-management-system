"use client";
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Switch, FormControlLabel, List, ListItem } from "@mui/material";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "@/context/AuthContext";

interface Feedback {
  id: number;
  memberId?: string;
  message: string;
  createdAt: string;
  isAnonymous?: boolean;
}

// Simulate logged-in memberId

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const { memberId : MEMBER_ID } = useAuth();

  const fetchFeedbacks = async () => {
    const res = await fetch("/api/feedback");
    const data: Feedback[] = await res.json();
    // only show feedbacks by this member
    const myFeedbacks = data.filter(f => f.memberId === MEMBER_ID);
    setFeedbacks(myFeedbacks);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const res = await apiClient("/api/feedback", {
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        isAnonymous,
        memberId: MEMBER_ID,
      }),
    });
    if(!res) return;
    if (res.ok) {
      const newFeedback: Feedback = await res.json();
      setFeedbacks(prev => [...prev, newFeedback]);
      setMessage("");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
      <Typography variant="h5" mb={2}>Your Feedback</Typography>
      
      <TextField
        fullWidth
        label="Message"
        multiline
        rows={4}
        value={message}
        onChange={e => setMessage(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={<Switch checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />}
        label="Send as anonymous"
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleSubmit}>Send Feedback</Button>

      <List sx={{ mt: 4 }}>
        {feedbacks.map(f => (
          <ListItem key={f.id}>
            <Box>
              <Typography variant="body2">
                {f.isAnonymous ? "Anonymous" : "You"}: {f.message}
              </Typography>
              <Typography variant="caption">
                {new Date(f.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
