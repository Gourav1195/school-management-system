'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
  Box,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { Edit, Save, MenuBook } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/app/utils/apiClient';
import { keyframes } from '@mui/system';
import Close from '@mui/icons-material/Close';

interface Item {
  id: string;
  name?: string;
  code?: string;
  label?: string;
  academicYearId?: string;
}

const EditSubjects = () => {
  const [open, setOpen] = useState(false);

  const [subjects, setSubjects] = useState<Item[]>([]);
  const [academicYears, setAcademicYears] = useState<Item[]>([]);
  const [tests, setTests] = useState<Item[]>([]);

  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');

  const [editedSubject, setEditedSubject] = useState<Item | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editedAcademicYear, setEditedAcademicYear] = useState<Item | null>(null);

  const [editedTest, setEditedTest] = useState<Item | null>(null);

  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [editTestId, setEditTestId] = useState<string | null>(null);
  const [editAcademicYearId, setEditAcademicYearId] = useState<string | null>(null);

  const fetchAllData = async () => {
    const res = await apiClient(`/api/academic`);
    if (!res) {
      toast.error('Unable to fetch data');
      return;
    }
    const data = await res.json();
    setSubjects(data.subjects);
    setAcademicYears(data.academicYears);
    setTests(data.tests);
  };

  const handleCreate = async (type: 'subject' | 'academicYear' | 'test', data: object) => {
    const res = await apiClient(`/api/academic`, {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    });
    if (!res) return toast.error('Failed to create');
    fetchAllData();
    if (type === 'subject') setNewSubject({ name: '', code: '' });
    if (type === 'academicYear') setNewAcademicYear('');
    if (type === 'test') setNewTestName('');
  };
  const handleUpdate = async (id: string, type: 'subject' | 'test' | 'academicYear' ) => {
    let data:Item|null = null;
    if(type === 'subject' && editedSubject){
      data = editedSubject;
    } 
    else if(type === 'test' && editedTest){
      data = editedTest;
    }
    else if(type === 'academicYear' && editedAcademicYear){
      data = editedAcademicYear;
    }
    else{
      return;
    }
    const res = await apiClient(`/api/academic/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        type,
        data
      }),
    });
    if (!res) return toast.error('Update failed');
    if (type === 'test') {
      setEditTestId(null);
      setEditedTest(null);
      }
    if (type === 'academicYear') {
        setEditAcademicYearId(null);
        setEditedAcademicYear(null);
      }
    if (type === 'subject') {
        setEditSubjectId(null);
        setEditedSubject(null);
      }

    toast.success('Updated successfully');
    await fetchAllData();
  };

  useEffect(() => {
    if (open) fetchAllData();
  }, [open]);

  const colorCycle = keyframes`
    0% { color: #0D47A1; }      // Dark blue
    50% { color: #47779dff; }     // Light blue
    100% { color: #0D47A1; }    // Back to dark blue
  `;
  return (
    <>
      <Tooltip title="Manage Subjects & Tests" arrow>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            animation: `${colorCycle} 5s ease-in-out infinite`,
          }}
        >
          <MenuBook />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Group Items</DialogTitle>
        <DialogContent dividers>

          {/* Academic Years */}
          <Typography variant="h6">Academic Years</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="New Year" size="small" value={newAcademicYear} onChange={(e) => setNewAcademicYear(e.target.value)} />
            <Button disabled={!newAcademicYear} variant="contained" onClick={() => handleCreate('academicYear', { label: newAcademicYear })}>Add</Button>
          </Stack>
          <Box mt={1} sx={{ display: 'flex', flexDirection: 'row', flexWrap:'wrap', gap: 1 }}>
            {academicYears?.map((y, index:number) => (
              <Paper key={y.id} sx={{ p: 1, px: 2, mr: 1, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#dfeffdff', }}>
                {editAcademicYearId  === y.id ? (
                  <>
                    <TextField
                      size="small"
                      value={editedAcademicYear?.label || ''}
                      onChange={(e) => setEditedAcademicYear({ ...y, label: e.target.value })}
                    />
                    <IconButton onClick={() => handleUpdate(y.id, 'academicYear')}><Save /></IconButton>
                    <IconButton onClick={() => { setEditAcademicYearId(null); setEditedAcademicYear(null); }}><Close /></IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body2">{y.label}</Typography>
                    <IconButton onClick={() => { setEditAcademicYearId(y.id); setEditedAcademicYear(y); }}><Edit /></IconButton>
                  </>
                )}
              </Paper>
            ))}
          </Box>

          {/* Tests */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6">Tests</Typography>
          {/* <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="New Test" size="small" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
            <Button variant="contained" onClick={() => handleCreate('test', { name: newTestName })}>Add</Button>
          </Stack>
          <Box mt={1} sx={{ display: 'flex', flexDirection:'row'}}>
            {tests?.map((t) => (
              <Paper key={t.id} sx={{p:1, mr:1}}>
              <Typography key={t.id} variant="body2">{t.name}</Typography>
              </Paper>
            ))}
          </Box> */}

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="New Test"
              size="small"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
            />
            <TextField
              select
              // label="Academic Year"
              size="small"
              SelectProps={{ native: true }}
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
            >
              <option value="">Select Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={!newTestName || !selectedYearId}
              onClick={() => handleCreate('test', { name: newTestName, academicYearId: selectedYearId })}
            >
              Add
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1, flexWrap:'wrap', gap: 2 }}>
            {tests?.map((t: any, index: number) => {
              const year = academicYears.find((y) => y.id === t.academicYearId);
              return (
                <Paper key={t.id} sx={{ py: 1, px: 2, mr: 1, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#dfeffdff', }}>
                  {editTestId  === t.id ? (
                    <>
                      <TextField
                        size="small"
                        value={editedTest?.name || ''}
                        onChange={(e) => setEditedTest({ ...t, name: e.target.value })}
                      />
                      <IconButton onClick={() => handleUpdate(t.id, 'test')}><Save /></IconButton>
                      <IconButton onClick={() => { setEditTestId(null); setEditedTest(null); }}><Close /></IconButton>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2">
                        {t.name} <span style={{ color: '#888' }}>({year?.label || 'Unknown Year'})</span>
                      </Typography>
                      <IconButton onClick={() => { setEditTestId(t.id); setEditedTest(t); }}><Edit /></IconButton>
                    </>
                  )}
                </Paper>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />
          {/* Subjects */}
          <Typography variant="h6">Subjects</Typography>

          <Stack direction="row" spacing={2} alignItems="center" my={1}>
            <TextField label="New Subject" size="small" value={newSubject.name} onChange={(e) => setNewSubject((prev) => ({ ...prev, name: e.target.value }))} />
            <TextField label="Code" size="small" value={newSubject.code} onChange={(e) => setNewSubject((prev) => ({ ...prev, code: e.target.value }))} />
            <Button disabled={!newSubject.name || !newSubject.code} variant="contained" onClick={() => handleCreate('subject', newSubject)}>Add</Button>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            alignItems="flex-start"
            rowGap={2}
          >
            {subjects?.length ? (
              subjects.slice(0, visibleCount).map((subject: any, index: number) => (
                <Paper
                  key={subject.id}
                  sx={{
                    p: 1.5,
                    // minWidth: 240,
                    // maxWidth: 280,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexGrow: 1,
                    backgroundColor: '#dfeffdff',
                  }}
                >
                  {editSubjectId === subject.id ? (
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editedSubject?.name || ''}
                        onChange={(e) => setEditedSubject((prev) => ({ ...prev!, name: e.target.value }))}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        value={editedSubject?.code || ''}
                        onChange={(e) => setEditedSubject((prev) => ({ ...prev!, code: e.target.value }))}
                      />
                      <IconButton onClick={() => handleUpdate(subject.id, 'subject')}><Save /></IconButton>
                      <IconButton onClick={() => { setEditSubjectId(null); setEditedSubject(null); }}>
                        <Close />
                      </IconButton>

                    </Stack>

                  ) : (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: '100%' }}
                      spacing={1}
                    >
                      <Typography noWrap>
                        {subject.name} <span style={{ color: '#888' }}>({subject.code})</span>
                      </Typography>
                      <IconButton onClick={() => { setEditSubjectId(subject.id); setEditedSubject(subject); }}>
                        <Edit />
                      </IconButton>
                    </Stack>
                  )}
                </Paper>
              ))
            ) : (
              [...Array(visibleCount || 3)].map((_, i: number) => (
                <Skeleton key={i} variant="rectangular" height={60} width={240} sx={{ borderRadius: 1 }} />
              ))
            )}
            {visibleCount < subjects.length && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setVisibleCount((prev) => prev + 5)}
                sx={{ mt: 1 }}
              >
                Load More Subjects
              </Button>
            )}
          </Stack>

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditSubjects;
