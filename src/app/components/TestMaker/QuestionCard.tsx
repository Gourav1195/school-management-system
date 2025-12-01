'use client'
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { Delete, DragIndicator } from '@mui/icons-material'

type QuestionType = 'mcq' | 'short' | 'long'

type Props = {
  index: number
  question: {
    questionText: string
    questionType: QuestionType
    options?: string[]
  }
  onChange: (updated: Partial<Props['question']>) => void
  onDelete: () => void
}

export default function QuestionCard({ index, question, onChange, onDelete }: Props) {
  const handleOptionChange = (value: string, idx: number) => {
    const updated = [...(question.options || ['', '', '', ''])]
    updated[idx] = value
    onChange({ options: updated })
  }

  return (
    <Box
      p={2}
      mb={2}
      border="1px solid #ccc"
      borderRadius={2}
      display="flex"
      gap={2}
      alignItems="flex-start"
      width={'100%'}
      sx={{
        // '& .MuiInputBase-root': {
        //   fontSize: '0.875rem',
        //   padding: '4px 8px',
        // },
        // '& .MuiInputLabel-root': {
        //   fontSize: '0.75rem',
        // }
      }}
    >
      <DragIndicator sx={{ cursor: 'grab', mt: 1 }} />

      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" component={'span'}>Question {index + 1}</Typography>
          <Select
            size="small"
            value={question.questionType}
            onChange={(e) => onChange({ questionType: e.target.value as QuestionType })}
          >
            <MenuItem value="mcq">MCQ</MenuItem>
            <MenuItem value="short">Short Answer</MenuItem>
            <MenuItem value="long">Long Answer</MenuItem>
          </Select>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          label="Enter your question"
          value={question.questionText}
          onChange={(e) => {
            // e.preventDefault();
            onChange({ questionText: e.target.value });
          }}
          sx={{ mt: 2, fontSize:'14px' }}
          // variant="outlined"
          size="small"
          // inputProps={{
          // style: {
          //   whiteSpace: 'pre-line',
          // },}}
        />

        {question.questionType === 'mcq' && (
          <Box mt={2}>
            {(question.options || []).map((opt, idx) => (
              <TextField
                key={idx}
                fullWidth
                label={`Option ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={(e) => handleOptionChange(e.target.value, idx)}
                sx={{ mt: 1, '& .MuiInputBase-root': {
                  fontSize: '0.875rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.75rem',
                } }}
                  size="small"

              />
            ))}
          </Box>
        )}

        {question.questionType === 'short' && (
          <TextField
            fullWidth
            label="Expected short answer"
            sx={{ mt: 2 }}
          />
        )}

        {question.questionType === 'long' && (
          <TextField
            fullWidth
            label="Answer guidelines or keywords"
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      <IconButton onClick={onDelete}>
        <Delete color="error" />
      </IconButton>
    </Box>
  )
}
