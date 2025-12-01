'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  Paper,
  Divider
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { apiClient } from '@/app/utils/apiClient'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatISO } from 'date-fns';
import { Group } from '@/types/all';
import { debounce } from 'lodash';
import AllModal from '../Modals/Modal';

interface AttendanceProps{
    group: Group | null;
    page: number;
    search: string;
}
const Attendance = ({ group, page, search }: AttendanceProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [isOpenSuccess, setIsOpenSuccess] = useState<boolean>(false)
    const handleAttendanceToggle = (memberId: string) => {
    setAttendance(prev => ({
        ...prev,
        [memberId]: !prev[memberId],
    }));
    };

    // fetch data when date or group changes
useEffect(() => {
  if (!group?.id || !selectedDate || !group.members?.length) return;

  const yyyyMMdd = formatISO(selectedDate, { representation: 'date' });

  apiClient(`/api/group/${group.id}/attendance?date=${yyyyMMdd}`)
    .then(res => res?.json())
    .then(data => {
      const recordMap: Record<string, boolean> = {};
      data.records?.forEach((r: any) => {
        recordMap[r.memberId] = r.present;
      });

      const fullAttendance: Record<string, boolean> = {};
      group.members.forEach((m) => {
        fullAttendance[m.id] = recordMap[m.id] ?? false;
      });

      setAttendance(fullAttendance);
    })
    .catch(console.error);
}, [group?.id, selectedDate, group?.members?.length, page, search]);


    const handleSaveAttendance = useMemo(() =>
    debounce(() => {
        if (!group?.id || !selectedDate) return;

        const yyyyMMdd = formatISO(selectedDate, { representation: 'date' });
        const records = Object.entries(attendance).map(([memberId, present]) => ({ memberId, present }));

        apiClient(`/api/group/${group.id}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ date: yyyyMMdd, records }),
        })
        .then(res => {
          if (!res) return;
          return res.json();
        })
        .then(() => {
            // optional toast
        })
        .catch(console.error);
    }, 500)
    , [group?.id, selectedDate, attendance]);    

  return (
 <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Paper elevation={0} sx={{
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
    }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            slotProps={{ textField: { fullWidth: true } }}
        />
        </Box>
        <List sx={{ p: 0 }}>
        {group?.members?.map((member: any, index: number) => (
            <React.Fragment key={member?.id}>
            <ListItem
                sx={{
                py: 2,
                '&:hover': { backgroundColor: '#f9faff' },
                transition: 'background-color 0.2s'
                }}
            >
                <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                color: '#4361ee'
                }}>
                <PersonIcon />
                </Box>

                <ListItemText
                primary={
                    <Typography variant="body1" fontWeight="500">
                    {member?.name}
                    </Typography>
                }
                />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                    checked={!!attendance[member?.id]}
                    onChange={() => handleAttendanceToggle(member?.id)}
                    icon={<CloseIcon fontSize="small" sx={{ color: '#b91c1c' }} />}
                    checkedIcon={<CheckIcon fontSize="small" sx={{ color: '#166534' }} />}
                    inputProps={{ 'aria-label': 'Mark present' }}
                    sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#166534', // thumb
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#bbf7d0', // track when checked
                    },
                    '& .MuiSwitch-switchBase': {
                        color: '#b91c1c', // unchecked thumb
                    },
                    '& .MuiSwitch-track': {
                        backgroundColor: '#fee2e2', // unchecked track
                    },
                    }}
                />

                <Typography sx={{ ml: 1, minWidth: 60 }}>
                    {attendance[member?.id] ? 'Present' : 'Absent'}
                </Typography>
                </Box>
            </ListItem>
            {index < (group?.members?.length ?? 0) - 1 && <Divider sx={{ mx: 2 }} />}
            </React.Fragment>
        ))}

        {group?.members?.length === 0 && (
            <Box sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: '#f9faff'
            }}>
            <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                color: '#4361ee'
            }}>
                <PersonIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" fontWeight="500" color="text.primary" gutterBottom>
                No Members Added
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                This group doesn&apos;t have any members yet. Click &quot;Add Member&quot; to get started.
            </Typography>
            </Box>
        )}
        </List>
    </Paper>
        <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button
                variant="contained"
            //   startIcon={<AddIcon />}
                onClick={
                    ()=>{
                        handleSaveAttendance();
                        setIsOpenSuccess(true)
                    }
                }
                sx={{
                backgroundColor: '#4361ee',
                color: 'white',
                borderRadius: 3,
                px: 3,
                py:1,
                textTransform: 'none',
                fontWeight: 550,
                boxShadow: 'none',
                '&:hover': {
                    backgroundColor: '#3a56d4',
                    boxShadow: 'none'
                }
                }}
            >
        Save Attendance
        </Button>
    </Box>
    <AllModal
        open={isOpenSuccess}
        handleClose={() => setIsOpenSuccess(false)}
        handleConfirm={() => setIsOpenSuccess(false)}
        title="Success"
        message={'Attendance Has Been Saved Successfully'}
        btntxt="Ok"
        icon={{ type: "success" }}
        color="primary"    
    />
    </LocalizationProvider>
  )
}

export default Attendance
