'use client'
import React, { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, CardHeader,
     Divider, Chip, Box, Tooltip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper,
  // IconButton,
 } from '@mui/material';
import { useParams } from 'next/navigation';
// import { ArrowBackIos, ArrowForwardIos, Circle, Today } from '@mui/icons-material';
// import CheckCircle from '@mui/icons-material/CheckCircle';
// import Cancel from '@mui/icons-material/Cancel';
import AttendanceCalendar  from '@/app/components/Charts/AttendanceCalendar';
import Head from 'next/head';
import { apiClient } from '@/app/utils/apiClient';

type AttendanceRecord = {
  present: any;
  date: string;
  attendance: {
    date: string;
    status: string;
  };
};

type FinanceRecord = {
  id: string | number;
  date: string;
  type: string;
  description?: string;
  amount: number;
  paidDate: string; 
  note: string;
  month: string; 
  year: string;
  structureType: 'FEE' | 'SALARY',
  amountPaid: number;
};

type Member = {
  memberNo?: number;
  name: string;
  email?: string;
  phoneNo?: string;
  gender?: string;
  special?: string;
  criteriaVal?: boolean;
  balance?: number;
  customFee?: number;
  customSalary?: number;
  joiningDate: string; // ISO string
  group?: {
    name: string;
    feeMode?: string;
    salaryMode?: string;
    type?: string;
    groupFee?: number;
    groupSalary?: number;
  };
  tenant?: { name: string };
  AttendanceRecord: AttendanceRecord[];
  FinanceRecord: FinanceRecord[];
}

const MemberDetailCard: React.FC= (/*{ member }*/) => {
const [member, setMember] = useState<Member>({
    memberNo: 0,
    name: '',
    email: '',
    phoneNo: '',
    gender: '',
    joiningDate: '',
    customFee: 0,
    customSalary: 0,
    AttendanceRecord: [],
    FinanceRecord: [],
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [attendanceDate, setAttendanceDate] = useState(new Date());
  const params = useParams()

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await apiClient(`/api/member/${params?.id}`);
        // console.log('Fetching member data from API:', `/api/member/${params.id}`);
        if(!res) return;
        if (!res.ok) throw new Error(`Error fetching member: ${res.statusText}`);
        const data = await res.json();
        setMember(data);
        // console.log('member', data)
      } catch (err:any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [params?.id]);
  
   const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Safe ISO date formatter
  // const formatToISODate = (dateString:string) => {
  //   if (!dateString) return null;
  //   try {
  //     const date = new Date(dateString);
  //     return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  //   } catch {
  //     return null;
  //   }
  // };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
      <Typography variant="h6">Loading member details...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
      <Typography color="error">Error: {error}</Typography>
    </Box>
  );
   if (!member) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
      <Typography>Member not found</Typography>
    </Box>
  );
    // Helper components
  const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box display="flex" alignItems="baseline" mb={1}>
      <Typography variant="subtitle2" color="textSecondary" minWidth={100}>
        {label}:
      </Typography>
      <Typography variant="body1" fontWeight={500} ml={1}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );

  const CurrencyValue: React.FC<{ value?: number }> = ({ value }) => (
    <Typography component="span" color="primary.main" fontWeight={600}>
      ₹{(value || 0).toFixed(2)}
    </Typography>
  );

  // Finance Records Table
   const FinanceRecordsTable = () => {
    if (!member.FinanceRecord || member.FinanceRecord.length === 0) {
      return <Typography variant="body2">No financial records found</Typography>;
    }
    
    return (
       <>
      <Head>
        <title>${member?.name}&apos;s Profile | EquaSeed</title>
        <meta name="description" content="View detailed insights and activity logs for each member. Perfect for teachers, students, and staff to keep profiles transparent and up to date." />
      </Head>
      <main>
      <Box mt={1}>
        {/* <Typography variant="subtitle1" borderBottom="2px solid" borderColor="primary.main" color='primary.main' fontWeight={600} mb={1} maxWidth={180}>
          Financial Transactions
        </Typography> */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {member.FinanceRecord.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {formatDate(record.paidDate)}
                  </TableCell>
                  <TableCell>{record.structureType}</TableCell>
                  <TableCell>
                    {record.note || `${record.structureType} for ${record.month}/${record.year}`}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {record.amountPaid?.toFixed(2) || '0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
     </main>
    </>
    );
  };

  return (    
       <Card sx={{ 
      borderRadius: '12px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      borderLeft: '4px solid',
      borderColor: 'primary.main',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)'
      },
      maxWidth: 1000,
      margin: '0 auto',
     
    }}>
      <CardHeader
        title={
          <Typography variant="h5" fontWeight={700}>
            {member.name}
          </Typography>
        }
        subheader={
          <Box display="flex" alignItems="center" mt={0.5}>
            <Typography variant="subtitle2" color="textSecondary">
              ID #{member.memberNo || 'N/A'}
            </Typography>
            {member.group?.name && (
              <Chip 
                label={member.group.name} 
                size="small" 
                sx={{ 
                  ml: 1.5, 
                  bgcolor: 'primary.light', 
                  color: 'white',
                  fontWeight: 500
                }} 
              />
            )}
          </Box>
        }
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid #e0e0e0',
          py: 2
        }}
      />

      <CardContent>
        <Grid container spacing={2}>
          {/* Personal Information */}
          <Grid size={{xs:12, sm:6}}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              border: '1px solid #eee',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5} color="primary">
                <Box component="span" borderBottom="2px solid" borderColor="primary.main" pb={0.5}>
                  Personal Information
                </Box>
              </Typography>
              <InfoRow label="Email" value={member.email} />
              <InfoRow label="Phone" value={member.phoneNo} />
              <InfoRow label="Organisation" value={member.tenant?.name} />
              <InfoRow 
                label="Joining Date" 
                value={formatDate(member.joiningDate)}
              />
              <InfoRow label="Gender" value={member.gender} />
              <InfoRow label="Hobbies" value={'NA'} />
              
              {/* <Box display="flex" mt={1.5} flexWrap="wrap" gap={1}>
                {member.criteriaVal && (
                  <Chip 
                    label="Criteria Passed" 
                    color="success" 
                    size="small" 
                    sx={{ fontWeight: 500 }} 
                  />
                )}
                {member.special && (
                  <Chip 
                    label={`Special: ${member.special}`} 
                    color="info" 
                    size="small" 
                    sx={{ fontWeight: 500 }} 
                  />
                )}
              </Box> */}
            </Box>
          </Grid>

          {/* Financial Information */}
          <Grid size={{xs:12, sm:6}}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              border: '1px solid #eee',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5} color="primary">
                <Box component="span" borderBottom="2px solid" borderColor="primary.main" pb={0.5}>
                  Financial Summary
                </Box>
              </Typography>
              
              <Grid container spacing={1}>
                <Grid size={{xs:12, sm:6}}>
                  <Box textAlign="center" p={1} bgcolor="rgba(25, 118, 210, 0.05)" borderRadius={1}>
                    <Typography variant="caption" color="textSecondary">
                      Balance
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      <CurrencyValue value={member.balance} />
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{xs:12, sm:6}}>
                  <Box textAlign="center" p={1} bgcolor="rgba(46, 125, 50, 0.05)" borderRadius={1}>
                    <Typography variant="caption" color="textSecondary">
                      Custom Fee
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      <CurrencyValue value={member.customFee} />
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{xs:12, sm:6}}>
                  <Box textAlign="center" p={1} bgcolor="rgba(211, 47, 47, 0.05)" borderRadius={1}>
                    <Typography variant="caption" color="textSecondary">
                      Custom Salary
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      <CurrencyValue value={member.customSalary} />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <InfoRow label="Fee Mode" value={member.group?.feeMode || 'Group'} />
              <InfoRow label="Salary Mode" value={member.group?.salaryMode || 'Group'} />
              <InfoRow label="Group Type" value={member.group?.type || 'N/A'} />
              
              <Box mt={1.5}>
                <Typography variant="caption" color="textSecondary">
                  Group Fee/Salary:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mt={0.5}>
                  <Typography variant="body1" fontWeight={500}>
                    Fee: ₹{(member.group?.groupFee || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    Salary: ₹{(member.group?.groupSalary || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Attendance Section */}
          <Grid size={{xs:12, md:6}}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              border: '1px solid #eee',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              minWidth: 300,
            }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5} color="primary">
                <Box component="span" borderBottom="2px solid" borderColor="primary.main" pb={0.5}>
                  Attendance Records
                </Box>
              </Typography>
              <AttendanceCalendar attendanceRecords={member.AttendanceRecord} />
            </Box>
          </Grid>

          {/* Finance Records */}
          <Grid size={{xs:12, md:6}}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              border: '1px solid #eee',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5} color="primary" >
                <Box component="span" borderBottom="2px solid" borderColor="primary.main" pb={0.5}>
                  Finance Records
                </Box>
              </Typography>
              <FinanceRecordsTable />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MemberDetailCard;
