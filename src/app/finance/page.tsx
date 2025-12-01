"use client";
//change on FEE page also
import { useEffect, useState } from "react";
import { useTheme , Box, Typography, Tabs, Tab, TextField, Button,  InputAdornment, useMediaQuery, Chip, IconButton, Pagination, FormControl, InputLabel, Select, MenuItem, Paper, Grid,} from "@mui/material";
import { apiClient } from "@/app/utils/apiClient";
import { Group } from '@/types/all';
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  // CalendarToday as CalendarIcon,
  // Payment as PaymentIcon
} from '@mui/icons-material';
import { useAuth } from "@/context/AuthContext";
import SearchIcon from '@mui/icons-material/Search';
import FinanceCard from "@/app/components/Finance/FinanceCard";
import FinanceStructure from "@/app/components/Finance/EditGroupFinanceStructure";
import EditMemberFinanceStructure from "@/app/components/Finance/EditMemberFinanceStructure";
import { FinanceRecord, GroupType } from '@prisma/client';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import { useRouter } from "next/navigation";
import Head from "next/head";
import toast from "react-hot-toast";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
interface SalaryItem {
  id: string;
  name: string;
  salary?: number;
  fee?: number;
  source: string;
  memberId: string;      
  structureId?: string;  
  type: GroupType
  groupSalary?: number      
  groupFee?: number     
}

export default function SalaryFinancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [salaryMode, setSalaryMode] = useState<'Group' | 'Member'>('Group');
  const [feeMode, setFeeMode] = useState<'Group' | 'Member'>('Group');
  const [salaries, setSalaries] = useState<SalaryItem[]>([]);
  const [fees, setFees] = useState<SalaryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(4);
  const [sortBy, setSortBy] = useState<'name' | 'joiningDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editOpen, setEditOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editName, setEditName] = useState('');
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [components, setComponents] = useState<{ name: string; amount: string }[]>([]);
  const [groupType, setGroupType] = useState<GroupType>('FEE');
  const [showPayments, setShowPayments] = useState(false);
  const [records, setRecords] = useState<Record<string, FinanceRecord[]>>({});
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isListView, setIsListView] = useState(true)
  const [groupPage, setGroupPage] = useState(1);
  const [groupLimit, setGroupLimit] = useState(8);
  const [groupTotal, setGroupTotal] = useState(0);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [currentMode, setCurrentMode] = useState<GroupType>(() => {
      return groupType === 'BOTH' ? 'FEE' : groupType as GroupType;
    });  const theme = useTheme();
  const { role } = useAuth();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  
useEffect(() => {
  if (!token) {
    router.push('/auth/login');
    return;
  }
  if (role !== 'Admin' && role !== 'Finance') {
    router.push('/');
    return;
  }
}, [token]);

const fetchGroups = async () => {
  try {
    const res = await apiClient(`/api/group?page=${groupPage}&limit=${groupLimit}`);
    if(!res){
      toast.error('failed to fetch')
      return;
    } 
    const data = await res.json();
    // console.log('data group', data)
    setGroups(data.data || []);
    setGroupTotal(data.pagination.total ?? 0);
  } catch (err) {
    toast.error('Failed to load groups');
    console.error(err);
  }
};

useEffect(() => {
  fetchGroups();
}, [groupPage, groupLimit]);

const selectedGroup = Array.isArray(groups) ? groups.find(g => g.id === selectedGroupId) : null;
  useEffect(() => {
    if (selectedGroup) {
      setGroupType(selectedGroup.type as GroupType);
    }
  }, [selectedGroup]);

  const handleEditClick = (member:any) => {
    setEditMemberId(member.id);
    setEditAmount(String(member.salary));
    setEditName(member.name);
    setEditOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroupId, groupType, searchQuery]);
  
  const fetchOverview = async () => {
    if (!token || !selectedGroupId) return;

    setLoading(true);
    try {
      const structureType = groupType === 'BOTH' ? currentMode : groupType;
      const res = await apiClient(
        `/api/group/${selectedGroupId}/finance-overview?structureType=${structureType}&page=${currentPage}&limit=${limit}&search=${searchQuery}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {}
      );
      if (!res) {
        toast.error('Could not fetch overview');
        return;
      }
      const json = await res.json();
      console.log('json', json);
      // Update pagination
      setTotalCount(json.pagination.totalCount);
      setCurrentPage(json.pagination.page);

      // Depending on type, populate salaries OR fees
      if (structureType === 'SALARY') {
        setSalaries(json.members.map((m:any) => ({
          id: m.id,
          name: m.name,
          salary: m.total,
          source: m.source,
          memberId: m.id,
          type: groupType,
        })));
        setFees([]);
      } else {
        setFees(json.members.map((m:any) => ({
          id: m.id,
          name: m.name,
          fee: m.total,
          source: m.source,
          memberId: m.id,
          type: groupType,
        })));
        setSalaries([]);
      }

      // Build records map
      const recs: Record<string, FinanceRecord[]> = {};
      json.members.forEach((m:any) => {
        recs[m.id] = m.financeRecords;
      });
      setRecords(recs);

    } catch (err) {
      console.error(err);
      toast.error('Error fetching overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedGroupId, groupType, currentMode, currentPage, limit, searchQuery, sortBy, sortOrder]);

  return (
        <>
      <Head>
        <title>Finance Dashboard | EquaSeed</title>
        <meta name="description" content="Track fees, salaries, and pending dues with crystal clarity. EquaSeed brings finance transparency to your institution's doorstep." />
      </Head>
      <main>
   
   
<Box sx={{
  p: 3,
  maxWidth: 1200,
  mx: 'auto',
  bgcolor:
    groupType === 'SALARY'
      ? isDark ? '#0d1b2a' : '#e6faff'
      : groupType === 'FEE'
      ? isDark ? '#0f2e1b' : '#e6fff2'
      : isDark ? '#121212' : '#f9faff',
  borderRadius: 3,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}}>

  {/* Group Tabs */}
  <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <IconButton
  onClick={() => setGroupPage((prev) => Math.max(prev - 1, 1))}
  disabled={groupPage === 1}
>
  <ChevronLeft />
</IconButton>

      <Box
  display="grid"
  gridTemplateColumns={{
    xs: 'repeat(2, 1fr)',
    sm: 'repeat(3, 1fr)',
    md: 'repeat(4, 1fr)'
  }}
  gap={1.5}
  width="100%"
  sx={{ p: 1 }}
>
  {groups.map((group) => (
    <Paper
      key={group.id}
      elevation={selectedGroupId === group.id ? 4 : 1}
      onClick={() => setSelectedGroupId(group.id)}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: selectedGroupId === group.id 
          ? 'primary.main' 
          : 'divider',
        transform: selectedGroupId === group.id 
          ? 'translateY(-2px)' 
          : 'none',
        boxShadow: selectedGroupId === group.id
          ? '0 4px 12px rgba(67, 97, 238, 0.2)'
          : '0 2px 5px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.1)',
          borderColor: selectedGroupId !== group.id 
            ? 'primary.light' 
            : 'primary.main'
        }
      }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 1,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.9rem',
          letterSpacing: '0.5px',
          color: selectedGroupId === group.id 
            ? 'primary.contrastText' 
            : 'text.primary',
          backgroundColor: selectedGroupId === group.id 
            ? 'primary.main' 
            : 'background.paper',
          backgroundImage: selectedGroupId === group.id
            ? 'linear-gradient(45deg, primary.dark 0%, primary.main 100%)'
            : 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: selectedGroupId === group.id ? 3 : 0,
            background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
            transition: 'height 0.3s ease'
          },
          '&:hover:before': {
            height: 3
          }
        }}
      >
        {group.name}
        {selectedGroupId === group.id && (
          <CheckCircleIcon 
            sx={{ 
              fontSize: '1rem', 
              ml: 0.5,
              verticalAlign: 'middle',
              color: 'white'
            }} 
          />
        )}
      </Box>
    </Paper>
  ))}
</Box>

      <IconButton
        onClick={() =>
          setGroupPage((prev) =>
            Math.min(prev + 1, Math.ceil(groupTotal / groupLimit)) // ✅ Not groups.length
          )
        }
        disabled={groupPage >= Math.ceil(groupTotal / groupLimit)} // ✅
      >
        <ChevronRight />
      </IconButton>
      <Button ></Button>
    </Box>

    {groups.length > 8 && (
      <Box ml={2} mt={2} display="flex" justifyContent="flex-end">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="group-limit-label">Groups per page</InputLabel>
          <Select
            labelId="group-limit-label"
            value={groupLimit}
            label="Groups per page"
            onChange={(e) => {
              setGroupLimit(Number(e.target.value));
              setGroupPage(1); 
            }}
          >
            {[4, 8, 12, 16, 20].map((num) => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    )}
  </Box>

      <FinanceStructure
        selectedGroupId={selectedGroupId} // Currently selected group ID (string or null)
        settingsOpen={settingsOpen} // Boolean to control Collapse
        salaryMode={salaryMode} // 'Group' | 'Member'
        feeMode={feeMode} // 'Group' | 'Member'
        onSalaryModeChange={setSalaryMode}
        onFeeModeChange={setFeeMode}
        getFeeSalaries={fetchOverview} // Refetch salaries
        resolvedMode={groupType === 'BOTH' ? currentMode : groupType}
      />

<Paper elevation={3} sx={{
  p: 2,
  mb: 1.4, mt:2,
  borderRadius: 2,
  backgroundColor: 'background.paper',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
}}>
  <Grid container spacing={2} alignItems="center">
    {/* Settings Toggle Button */}
    <Grid size={{xs:1, sm:1, lg:0.5}} sx={{ 
      display: 'flex', 
      justifyContent: { xs: 'flex-start', sm: 'center' } 
    }}>
      <Button
        variant="text"
        onClick={toggleSettings}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderRadius: 2,
          backgroundColor: settingsOpen ? '#e0e7ff' : 'transparent',
          textTransform: 'none',
          color: settingsOpen ? '#4361ee' : 'text.primary',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#e0e7ff' },
          minWidth: 40,
          width: 40,
          height: 40
        }}
      >
        {settingsOpen ? 
          <ExpandLessIcon sx={{ fontSize: '1.1rem' }} /> : 
          <SettingsIcon sx={{ fontSize: '1.1rem' }} />
        }
      </Button>
    </Grid>

    {/* Search Field */}
    <Grid size={{xs:10, sm:4, lg:2.5}} >
      <TextField
        fullWidth
        size="small"
        placeholder="Search by Name or ID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.default',
            height: 40,
            boxShadow: 'inset 0 0 0 1px #e0e0e0',
            transition: 'box-shadow 0.2s ease',
            '&:focus-within': {
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
            },
            '& input': { py: 0.8, fontSize: '0.95rem' }
          }
        }}
      />
    </Grid>

    {/* Sorting Controls */}
    <Grid size={{xs:12, sm:6, lg:3}}>
      <Grid container spacing={1}>
        <Grid size={{xs:6}}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="joiningDate">Joining Date</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{xs:6}} >
          <FormControl fullWidth size="small">
            <InputLabel>Order</InputLabel>
            <Select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              label="Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>

    {/* View Toggles and Payments Button */}
   <Grid size={{xs:12, lg:6}}>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 2,
    }}
  >
    {/* View Controls */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {/* View Toggle Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          bgcolor: 'grey.100',
          borderRadius: 2,
          p: 0.5,
        }}
      >
        <IconButton
          onClick={() => setIsListView(false)}
          size="small"
          sx={{
            borderRadius: 1.5,
            bgcolor: !isListView ? 'primary.light' : 'transparent',
            color: !isListView ? 'primary.main' : 'text.secondary',
            '&:hover': { bgcolor: 'primary.light' },
          }}
        >
          <GridViewIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => setIsListView(true)}
          size="small"
          sx={{
            borderRadius: 1.5,
            bgcolor: isListView ? 'primary.light' : 'transparent',
            color: isListView ? 'primary.main' : 'text.secondary',
            '&:hover': { bgcolor: 'primary.light' },
          }}
        >
          <ViewListIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Payments Toggle */}
      <Button
        onClick={() => setShowPayments((prev) => !prev)}
        variant="outlined"
        size="small"
        startIcon={showPayments ? <VisibilityOffIcon /> : <VisibilityIcon />}
        sx={{
          height: 36,
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 500,
          borderColor: 'primary.main',
          color: 'primary.main',
          px: 1.5,
          '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.5 } },
          '&:hover': {
            backgroundColor: 'primary.light',
            borderColor: 'primary.main',
          },
        }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {showPayments ? 'Payments' : 'Payments'}
        </Box>
      </Button>
    </Box>

    {/* Pagination Controls */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Rows per page</InputLabel>
        <Select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
          label="Rows per page"
        >
          {[5, 10, 25, 50].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Pagination
        count={Math.ceil(totalCount / limit)}
        page={currentPage}
        onChange={(_, page) => setCurrentPage(page)}
        color="primary"
        size="small"
        siblingCount={1}
        boundaryCount={0}
        sx={{
          '& .MuiPaginationItem-root': {
            minWidth: 32,
            height: 32,
          },
        }}
      />
    </Box>
  </Box>
</Grid>



  </Grid>
</Paper>
      {/* Salary Card */}
     <FinanceCard
       key={groupType + selectedGroupId} 
      groupType={groupType ?? undefined}
      salaryMode={salaryMode}
      feeMode={feeMode}
      loading={loading}
      salaries={salaries}
      fees={fees}
      searchQuery={searchQuery}
      openFormId={openFormId}
      setOpenFormId={setOpenFormId}
      handleEditClick={handleEditClick}
      showPayments={showPayments}
      records={records}
      fetchAllRecords={fetchOverview}
      components={components}
      groupId={selectedGroupId ?? ''} // Pass groupId to SalaryList
      isListView={isListView}
      setCurrentMode={setCurrentMode}
      currentMode={currentMode}
    />
    {(salaryMode === 'Member' || feeMode === 'Member') && selectedGroupId &&(
      <EditMemberFinanceStructure
        components={components}
        setComponents={setComponents}
        setSalaries={setSalaries}
        setFees={setFees}
        resolvedMode={groupType === 'BOTH' ? currentMode : groupType}
        editMemberId={editMemberId}
        setEditMemberId= {setEditMemberId}
        selectedGroupId={selectedGroupId}
        setEditOpen={setEditOpen}
        editOpen={editOpen}
      />)}
    </Box>
     </main>
    </>
  );
}