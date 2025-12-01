// inside your TestConfigForm
'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  FormHelperText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';
import { useQuestionContext } from '@/context/QuestionContext';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface QuestionCounts {
  mcq: number;
  fillBlank: number;
  short: number;
  long: number;
}

export default function TestConfigForm({ previewMode }: { previewMode: boolean }) {
  const [topic, setTopic] = useState('');
  const [classLevel, setClassLevel] = useState<number | ''>(5);
  const [counts, setCounts] = useState<QuestionCounts>({
    mcq: 0,
    fillBlank: 0,
    short: 0,
    long: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const {
    setQuestions,
    currentQuestions,
    previousSets,
    customText,
    setCustomText,
    addToHistory
  } = useQuestionContext();

  const totalQuestions = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const handleCountChange =
    (field: keyof QuestionCounts) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(0, Math.min(10, Number(e.target.value)));
      setCounts((prev) => ({ ...prev, [field]: isNaN(val) ? 0 : val }));
    };

  const buildPrompt = () => {
    const sections: string[] = [];
    if (counts.mcq) sections.push(`${counts.mcq} MCQ`);
    if (counts.fillBlank) sections.push(`${counts.fillBlank} fill-in-the-blank`);
    if (counts.short) sections.push(`${counts.short} short answer`);
    if (counts.long) sections.push(`${counts.long} long answer`);

    return `Generate EXACTLY ${totalQuestions} questions for Class ${classLevel} on the topic of ${topic} must be from NCERT:
  - ${sections.join(`\n- `)}

  Return ONLY a valid JSON array of objects like:
  [
    {
      "question": "MCQ Question here?",
      "options": ["a. Option A", "b. Option B", "c. Option C", "d. Option D"],
    },
    {
      "question": "Fill-in-the-blank or short/long answer here."
    }
  ]

  Important rules:
  - MCQ questions MUST include exactly 4 distinct options in the "options" field.
  - Do NOT include answers, explanations, or anything outside the JSON array.
  - Do NOT add any Markdown or code block formatting.`;
  };


  const parseFallback = (text: string) => {
    try {
      const match = text.match(/\[[\s\S]*?\]/);
      if (!match) return [];
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Fallback parse failed:', err);
      return [];
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!topic.trim() || classLevel === '' || totalQuestions === 0) {
      setError('Fill all fields and select at least one question count.');
      return;
    }

    const prompt = buildPrompt();

    try {
      const res = await apiClient(
        `/api/generate-question`,
        {
          method: 'POST',
          body: JSON.stringify({ prompt }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (!res) return;
      const data = await res.json();

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.questions)
          ? data.questions
          : parseFallback(data.raw?.choices?.[0]?.message?.content || '');

      setQuestions(arr);
      addToHistory(arr);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI response.');
    }
  };

  return (
    <Box maxWidth={670} mx="auto" mt={4} p={3} boxShadow={2} borderRadius={2}>

      {!previewMode && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Configure Your Test</Typography>
            <IconButton onClick={() => setShowHistory(true)}>
              <HistoryIcon />
            </IconButton>
          </Box>


          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={classLevel}
                  label="Class"
                  onChange={(e) => setClassLevel(Number(e.target.value) || '')}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {[{ label: 'MCQ', key: 'mcq' }, { label: 'Fill in the Blanks', key: 'fillBlank' }, { label: 'Short Answer', key: 'short' }, { label: 'Long Answer', key: 'long' }].map(
              ({ label, key }) => (
                <Grid size={{ xs: 6, md: 3 }} key={key}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`${label} (0–10)`}
                    inputProps={{ min: 0, max: 10 }}
                    value={counts[key as keyof QuestionCounts]}
                    onChange={handleCountChange(key as keyof QuestionCounts)}
                  />
                </Grid>
              )
            )}

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                Total questions: {totalQuestions} / 10
              </Typography>
              {error && <FormHelperText error>{error}</FormHelperText>}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={totalQuestions === 0}
              >
                Generate / Create Test
              </Button>
            </Grid>
          </Grid>

          <Box mt={3}
            onCopy={(e) => {
              e.preventDefault();
              const textToCopy = currentQuestions
                .map((item, idx) => {
                  let q = `${idx + 1}. ${item.question.trim()}`;
                  if (item.options && item.options.length) {
                    q += "\n" + item.options.map(opt => `- ${opt.trim()}`).join("\n");
                  }
                  return q;
                })
                .join("\n\n");

              e.clipboardData.setData('text/plain', textToCopy.trim());
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">AI Questions</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  const textToCopy = currentQuestions
                    .map((item, idx) => {
                      let q = `${idx + 1}. ${item.question.trim()}`;
                      if (item.options && item.options.length) {
                        q += "\n" + item.options.map(opt => `- ${opt.trim()}`).join("\n");
                      }
                      return q;
                    })
                    .join("\n\n"); // double line break between questions

                  navigator.clipboard.writeText(textToCopy.trim());
                }}
              >
                Copy All
              </Button>
            </Box>

            {currentQuestions &&
              currentQuestions.map((item, idx) => (
                <Box key={idx} mt={1}>
                  {/* <Typography sx={{ whiteSpace: "pre-line" }}> */}
                  <Typography sx={{ userSelect: 'text', whiteSpace: 'normal' }}>

                    {idx + 1}. {item.question}
                  </Typography>
                  {item.options && (
                    <ul style={{ marginLeft: "1.2em", paddingLeft: 0 }}>
                      {item.options.map((opt, i) => (
                        <li key={i}>
                          <Typography variant="body2">{opt}</Typography>
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>
              ))}
          </Box>

          <Box mt={3}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              label="Paste your questions to Preview & Print 🖨️"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </Box>

        </>)}
      {previewMode && (
        <>
          <Box
            sx={{
              // background: "#f9f9fb",
              // borderRadius: 2,
              // p: 3,
              height: '100%',
              // boxShadow: 1,
              // border: "1px solid #e0e0e0",
              fontFamily: "inherit",
              fontSize: "1.08rem",
              color: "#222",
              // whiteSpace: "pre-line",
              overflowX: "auto"
            }}
          >
            {customText ? (
              <Typography component="div" sx={{ whiteSpace: "pre-line" }}>
                {customText.trim()}
              </Typography>
            ) : (
              <Typography color="text.secondary" align="center">
                Nothing to preview yet.
              </Typography>
            )}
          </Box>

        </>
      )}



      <Dialog open={showHistory} onClose={() => setShowHistory(false)}>
        <DialogTitle>Last 3–5 Generated Sets</DialogTitle>
        <DialogContent>
          {!previousSets?.length && <Typography>No history found.</Typography>}
          {previousSets && previousSets.map((set: { question: string; options?: string[] }[], idx: number) => (
            <Box key={idx} mt={2} p={1} border={1} borderRadius={2} borderColor="grey.300">
              <Typography fontWeight={600}>Set {idx + 1}</Typography>
              {set.map((q, i: number) => (
                <Box key={i}>
                  <Typography variant="body2">
                    {i + 1}. {q.question}
                  </Typography>
                  {q.options && (
                    <ul style={{ marginLeft: '1.2em', paddingLeft: 0 }}>
                      {q.options.map((opt, j) => (
                        <li key={j}>
                          <Typography variant="body2">{opt}</Typography>
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
