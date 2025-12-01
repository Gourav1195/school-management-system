'use client'
import { Box, Button, Container, Typography, Tabs, Tab, TextField } from '@mui/material'
import { useState } from 'react'
import QuestionCard from './QuestionCard'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import AIChatBot from './AIChatBot'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import Head from 'next/head'

type Question = {
  id: string
  questionText: string
  questionType: 'mcq' | 'short' | 'long'
  options?: string[]
}

export default function TestMakerPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const [textName, setTextName] = useState<string>('')

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
      },
    ])
  }

  const handleChange = (id: string, updated: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updated } : q))
    )
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const reordered = [...questions]
    const [removed] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, removed)
    setQuestions(reordered)
  }

  return (
     <>
      <Head>
        <title>AI Test Generator | EquaSeed</title>
        <meta name="description" content="Generate quizzes and exams with lightning speed using our AI-powered test maker. Save hours and craft better assessments in seconds." />
      </Head>
      <main>
    <Container maxWidth="md" sx={{ py: 4, '& *': { fontStyle: 'Times New Roman', } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="print-hide" sx={{'@media print': { display: 'none' } }}>
        <Typography variant="h4" >
          🧪 {previewMode ? 'Test Preview' : 'Create New Test'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mb: 1, }}>
          <Button variant="outlined" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? 'Back to Edit' : 'Preview'}
          </Button>
          {previewMode && (
            <Button variant="contained" onClick={() => window.print()}>
              Print
            </Button>
          )}
        </Box>
      </Box>
        

      {!previewMode && (
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'
            }
          }}
        >
          {/* Manual Tab - Subtle enhancement */}
          <Tab
            icon={<EditIcon fontSize="small" />}
            label="Manual Entry"
            iconPosition="start"
            sx={{
              minHeight: 48,
              fontSize: '0.875rem',
              color: (theme) =>
                tabIndex === 0
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.05)'
              }
            }}
          />

          {/* AI Tab - Gradient without animation */}
          <Tab
            icon={<AutoAwesomeIcon fontSize="small" />}
            label="AI Generate"
            iconPosition="start"
            sx={{
              minHeight: 48,
              fontSize: '0.875rem',
              background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
              color: 'white !important',
              borderRadius: '8px',
              mx: 0.5,
              boxShadow: '0 2px 8px rgba(37, 117, 252, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              },
              '&:hover::before': {
                animation: 'shine 1.5s',
              },
              '@keyframes shine': {
                '100%': { left: '100%' }
              }
            }}
          />
        </Tabs>
      )}

       {!previewMode ?  
      (
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', mt:1}}>
      <TextField
      label="Name of the test"
      value={textName}
      onChange={(e) => setTextName(e.target.value)}
      />
      </Box> )  :   (  
      <Typography sx={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>
        {textName}
      </Typography>)}

      {!previewMode ? (
        <>
          <Box mt={4}>
            <Box sx={{ width: '100%', typography: 'body1', mt: 4 }}>

              {tabIndex === 0 && (
                <Box>
                  {/* Component or JSX for AI question generation */}
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions">
                      {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                          {questions.map((q, index) => (
                            <Draggable key={q.id} draggableId={q.id} index={index}>
                              {(provided) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <QuestionCard
                                    index={index}
                                    question={q}
                                    onDelete={() => deleteQuestion(q.id)}
                                    onChange={(updated) => handleChange(q.id, updated)}
                                  />
                                </Box>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>
              )}

            </Box>
          </Box>

        </>
      ) : (
        tabIndex === 0 ? (
          questions.map((q, index) => (
            <Box key={q.id} mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 1,
                  backgroundColor: '#f9f9f9',
                  minHeight: '60px',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Question {index + 1}.
                </Typography>
                <Typography variant="body1">{q.questionText}</Typography>
              </Box>

              {q.questionType === 'mcq' &&
                q.options?.map((opt, i) => (
                  <Typography key={i} sx={{ pl: 2 }}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </Typography>
                ))}

              {q.questionType === 'short' && (
                <Typography color="text.secondary">__________</Typography>
              )}

              {q.questionType === 'long' && (
                <Typography color="text.secondary">[Write 5–6 lines]</Typography>
              )}
            </Box>
          ))
        ) : (
          <Box>
            <AIChatBot previewMode={previewMode} />
          </Box>
        )
      )}

      {tabIndex === 1 && !previewMode && (
        <Box>
          <AIChatBot previewMode={previewMode} />
        </Box>
      )}

      {!previewMode && tabIndex === 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button variant="contained" onClick={addQuestion}>
            ➕ Add Question
          </Button>
        </Box>
      )}

    </Container>      
    </main>
  </>
  )
}
