// SalaryList.tsx
'use client';

import React, { useState, useEffect} from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Skeleton,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PaymentHistory from './PaymentHistory';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { apiClient } from '@/app/utils/apiClient';
import { GroupType } from '@prisma/client';

// Define the types for salary items and form data
interface FinanceItem {
  id: string;
  name: string;
  salary?: number;
  fee?: number;
  source: string;
  memberId: string;
}

interface FormData {
  amountPaid: string;
  note: string;
  dueDate: string;
}

interface Props {
  groupType: GroupType;
  salaryMode: 'Group' | 'Member';
  feeMode: 'Group' | 'Member';
  loading: boolean;
  salaries: FinanceItem[];
  fees: FinanceItem[];
  searchQuery: string;
  openFormId: string | null;
  setOpenFormId: React.Dispatch<React.SetStateAction<string | null>>;
  // formData: FormData;
  // setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  // monthValue: Date | null;
  // setMonthValue: (value: Date | null) => void;
  // handleSubmit: (s: SalaryItem) => void;
  handleEditClick: (s: FinanceItem) => void;
  showPayments: boolean;
  records: Record<string, any[]>;
  // showAllRecords: Record<string, boolean>;
  // setShowAllRecords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  fetchAllRecords:()=>void;
  components: { name: string; amount: string }[];
  groupId: string;
  isListView: boolean;
  currentMode:GroupType ;
  setCurrentMode: React.Dispatch<React.SetStateAction<GroupType>>;
}

const FinanceCard: React.FC<Props> = ({
  groupType,
  feeMode,
  salaryMode,
  loading,
  salaries,
  fees,
  searchQuery,
  openFormId,
  setOpenFormId,
  handleEditClick,
  showPayments,
  records,
  fetchAllRecords,
  components,
  groupId,
  isListView,
  currentMode, 
  setCurrentMode
}) => {

  // const [currentMode, setCurrentMode] = useState<GroupType>(groupType); 
  // const [currentMode, setCurrentMode] = useState<GroupType>(() => {
  //   return groupType === 'BOTH' ? 'FEE' : groupType;
  // });
  const currentMonth = new Date();
    const [formData, setFormData] = useState({
      amountPaid: '',
      dueDate: '',
      note: ''
    });
  const [showAllRecords, setShowAllRecords] = useState<Record<string, boolean>>({});
  const [monthValue, setMonthValue] = useState<Date | null>(null);
  const { tenantId } = useAuth();

  useEffect(() => {
    // Only set month value if not already set
    if (!monthValue) {
      setMonthValue(currentMonth);
    }
  }, []);

  useEffect(() =>{
    if (groupType !== 'BOTH') {
      setCurrentMode(groupType);
    }
  }, [groupType])
    
  const handleSubmit = async (structure: FinanceItem, modeType: GroupType) => {
  if (!monthValue) {
    toast.error('Please select a month');
    return;
  }

  if (!groupType || groupType === 'BOTH' && !modeType) {
    toast.error('Group type or mode type is not properly defined');
    return;
  }

  const month = monthValue.getMonth(); // 0-11
  const year = monthValue.getFullYear();

  // Resolve actual structureType to send to backend
  const structureType = groupType === 'BOTH' ? modeType : groupType;
  if (!['FEE', 'SALARY'].includes(structureType)) {
    toast.error('Invalid structure type');
    return;
  }

  const amountExpected = structureType === 'SALARY' ? structure.salary : structure.fee;

  const res = await apiClient(`/api/finance/record`, {
    method: 'POST',
    body: JSON.stringify({
      tenantId,
      memberId: structure.memberId,
      structureId: structure.id,
      structureType, // ✅ Not 'BOTH'
      amountExpected,
      amountPaid: Number(formData.amountPaid),
      note: formData.note,
      month,
      year,
    }),
  });

  if (!res) {
    return toast.error('Failed to connect to server');
  }

  const data = await res.json();

  if (res.ok) {
    toast.success('Payment recorded');
    setOpenFormId(null);
    setFormData({ amountPaid: '', note: '', dueDate: '' });
    fetchAllRecords();
  } else {
    toast.error(data.error || 'Something went wrong');
  }
};


  // const items = groupType === 'FEE' ? fees : salaries;
  const displayMode = groupType === 'BOTH' ? currentMode : groupType;
  const items = (displayMode === 'FEE' 
    ? (Array.isArray(fees) ? fees : []) 
    : (Array.isArray(salaries) ? salaries : []));
  const mode = displayMode === 'FEE' ? feeMode : salaryMode;
  
  const filteredItems = items.filter(item => {
    // Check if item exists and has name property
    if (!item || typeof item.name !== 'string') return false;
    
    // Safely handle searchQuery
    const searchTerm = typeof searchQuery === 'string' 
      ? searchQuery.toLowerCase() 
      : '';
      
    return item.name.toLowerCase().includes(searchTerm);
  });

  // console.log('salaries', salaries)
  // console.log('Fees', fees)

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
    <CardContent>
      {/* Header: Salary Mode */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #f5f5f5' }}>
  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mr: 2 }}>
    {(groupType === 'BOTH' ? currentMode : groupType) === 'FEE' ? 'Fee Mode:' : 'Salary Mode:'}
  </Typography>

  <Chip
    label={mode}
    sx={{
      bgcolor: mode === 'Member' ? '#e0f2fe' : '#f0fdf4',
      color: mode === 'Member' ? '#0c4a6e' : '#166534',
      fontWeight: 600,
      fontSize: '0.9rem',
    }}
  />

  {groupType === 'BOTH' && (
    <ToggleButtonGroup
      value={currentMode}
      exclusive
      onChange={(e, val) => {
        if (val) {
          setCurrentMode(val);
          setOpenFormId(null); // Reset open forms
          setFormData({ amountPaid: '', note: '', dueDate: '' });
        }
      }}
      sx={{ ml: 3 }}
    >
      <ToggleButton value="FEE">Fee Mode</ToggleButton>
      <ToggleButton value="SALARY">Salary Mode</ToggleButton>
    </ToggleButtonGroup>
  )}
</Box>

        
  {/* Loading State */}
        {loading ? (
          isListView ? (
            // List view skeleton
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{   bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c4874' : '#f9fafb'  }}>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="50%" /></TableCell>
                      <TableCell align="right"><Skeleton variant="rounded" width={90} height={32} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Grid view skeleton
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2} py={3}>
              {[...Array(6)].map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={150} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          )
        ) : isListView ? (
          // List View Implementation
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <Table size="small">
              <TableHead sx={{  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c4874' : '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => (
                    <React.Fragment key={s.id}>
                      <TableRow hover sx={{ '&:hover': { backgroundColor: '#fafbff' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              bgcolor: '#f0f4ff', 
                              color: '#4361ee', 
                              width: 32, 
                              height: 32, 
                              fontSize: '0.875rem',
                              mr: 1.5
                            }}>
                              {s.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {s.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={550} color="#4361be">
                            
                            ₹{showPayments ? displayMode === 'SALARY'
                              ? (s.salary ?? 0).toLocaleString()
                              : (s.fee ?? 0).toLocaleString()
                            : '*******'}

                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.source}
                            size="small"
                            sx={{
                              bgcolor: s.source === 'Group Components' ? '#d1fadf' : 
                                       s.source === 'Member Components' ? '#e0f2fe' : '#fef6e6', 
                              color: s.source === 'Group Components' ? '#166534' : 
                                     s.source === 'Member Components' ? '#0c4a6e' : '#854d0e',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {mode === "Member" && (
                            <IconButton
                              onClick={() => handleEditClick(s)}
                              size="small"
                              sx={{ 
                                color: '#4361ee',
                                mr: 1,
                                '&:hover': { bgcolor: '#e0e7ff' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          <Button
                            size="small"
                            variant={openFormId === s.id ? 'outlined' : 'contained'}
                            sx={{
                              minWidth: 90,
                              height: 32,
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              textTransform: 'none',
                              ...(openFormId === s.id
                                ? {
                                    color: '#666',
                                    borderColor: '#e0e0e0',
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                  }
                                : {
                                    bgcolor: '#4361ee',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#3a56d4' }
                                  }),
                            }}
                            onClick={() => {
                              const amount = displayMode === 'SALARY' ? s.salary : s.fee;
                              if (!amount || amount <= 0) {
                                toast.error(displayMode === 'SALARY' 
                                  ? "Salary must be greater than 0" 
                                  : "Fee must be greater than 0");
                                return;
                              }
                              if (s.source === 'Not Assigned') {
                                toast.error(displayMode === 'SALARY'
                                  ? "Please assign a salary structure"
                                  : "Please assign a fee structure");
                                return;
                              }
                              setOpenFormId(s.id === openFormId ? null : s.id);
                            }}
                          >
                            {openFormId === s.id ? 'Cancel' : 'Pay Now'}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Payment Form */}
                      {openFormId === s.id && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 2, bgcolor: 'background.level1', borderTop: '1px solid #e0e7ff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <PaymentIcon fontSize="small" sx={{ color: '#4361ee', mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight={600}>
                                Payment for {s.name}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1.5 }}>
                              <TextField
                                size="small"
                                placeholder="Amount"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                  sx: { borderRadius: 1, bgcolor: 'background.default', fontSize: '0.85rem' },
                                }}
                                fullWidth
                              />
                              
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                  views={['year', 'month']}
                                  label="Select Month"
                                  value={monthValue}
                                  onChange={setMonthValue}
                                  minDate={new Date('2024-01-01')}
                                  maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), 1)}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      fullWidth: true,
                                      InputLabelProps: { shrink: true },
                                      InputProps: {
                                        sx: {
                                          borderRadius: 1,
                                          bgcolor: 'background.default',
                                          fontSize: '0.85rem',
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <TextField
                                size="small"
                                placeholder="Note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                fullWidth
                                sx={{ flex: 1, '& .MuiInputBase-root': {
                                    bgcolor: 'background.default', },}}                                
                              />
                              
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  minWidth: 90,
                                  bgcolor: '#4361ee',
                                  fontWeight: 500,
                                  '&:hover': { bgcolor: '#3a56d4' }
                                }}
                                onClick={() => handleSubmit(s, displayMode)}
                              >
                                Submit
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Payment History */}
                      {showPayments && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 0, border: 0 }}>
                            <PaymentHistory
                              memberId={s.memberId}
                              memberName={s.name}
                              records={records}
                              showAllRecords={showAllRecords}
                              setShowAllRecords={setShowAllRecords}
                              components={components}
                              mode={mode}
                              groupId={groupId}
                              // groupType={groupType ?? 'SALARY'}
                              resolvedMode={groupType === 'BOTH' ? currentMode : groupType}
                              // compactView={true}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                
                {/* Empty State */}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ py: 4, textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: '#f5f7ff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}>
                          <Box sx={{ fontSize: 32, color: '#4361ee' }}>₹</Box>
                        </Box>
                        <Typography variant="h6" fontWeight={500} gutterBottom>
                          No {groupType === 'FEE' ? 'fee' : 'salary'} data available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                          Add {groupType === 'FEE' ? 'fee' : 'salary'} information to display data here.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1frr' }}
            gap={2}
          >
            {filteredItems
              .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((s) => (
                <Card
                  key={s.id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: '0.3s',
                    border: '1px solid #f0f0f0',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(67, 97, 238, 0.15)',
                      borderColor: '#4361ee40',
                    },
                  }}
                >
                  <CardContent sx={{ py: 3, position: 'relative' }}>
                    {/* Edit Button */}
                    {mode==="Member" &&
                    <IconButton
                      onClick={() => handleEditClick(s)}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#4361ee',
                        bgcolor: '#e0e7ff',
                        '&:hover': { bgcolor: '#d0d9ff' },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    }
                    {/* Employee Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: '#f0f4ff',
                          color: '#4361ee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontWeight: 'bold',
                        }}
                      >
                        {s.name.charAt(0)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {s.name}
                      </Typography>
                    </Box>

                    {/* Salary Amount */}
                    <Typography variant="h6" fontWeight={550} sx={{ mt: 2, color: '#4361be' }}>
                           ₹{showPayments ? displayMode === 'SALARY'
                              ? (s.salary ?? 0).toLocaleString()
                              : (s.fee ?? 0).toLocaleString()
                            : '*******'}
                    </Typography>

                    {/* Source & Pay Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.1 }}>
                      <Chip
                      label={s.source}
                      size="small"
                      sx={{
                        mt: 1.5, bgcolor: s.source === 'Group Components' ? '#d1fadf' : s.source === 'Member Components' ? '#e0f2fe' : '#fef6e6', 
                        color: s.source === 'Group Components'? '#166534' : s.source === 'Member Components'?  '#0c4a6e': '#854d0e',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                      />
                      <Button
                      size="small"
                      variant={openFormId === s.id ? 'outlined' : 'contained'}
                      sx={{
                        minWidth: 90,
                        height: 32,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        ...(openFormId === s.id
                        ? {
                          color: '#666',
                          borderColor: '#e0e0e0',
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                            borderColor: '#bdbdbd',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                          },
                          }
                        : {
                          bgcolor: '#4361ee',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#3a56d4',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 10px rgba(67, 97, 238, 0.35)',
                          },
                          }),
                      }}
                      onClick={() => {
                          const amount = groupType === 'SALARY' ? s.salary : s.fee;
                          if (!amount || amount <= 0) {
                            toast.error(groupType === 'SALARY' ? "Salary must be greater than 0" : "Fee must be greater than 0");
                            return;
                          }
                          if (s.source === 'Not Assigned') {
                            toast.error(
                              groupType === 'SALARY'
                                ? "Please assign a salary structure to this member"
                                : "Please assign a fee structure to this member"
                            );
                            return;
                          }
                          setOpenFormId(s.id === openFormId ? null : s.id);
                        }}                      
                      >
                      {openFormId === s.id ? 'Cancel' : 'Pay Now'}
                      </Button>
                    </Box>

                    {/* Payment Form */}
                    <Collapse in={openFormId === s.id}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'background.level1',
                          borderTop: '1px solid #e0e7ff',
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                          <PaymentIcon fontSize="small" sx={{ color: '#4361ee' }} />
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                            Payment for {s.name}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '0.75fr 1.25fr', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Amount"
                            value={formData.amountPaid}
                            onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              sx: { borderRadius: 1, bgcolor: 'background.default', fontSize: '0.85rem', maxWidth: 150 },
                            }}
                          />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={['year', 'month']}
                                label="Select Month"
                                value={monthValue}
                                onChange={(newVal) => setMonthValue(newVal)}
                                minDate={new Date('2024-01-01')}
                                maxDate={
                                    new Date(
                                        new Date().getFullYear() + 1,
                                        new Date().getMonth(),
                                        1
                                    )
                                }
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        variant: 'outlined',
                                        placeholder: 'MM/YYYY',
                                        InputLabelProps: { shrink: true },
                                        InputProps: {
                                            sx: {
                                                fontSize: '0.85rem',
                                                borderRadius: 1.5,
                                                backgroundColor: 'background.default',
                                                boxShadow: '0 0 0 1px #e0e0e0',
                                                '&:hover': {
                                                    boxShadow: '0 0 0 1.5px #c7d2fe'
                                                },
                                                '& .MuiInputBase-input': {
                                                    paddingY: '6px',
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        </Box>
                          <TextField
                            size="small"
                            placeholder="Note"
                            multiline
                            rows={1}
                            value={formData?.note ?? ''}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            InputProps={{
                              sx: {
                                borderRadius: 1,
                                bgcolor: 'background.default',
                                fontSize: '0.85rem'
                              }
                            }}
                            sx={{ mb: 1, width: '100%' }}
                          />

                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: '#4361ee',
                              fontWeight: 500,
                              fontSize: '0.8rem',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#3a56d4' }
                            }}
                            onClick={() => handleSubmit(s, displayMode)}
                          >
                            Submit
                          </Button>
                        </Box>
                      </Collapse>

                      {showPayments && (
                        <PaymentHistory
                          memberId={s.memberId}
                          memberName={s.name}
                          records={records}
                          showAllRecords={showAllRecords}
                          setShowAllRecords={setShowAllRecords}
                          components={components}
                          mode={mode}
                          groupId={groupId}
                          resolvedMode={groupType === 'BOTH' ? currentMode : groupType}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}

              {items.length === 0 && (
                <Box sx={{
                  gridColumn: '1 / -1',
                  py: 6,
                  textAlign: 'center',
                  border: '2px dashed #f0f0f0',
                  borderRadius: 3
                }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'background.default',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ fontSize: 40, color: '#4361ee' }}>₹</Box>
                  </Box>
                  <Typography variant="h6" fontWeight={500} color="text.primary" gutterBottom>
                    No {groupType === 'FEE' ? 'fee' : 'salary'}  data available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    Add {groupType === 'FEE' ? 'fee' : 'salary'}  information or change your {groupType === 'FEE' ? 'fee' : 'salary'}  mode to display data here.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
  )}
            
export default FinanceCard;
// export default React.memo(FinanceCard);