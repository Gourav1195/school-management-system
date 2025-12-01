import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Skeleton,
} from '@mui/material';
import { Group } from '@/types/all';
import { apiClient } from '@/app/utils/apiClient';
import toast from 'react-hot-toast';

type Props = { group: Group | null };

const Marks: React.FC<Props> = ({ group }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Fetch subjects and years initially
  useEffect(() => {
  const fetchMeta = async () => {
    try {
      const res = await apiClient(`/api/academic`);
      if (!res) throw new Error('unable to fetch metadata');
      const data = await res.json();
      setSubjects(data.subjects);
      setAcademicYears(data.academicYears);
      setTests(data.tests); // 🧠 set all tests here
      if (data.subjects.length) setSelectedSubjectId(data.subjects[0].id);
      if (data.academicYears.length) setSelectedAcademicYearId(data.academicYears[0].id);
    } catch (err) {
      toast.error('Failed to load metadata');
    }
  };
  fetchMeta();
}, []);


  // Initialize marks/remarks when group changes
  useEffect(() => {
    if (!group?.members) return;
    const initMarks: Record<string, number> = {};
    const initRemarks: Record<string, string> = {};
    group.members.forEach((m) => {
      initMarks[m.id] = 0;
      initRemarks[m.id] = '';
    });
    setMarksMap(initMarks);
    setRemarksMap(initRemarks);
  }, [group]);

  const handleMarkChange = (memberId: string, value: string) => {
    setMarksMap((prev) => ({ ...prev, [memberId]: value === '' ? 0 : parseFloat(value) }));
  };
  const handleRemarkChange = (memberId: string, value: string) => {
    setRemarksMap((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSave = async () => {
    if (!selectedSubjectId || !selectedTestId || !selectedAcademicYearId) {
      toast.error('Select subject, year, and test');
      return;
    }
    try {
      await apiClient(`/api/marks`, {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          testId: selectedTestId,
          academicYearId: selectedAcademicYearId,
          marks: Object.entries(marksMap).map(([memberId, marks]) => ({ memberId, subjectId: selectedSubjectId, marks, remarks: remarksMap[memberId] || '' })),
        }),
      })
      toast.success('Marks saved');
      setIsEditing(false);
    } catch {
      toast.error('Save failed');
    }
  };  
  
  useEffect(() => {
    if (selectedSubjectId && selectedAcademicYearId && selectedTestId) {
      // All three selected? Okay fetcher baby go
      setLoadingMarks(true)
      const fetchMarks = async () => {
    try {
      const res = await apiClient(
        `/api/marks?subjectId=${selectedSubjectId}&academicYearId=${selectedAcademicYearId}&testId=${selectedTestId}`
      );
      if(!res){
        toast.error('failed request to get marks');
        return;
      }
      const data = await res.json();

      if (data.success) {
        const newMarksMap: Record<string, number> = {};
        const newRemarksMap: Record<string, string> = {};
        
        data.data.forEach((entry: any) => {
          newMarksMap[entry.memberId] = entry.marks;
          newRemarksMap[entry.memberId] = entry.remarks;
        });

        setMarksMap(newMarksMap);
        setRemarksMap(newRemarksMap);
      } else {
        console.error("Failed to fetch marks:", data.error);
      }      
      setLoadingMarks(false);
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };
    fetchMarks();
  }
}, [selectedSubjectId, selectedAcademicYearId, selectedTestId]);

useEffect(() => {
    const filtered = tests.filter(t => t.academicYearId === selectedAcademicYearId);
    if (filtered.length) setSelectedTestId(filtered[0].id);
  }, [selectedAcademicYearId, tests]);

   const handleEnterKey = (index: number, event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    };

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{xs:12, sm:3}}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} label="Subject">
              {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{xs:12, sm:3}}>
          <FormControl fullWidth>
            <InputLabel>Academic Year</InputLabel>
            <Select value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)} label="Academic Year">
              {academicYears.map((y) => <MenuItem key={y.id} value={y.id}>{y.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{xs:9, sm:3}}>
          <FormControl fullWidth>
            <InputLabel>Test</InputLabel>
            <Select value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} label="Test">
              {tests
                .filter(t => t.academicYearId === selectedAcademicYearId) // 🎯 key filter logic
                .map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>

          </FormControl>
        </Grid>
        <Grid size={{xs:3, sm:3}}>
          <Button variant="contained" onClick={() => setIsEditing(v => !v)} sx={{mt:1}}>
          {isEditing ? 'Cancel' : 'Edit Marks'}
        </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ overflowX: 'auto', maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow><TableCell>Name</TableCell><TableCell>Marks</TableCell><TableCell>Remarks (if any)</TableCell></TableRow>
          </TableHead>
         <TableBody>
          {loadingMarks ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell><Skeleton variant="rectangular" width="60px" height={35} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width="100px" height={35} /></TableCell>
              </TableRow>
            ))
          ) : (
            group?.members.map((m, idx) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={marksMap[m.id] || ''}
                      onChange={e => handleMarkChange(m.id, e.target.value)}
                      inputRef={el => inputRefs.current[idx] = el}
                      type="number"
                     onKeyDown={(e) => handleEnterKey(idx, e)}                   
                    InputProps={{ inputProps: { min: 0 } }}
                    />
                  ) : marksMap[m.id]}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={remarksMap[m.id] || ''}
                      onChange={e => handleRemarkChange(m.id, e.target.value)}
                    />
                  ) : remarksMap[m.id]}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </Box>
      {isEditing && <Box display="flex" justifyContent="flex-end" mt={2}><Button variant="contained" onClick={handleSave}>Save Marks</Button></Box>}
    </Paper>
  );
};

export default Marks;