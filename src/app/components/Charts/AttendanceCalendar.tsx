import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Chip, 
  Tooltip 
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Cancel 
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay,
  eachDayOfInterval,
  parseISO
} from 'date-fns';

type AttendanceRecord = {
  attendance: { date: string };
  present: boolean;
};

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ attendanceRecords }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Create attendance map
  const attendanceMap: { [key: string]: string } = {};
  attendanceRecords?.forEach((record: AttendanceRecord) => {
    if (record.attendance?.date) {
      const date = parseISO(record.attendance.date);
      const dateStr = format(date, 'yyyy-MM-dd');
      attendanceMap[dateStr] = record.present ? 'PRESENT' : 'ABSENT';
    }
  });

  // Navigation functions
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Month name for display
  const monthName = format(currentMonth, 'MMMM yyyy');

  // Day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box sx={{
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      maxWidth: '400px',
      backgroundColor: 'background.paper',
      mx: 'auto'
    }}>
      {/* Calendar Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'background.level1',
        borderBottom: '1px solid #e0e0e0',
        p: 1.5
      }}>
        <IconButton onClick={prevMonth} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600}>
          {monthName}
        </Typography>
        <IconButton onClick={nextMonth} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Day Names Header */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        py: 1,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {dayNames.map(day => (
          <Typography 
            key={day} 
            variant="caption" 
            fontWeight={500}
            color="text.secondary"
          >
            {day}
          </Typography>
        ))}
      </Box>
      
      {/* Calendar Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        p: '8px',
        backgroundColor: 'theme.palette.background.paper'
      }}>
        {days.map((day, index) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const status = attendanceMap[dayStr];
          
          return (
            <Tooltip 
              key={index} 
              title={`${format(day, 'EEEE, MMMM d, yyyy')}: ${status || 'No record'}`}
              arrow
            >
              <Box sx={{
                pb:1,
                height: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                borderRadius: '6px',
                backgroundColor: isCurrentMonth ? 'background.paper' : '#fafafa',
                border: isToday ? '2px solid #1976d2' : '1px solid #e0e0e0',
                color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                fontWeight: isToday ? 600 : 500,
                ...(status === 'PRESENT' && {
                  backgroundColor: 'rgba(46, 204, 113, 0.1)',
                  borderColor: 'rgba(46, 204, 113, 0.3)',
                }),
                ...(status === 'ABSENT' && {
                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                  borderColor: 'rgba(231, 76, 60, 0.3)',
                })
              }}>
                <Typography variant="body2">
                  {format(day, 'd')}
                </Typography>
                
                {/* Status indicator */}
                {status && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: '2px',
                    fontSize: '12px'
                  }}>
                    {status === 'PRESENT' ? (
                      <CheckCircle fontSize="inherit" color="success" />
                    ) : (
                      <Cancel fontSize="inherit" color="error" />
                    )}
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        p: 1.5,
        backgroundColor: 'background.paper',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Box display="flex" alignItems="center">
          <CheckCircle fontSize="small" color="success" />
          <Typography variant="caption" ml={0.5}>Present</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Cancel fontSize="small" color="error" />
          <Typography variant="caption" ml={0.5}>Absent</Typography>
        </Box>
        <Chip 
          label="Today" 
          size="small" 
          variant="outlined" 
          sx={{ 
            borderColor: '#1976d2', 
            color: '#1976d2',
            fontSize: '0.7rem',
            height: '20px'
          }} 
        />
      </Box>
    </Box>
  );
};
export default AttendanceCalendar; 