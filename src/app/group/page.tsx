'use client'
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Skeleton,
  CardActions,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  StarBorder,
  Star,
  ViewList as ViewListIcon,
  GridView as GridViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '@/app/utils/apiClient';
import { useRouter } from 'next/navigation';
import GroupModal from '@/app/components/Modals/GroupModal';
import AllModal from '../components/Modals/Modal';
import SearchIcon from '@mui/icons-material/Search';
import Head from 'next/head';
import { GroupFormData } from '@/types/all';
import Academic from '../components/Group/Academic';

interface Group {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  criteria?: string;
  groupSalary?: number;
  groupFee?: number;
  feeMode?: 'Group' | 'Member';
  salaryMode?: 'Group' | 'Member';
  type?: 'FEE' | 'SALARY';
  members?: { id: string; name: string }[];
  feeStructures?: { id: string; name: string }[];
  salaryStructures?: { id: string; name: string }[];
}
type Subject = { id: string; name: string, code: string };

export default function GroupListPage() {
  const { token, loading, role, memberId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState('');
  const [loadingIn, setLoadingIn] = useState<boolean>(false);
  // const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [readonly, setReadonly] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [favGroups, setFavGroups] = useState<{ id: string; name: string }[]>([])
  const [isListView, setIsListView] = useState(true); // Default to list view
  const [validationError, setValidationError] = useState<string | null>(null);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupForm, setGroupForm] = useState<GroupFormData>({
    name: '',
    criteria: '',
    groupSalary: 0,
    groupFee: 0,
    feeMode: 'Group',
    salaryMode: 'Group',
    type: 'FEE',
    subjectId: []
  });
  const router = useRouter();

    // const fetchSubjects = async () => {
    //   const res = await apiClient('/api/subject');
    //   if(!res) return;
    //   const data = await res.json();
    //   setAllSubjects(data);
    // };
  
  const fetchGroups = async () => {
    setLoadingIn(true);
    setError('');
    try {
    const res = await apiClient(`/api/group?search=${searchQuery}&page=${page}&limit=${limit}`);
      if (!res) return setError('Failed to fetch groups');
      const data = await res.json();
      console.log('data', data, )

      if (!res.ok) {
        setError(data.error || 'Failed to fetch groups');
      } else {
        setGroups(data.data);
        setTotalPages(data.pagination.totalPages)
        // setGroups(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      setError('Error fetching groups');
      console.error(err);
    } finally {
      setLoadingIn(false);
    }
  };

  const getGroupId = async(memberId: string) => {
    if (!memberId) return null;
    // console.log('memberId/////////////', memberId, )
      const res = await apiClient(`/api/member/${memberId}`);
      if (!res) return;
      const data = await res.json();
      return data.groupId ?? null;
    }

  useEffect(() => {
    if (!token && !loading && memberId) {
      router.push('/auth/login');
      return;
    }
    if (role === 'Viewer' || role === 'Member') {
      const groupId = getGroupId(memberId ?? '')
      // getGroupId(memberId)
        if (groupId) {
          router.push(`/group/${groupId}`);        
        }        
      return;
    }
      
    const timeout = setTimeout(() => {
      fetchGroups();
    }, 300); // debounce time

  return () => clearTimeout(timeout);
}, [searchQuery, page, limit, token, loading]);


  // Fetch favorites
  useEffect(() => {
    async function fetchFavorites() {
      const res = await apiClient('/api/user/favorites');
      if (!res) return;
      const data = await res.json();
      setFavGroups(data.favorites || []);
    }
    fetchFavorites();
  }, []);

  const handleOpenEditModal = (group: Group) => {
    setReadonly(false);
    setSelectedGroup(group);
    setGroupForm({
      name: group.name || '',
      criteria: group.criteria || '',
      groupSalary: group.groupSalary || 0,
      groupFee: group.groupFee || 0,
      feeMode: group.feeMode || 'Group',
      salaryMode: group.salaryMode || 'Group',
      type: group.type || 'FEE',
      subjectId: [],
    });
    setIsEdit(true);
    setGroupModalOpen(true);
  };

  const handleOpenViewModal = (group: Group) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name || '',
      criteria: group.criteria || '',
      groupSalary: group.groupSalary || 0,
      groupFee: group.groupFee || 0,
      feeMode: group.feeMode || 'Group',
      salaryMode: group.salaryMode || 'Group',
      type: group.type || 'FEE',
      subjectId: []
    });
    setIsEdit(false); // important
    setGroupModalOpen(true);
    setReadonly(true);
  };


  const handleOpenDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    // setOpenDeleteModal(true);
    setIsDeleteModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setReadonly(false);
    setSelectedGroup(null);
    setGroupForm({
      name: '',
      criteria: '',
      groupSalary: 0,
      groupFee: 0,
      feeMode: 'Group',
      salaryMode: 'Group',
      type: 'FEE',
      subjectId: []
    });
    setIsEdit(false);
    setGroupModalOpen(true);
  };

  const validateForm = () => {
    if (!groupForm) return false;

    if (!groupForm.name.trim()) {
      setValidationError('Group name is required');
      return false;
    }
    if (groupForm.type === 'FEE' && groupForm.groupFee && groupForm.groupFee <= 0) {
      setValidationError('Group fee must be greater than 0');
      return false;
    }
    if (groupForm.type === 'SALARY' && groupForm.groupSalary && groupForm.groupSalary <= 0) {
      setValidationError('Group salary must be greater than 0');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!token || !groupForm.name || !validateForm()) return;

    const url = isEdit && selectedGroup ? `/api/group/${selectedGroup.id}` : '/api/group';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setError('');
      const res = await apiClient(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupForm),
      });
      if (!res) return;
      if (res.ok) {
        const updatedGroup = await res.json();
        if (isEdit) {
          setGroups(groups.map(g => (g.id === updatedGroup.id ? updatedGroup : g)));
        } else {
          setGroups([...groups, updatedGroup]);
        }
        setGroupModalOpen(false);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to save group');
      }
    } catch (err) {
      setError('Error saving group');
      console.error(err);
    }
  };


  const handleDeleteGroup = async () => {
    if (!selectedGroup || !token) return;

    try {
      setError('');
      const res = await apiClient(`/api/group/${selectedGroup.id}`, {
        method: 'DELETE',
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (!res) return;
      if (res.ok) {
        setGroups(groups.filter(g => g.id !== selectedGroup.id));
        handleCloseModal();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to delete group');
      }
    } catch (err) {
      setError('Error deleting group');
      console.error(err);
    }
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   });
  // };

  // Close all modals and reset selected group
  const handleCloseModal = () => {
    setOpenViewModal(false);
    setIsDeleteModalOpen(false);
    setGroupModalOpen(false);
    setSelectedGroup(null);
  };

  const handleToggleFavorite = async (groupId: string) => {
    const isFav = favGroups.some(fav => fav.id === groupId);
    const method = isFav ? 'DELETE' : 'POST';

    await apiClient('/api/user/favorites', {
      method,
      // headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId })
    });

    setFavGroups(prev =>
      isFav
        ? prev.filter(fav => fav.id !== groupId)
        : [...prev, { id: groupId, name: 'Unknown' }] // optionally fetch name if not known
    );
  };

  const headCellStyle = {
    fontWeight: 'bold',
    color: '#4361ee',
    py: 3,
    fontSize: '1.1rem'
  };

  const cellStyle = {
    py: 2.5,
    borderBottom: '1px solid #f0f0f0'
  };

  // Render grid view item
  const renderGridItem = (group: Group) => (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={group.id}>
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 24px rgba(67, 97, 238, 0.15)',
          borderColor: '#4361ee40',
        }
      }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{
              // bgcolor: 'primary.light',
              // color: 'primary.main',
              bgcolor: '#e0e7ff', color: '#4361ee',
              width: 40,
              height: 40,
              mr: 2
            }}>
              <GroupIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/group/${group.id}`)}
              >
                {group.name}
              </Typography>
              <Chip
                label={group.type}
                size="small"
                sx={{
                  mt: 0.5,
                  // bgcolor: group.type === 'FEE' ? 'info.light' : 'warning.light',
                  // color: group.type === 'FEE' ? 'info.dark' : 'warning.dark',
                  bgcolor: group.type === 'FEE' ? '#e0f2fe' : '#fef3c7',
                  color: group.type === 'FEE' ? '#0284c7' : '#92400e',
                  fontWeight: 500
                }}
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => handleToggleFavorite(group.id)}
              sx={{ ml: 1 }}
            >
              {favGroups.some(fav => fav.id === group.id) ? (
                <Star sx={{ color: 'warning.main' }} />
              ) : (
                <StarBorder sx={{ color: 'text.secondary' }} />
              )}
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Fee</Typography>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                ₹{group.groupFee?.toLocaleString() || '0.00'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Salary</Typography>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                ₹{group.groupSalary?.toLocaleString() || '0.00'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Members</Typography>
              <Typography variant="h6" fontWeight={600}>
                {group.members?.length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Mode</Typography>
              <Typography variant="body1" fontWeight={500}>
                {group.feeMode}/{group.salaryMode}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{
          pt: 1.5,
          px: 2,
          pb: 1.5,
          justifyContent: 'space-between',
          borderTop: '1px solid #f5f5f5'
        }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenViewModal(group)}
            sx={{ borderRadius: 2 }}
          >
            View
          </Button>
          <Box>
            <IconButton
              size="small"
              onClick={() => handleOpenEditModal(group)}
              sx={{ color: 'success.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleOpenDeleteModal(group)}
              sx={{ color: 'error.main', ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    </Grid>
  );

  // Render grid view skeleton
  const renderGridSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, idx) => (
        <Grid size={{ xs: 12, md: 4, sm: 6, lg: 3 }} key={idx}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="40%" height={24} />
                </Box>
              </Box>
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid size={{ xs: 6, }} key={i}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={28} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Skeleton variant="rounded" width={90} height={36} />
              <Box>
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} sx={{ ml: 1 }} />
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
        <>
      <Head>
        <title>Manage Groups | EquaSeed</title>
        <meta name="description" content="Organize your school or team into structured groups with ease. View, edit, and manage all group-level data in one powerful dashboard." />
      </Head>
      <main>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{
            fontWeight: 'bold',
            color: '#1a237e',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <GroupIcon sx={{ fontSize: 36, color: '#4361ee' }} />
            All Groups
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and organize your institution s groups
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            display: 'flex',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}>
            <IconButton
              onClick={() => setIsListView(false)}
              sx={{
                color: isListView ? 'text.secondary' : '#4361ee',
                bgcolor: isListView ? 'transparent' : '#e0e7ff',
                '&:hover': { bgcolor: isListView ? '#f5f5f5' : '#d0d9ff' }
              }} aria-label="Grid view"
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              onClick={() => setIsListView(true)}
              sx={{
                color: isListView ? '#4361ee' : 'text.secondary',
                bgcolor: isListView ? '#e0e7ff' : 'transparent',
                '&:hover': { bgcolor: isListView ? '#d0d9ff' : '#f5f5f5' }
              }} aria-label="List view"
            >
              <ViewListIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreateModal()}
            sx={{
              backgroundColor: '#4361ee',
              color: 'white',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
              '&:hover': {
                backgroundColor: '#3a56d4',
                boxShadow: '0 6px 14px rgba(67, 97, 238, 0.4)'
              }
            }}
          >
            Add New Group
          </Button>
        </Box>
      </Box>

      <TextField
  size="small"
  placeholder="Search groups by name"
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setPage(1); // reset to page 1 on search
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ color: '#4361ee', fontSize: '1rem' }} />
      </InputAdornment>
    ),
    sx: {
      borderRadius: 3,
      backgroundColor: 'background.paper',
      mb:1, ml:1,
      height: 36,
      '& input': { py: 0.8, fontSize: '0.9rem' }
    }
  }}
  sx={{ flexGrow: 1, maxWidth: 250 }}
/>
      {/* <Subjects subjects= {allSubjects} fetchSubjects={fetchSubjects}/> */}
     < Academic />
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loadingIn ? (
        isListView ? (
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
        ) : (
          renderGridSkeleton()
        )
      ) : groups.length > 0 ? (
        isListView ? (
          /* Groups Table */
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.level2' }}>
                    <TableCell sx={headCellStyle}>Group Name</TableCell>
                    {/* <TableCell sx={headCellStyle}>Fee Mode</TableCell>
        <TableCell sx={headCellStyle}>Salary Mode</TableCell> */}
                    <TableCell sx={headCellStyle}>Group Fee</TableCell>
                    <TableCell sx={headCellStyle}>Group Salary</TableCell>
                    <TableCell sx={headCellStyle}>Type</TableCell>
                    <TableCell sx={headCellStyle}>Total Members</TableCell>
                    {role === 'Finance' || role === 'Admin' && (
                      <>
                        {/* <TableCell sx={headCellStyle}>Assigned Fee Structures</TableCell>
            <TableCell sx={headCellStyle}>Assigned Salary Structures</TableCell> */}
                      </>
                    )}
                    <TableCell sx={{ ...headCellStyle, textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {groups.map(group => (
                    <TableRow
                      key={group.id}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { 
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper
                        },
                        '&:hover': { 
                          backgroundColor: (theme) => theme.palette.action.hover
                        }
                      }}
                    >
                      {/* Group Name */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4361ee', width: 40, height: 40 }}>
                            <GroupIcon fontSize="small" />
                          </Avatar>
                          <Typography
                            sx={{ cursor: 'pointer' }}
                            fontWeight={500}
                            onClick={() => router.push(`/group/${group.id}`)}
                          >
                            {group.name}
                          </Typography>
                          <IconButton onClick={() => handleToggleFavorite(group.id)}>
                            {favGroups.some(fav => fav.id === group.id) ? (
                              <Star sx={{ color: '#ffb703' }} />
                            ) : (
                              <StarBorder sx={{ color: '#9e9e9e' }} />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>

                      {/* Fee/Salary Mode */}
                      {/* <TableCell sx={cellStyle}>{group.feeMode}</TableCell>
            <TableCell sx={cellStyle}>{group.salaryMode}</TableCell> */}

                      {/* Financials */}
                      <TableCell sx={cellStyle}>₹{group.groupFee?.toFixed(2) ?? '0.00'}</TableCell>
                      <TableCell sx={cellStyle}>₹{group.groupSalary?.toFixed(2) ?? '0.00'}</TableCell>

                      {/* Type */}
                      <TableCell sx={cellStyle}>
                        <Chip
                          label={group.type}
                          size="small"
                          sx={{
                            bgcolor: group.type === 'FEE' ? '#e0f2fe' : '#fef3c7',
                            color: group.type === 'FEE' ? '#0284c7' : '#92400e',
                            fontWeight: 500,
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell sx={cellStyle}>{group.members?.length ?? 0}</TableCell>

                      {/* Finance Extra Info */}
                      {role === 'Finance' || role === 'Admin' && (
                        <>
                          {/* <TableCell sx={cellStyle}>{group.feeStructures?.length ?? 0}</TableCell>
                <TableCell sx={cellStyle}>{group.salaryStructures?.length ?? 0}</TableCell> */}
                        </>
                      )}

                      {/* Actions */}
                      <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>
                        <Stack direction="row" justifyContent="center" spacing={1}>
                          <Tooltip title="View details">
                            <IconButton
                              onClick={() => handleOpenViewModal(group)}
                              sx={{ color: '#4361ee', '&:hover': { backgroundColor: '#e0e7ff' } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit group">
                            <IconButton
                              onClick={() => handleOpenEditModal(group)}
                              sx={{ color: '#10b981', '&:hover': { backgroundColor: '#d1fae5' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete group">
                            <IconButton
                              onClick={() => handleOpenDeleteModal(group)}
                              sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fee2e2' } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          /* Grid View */
          <Grid container spacing={3}>
            {groups.map(group => renderGridItem(group))}
          </Grid>
        )
      ) : (
        /* Empty State */
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 4,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'primary.light',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight="500" color="text.primary" gutterBottom>
            No groups found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Create your first group to start organizing users
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreateModal()}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: '0 6px 14px rgba(67, 97, 238, 0.4)',
              },
            }}
          >
            Create Group
          </Button>
        </Box>
      )}

      {totalPages > 1 && (
  <Box display="flex" justifyContent="center" mt={3}>
    <Pagination
      count={totalPages}
      page={page}
      onChange={(e, value) => setPage(value)}
      color="primary"
      size="medium"
      variant="outlined"
      shape="rounded"
    />
  </Box>
)}

      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        formData={groupForm}
        setFormData={setGroupForm}
        readonly={readonly}
        allSubjects={allSubjects}
      />

      <AllModal
        open={isDeleteModalOpen}
        // handleClose={() => setIsDeleteModalOpen(false)}
        handleClose={handleCloseModal}
        handleConfirm={handleDeleteGroup}
        title="Delete Group"
        message={'Are you sure you want to delete this Group?'}
      // btntxt="Ok"
      // icon={{ type: "success" }}
      // color="primary"    
      />
    </Container>
    </main>
    </>
  );
}