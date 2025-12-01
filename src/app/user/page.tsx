'use client'
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, IconButton, Button, TextField,
  InputAdornment, Typography, Dialog, DialogActions,
  DialogContent, Tooltip, FormControl, InputLabel,
  MenuItem, Select, Stack, Grid, Avatar,
  Badge, Card, CardContent, CardActions, Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AddUserIcon,
  Refresh as RefreshIcon,
  Lock,
  ViewList,
  GridView,
  Close as CloseIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type User = {
  id?: string | number;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Moderator' | 'Editor' | 'Viewer' | 'Finance' | '';
  dob: Date | null;
}

const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [form, setForm] = useState<User>({ name: '', email: '', password: '', role: '', dob:null});
  const [modalData, setModalData] = useState({
    open: false,
    handleConfirm: () => { },
    title: '',
    message: '',
    btntxt: '',
    color: '',
    handleClose: () => setModalData(prev => ({ ...prev, open: false }))
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { tenantId, token, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push('/auth/login');
      return;
    }
    if (role !== 'SuperAdmin' && role !== 'Admin' && role !== 'Moderator' && role !== 'Editor') {
      router.push('/');
      return;
    }
  }, [loading, token, router, role]);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (page: number) => {
    try {
      const res = await apiClient(`/api/user?page=${page}&limit=10`);
      if (!res) return;
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, dob: user.dob });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (id: string | number) => {
    await apiClient(`/api/user/${id}`, { method: 'DELETE' });
    fetchUsers(page);
  };

  const handleRefresh = () => {
    fetchUsers(page);
  };
  console.log('form', form)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.role || !form.dob) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.password && form.password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      if (selectedUser) {
        await apiClient(`/api/user/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        toast.success('User updated successfully');
      } else {
        const newFormData = { ...form, tenantId };
        await apiClient(`/api/user`, {
          method: 'POST',
          body: JSON.stringify(newFormData),
        });
        toast.success('User created successfully');
      }

      setOpen(false);
      setSelectedUser(null);
      setForm({ name: '', email: '', role: '', dob:null });
      setConfirmPassword('');
      fetchUsers(page);
    } catch (error) {
      toast.error('Error saving user');
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteModal = (id: string | number, name: string) => {
    setModalData({
      open: true,
      handleConfirm: () => { handleDelete(id); },
      title: 'Delete User?',
      message: `Are you sure you want to delete "${name}"?`,
      btntxt: "Delete",
      color: "error",
      handleClose: () => setModalData(prev => ({ ...prev, open: false }))
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return { bg: '#e0f2fe', text: '#0c4a6e' };
      case 'Moderator': return { bg: '#f0fdf4', text: '#166534' };
      case 'Editor': return { bg: '#f0fdf4', text: '#166534' };
      case 'Finance': return { bg: '#fef6e6', text: '#854d0e' };
      case 'Viewer': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const renderUserCard = (user: User) => {
    const roleColor = getRoleColor(user.role);

    return (
      <Grid size={{ xs: 12, md: 4, lg: 3 }} key={user.id}>
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e0e0e0',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{
                bgcolor: '#4361ee',
                width: 48,
                height: 48,
                mr: 2,
                fontSize: '1.2rem'
              }}>
                {user.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  sx={{
                    bgcolor: roleColor.bg,
                    color: roleColor.text,
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 22,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <EmailIcon sx={{
                color: 'text.secondary',
                fontSize: 18,
                mr: 1
              }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </CardContent>

          <CardActions sx={{
            justifyContent: 'flex-end',
            p: 2,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Tooltip title="Edit user">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(user);
                }}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(67, 97, 238, 0.1)' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete user">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (user.id && user.name)
                    handleDeleteModal(user.id, user.name);
                }}
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderUserList = (user: User) => {
    const roleColor = getRoleColor(user.role);

    return (
      <Grid size={{ xs: 12, }} key={user.id}>
        <Paper sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: '#f8faff',
            borderColor: '#4361ee'
          }
        }}>
          <Avatar sx={{
            bgcolor: '#4361ee',
            width: 48,
            height: 48,
            mr: 3,
            fontSize: '1.2rem'
          }}>
            {user.name.charAt(0)}
          </Avatar>

          <Box flexGrow={1}>
            <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
              <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
              {user.email}
            </Typography>
          </Box>

          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor: roleColor.bg,
              color: roleColor.text,
              fontWeight: 500,
              fontSize: '0.8rem',
              height: 28,
              mr: 2
            }}
          />

          <Box display="flex">
            <Tooltip title="Edit user">
              <IconButton
                onClick={() => handleEdit(user)}
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(67, 97, 238, 0.1)' },
                  mr: 1
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete user">
              <IconButton
                onClick={() => {
                  if (user.id && user.name)
                    handleDeleteModal(user.id, user.name);
                }
                }
                sx={{
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <>
      <Head>
        <title>User Management | EquaSeed</title>
        <meta name="description" content="Add, edit, and assign roles to your team. Manage user access and permissions with complete control from a single dashboard." />
      </Head>
      <main>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper elevation={0} sx={{
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            mb: 3
          }}>
            {/* Header with Controls */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', },
              p: 3,
              gap: 2,
              backgroundColor: 'background.paper',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                User Management
              </Typography>

              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                width: { xs: '100%', md: 'auto' }
              }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  // fullWidth={viewMode === 'grid'}
                  sx={{
                    flexGrow: 1,
                    maxWidth: { xs: '100%', md: 300 },
                    '& .MuiInputBase-root': {
                      borderRadius: 3,
                      backgroundColor: 'background.level2'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />

                <Box display="flex" gap={1}>

                  <IconButton
                    onClick={() => setViewMode('grid')}
                    size="small"
                    sx={{
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: '#f0f4ff',
                        color: 'primary.main'
                      }
                    }}
                    aria-label="Grid view"
                  >
                    <GridView fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    size="small"
                    sx={{
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: '#f0f4ff',
                        color: 'primary.main'
                      }
                    }}
                    aria-label="List view"
                  >
                    <ViewList fontSize="small" />
                  </IconButton>

                  <Tooltip title="Refresh data">
                    <IconButton
                      onClick={handleRefresh}
                      sx={{
                        backgroundColor: '#4361ee',
                        color: 'white',
                        '&:hover': { backgroundColor: '#3a56d4' }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>

                  <Button
                    variant="contained"
                    startIcon={<AddUserIcon />}
                    onClick={() => {
                      setSelectedUser(null);
                      setForm({ name: '', email: '', role: '', dob: null });
                      setConfirmPassword('');
                      setOpen(true);
                    }}
                    sx={{
                      backgroundColor: '#4361ee',
                      color: 'white',
                      borderRadius: 3,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#3a56d4',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Add User
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* User Display Area */}
            <Box sx={{ p: 3 }}>
              {filteredUsers.length > 0 ? (
                <Grid container spacing={3}>
                  {viewMode === 'grid'
                    ? filteredUsers.map(renderUserCard)
                    : filteredUsers.map(renderUserList)}
                </Grid>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  py: 8,
                  backgroundColor: 'background.level1',
                  borderRadius: 3
                }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'background.level1',
                    // backgroundColor: '#f0f4ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <SearchIcon sx={{ fontSize: 40, color: '#4361ee' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="500" color="text.primary" gutterBottom>
                    No users found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                    No users match your search criteria. Try adjusting your search or add a new user.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddUserIcon />}
                    onClick={() => {
                      setSelectedUser(null);
                      setForm({ name: '', email: '', role: '', dob:null });
                      setConfirmPassword('');
                      setOpen(true);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 3,
                      px: 3,
                      borderColor: '#4361ee',
                      color: '#4361ee',
                      '&:hover': {
                        backgroundColor: '#f0f4ff',
                        borderColor: '#3a56d4'
                      }
                    }}
                  >
                    Create New User
                  </Button>
                </Box>
              )}
            </Box>

            {/* Pagination */}
            {filteredUsers.length > 10 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
                mb: 4,
                px: 2
              }}>
                <Paper elevation={0} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, md: 2 },
                  p: 1.5,
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f9faff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => fetchUsers(page - 1)}
                    disabled={page === 1}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      borderColor: '#e0e0e0',
                      color: page === 1 ? 'text.disabled' : 'text.primary',
                      '&:hover': {
                        backgroundColor: page === 1 ? 'transparent' : '#f0f4ff',
                        borderColor: '#4361ee'
                      }
                    }}
                  >
                    Previous
                  </Button>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    borderRadius: 3,
                    backgroundColor: '#e0e7ff'
                  }}>
                    <Typography variant="body1" fontWeight={500} color="#4361ee">
                      Page
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a237e">
                      {page}
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="#4361ee">
                      of
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#1a237e">
                      {totalPages}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => fetchUsers(page + 1)}
                    disabled={page === totalPages}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      borderColor: '#e0e0e0',
                      color: page === totalPages ? 'text.disabled' : 'text.primary',
                      '&:hover': {
                        backgroundColor: page === totalPages ? 'transparent' : '#f0f4ff',
                        borderColor: '#4361ee'
                      }
                    }}
                  >
                    Next
                  </Button>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Add/Edit User Dialog */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 4,
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box sx={{
              bgcolor: '#4361ee',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {selectedUser ? 'Edit User' : 'Add New User'}
              </Typography>
              <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ py: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />

                <TextField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Password"
                      name="password"
                      type="password"
                      value={form.password ?? ''}
                      onChange={handleChange}
                      fullWidth
                      margin="dense"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Confirm Password"
                      name="confirmpassword"
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, role: e.target.value as User['role'] }))
                }
                label="Role"
                sx={{
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <BadgeIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                }
              >
                {['Admin', 'Moderator', 'Editor', 'Viewer', 'Finance'].map((c) => (
                  <MenuItem key={c} value={c} sx={{ color: "#6D6976" }}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
                <FormControl fullWidth margin="dense">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        role: e.target.value as User['role'],
                      }))
                    }
                    label="Role"
                    sx={{
                      borderRadius: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <BadgeIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    }
                  >
                    {[
                      'Admin',
                      'Moderator',
                      'Editor',
                      'Viewer',
                      'Finance',
                      ...(role === 'SuperAdmin' ? ['Sales'] : []),
                    ].map((c) => (
                      <MenuItem key={c} value={c} sx={{ color: '#6D6976' }}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
<LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Date of Birth"
    value={form.dob || null}
    onChange={(newValue) =>
      setForm((prev) => ({
        ...prev,
        dob: newValue,
      }))
    }
    slotProps={{
      textField: {
        fullWidth: true,
        margin: 'dense',
        sx: {
          borderRadius: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        },
      },
    }}
  />
</LocalizationProvider>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
              <Button
                onClick={() => setOpen(false)}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  backgroundColor: '#4361ee',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#3a56d4',
                    boxShadow: 'none'
                  }
                }}
              >
                {selectedUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog
            open={modalData.open}
            onClose={modalData.handleClose}
            PaperProps={{
              sx: {
                borderRadius: 4,
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box sx={{
              bgcolor: modalData.color === 'error' ? '#ef4444' : '#4361ee',
              p: 3,
              textAlign: 'center'
            }}>
              <DeleteIcon sx={{ color: 'white', fontSize: 48, mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {modalData.title}
              </Typography>
            </Box>

            <DialogContent sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                {modalData.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone.
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
              <Button
                onClick={modalData.handleClose}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  borderColor: '#e0e0e0',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={modalData.handleConfirm}
                variant="contained"
                sx={{
                  backgroundColor: modalData.color === 'error' ? '#ef4444' : '#4361ee',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: modalData.color === 'error' ? '#dc2626' : '#3a56d4',
                    boxShadow: 'none'
                  }
                }}
              >
                {modalData.btntxt}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </main>
    </>
  );
};

export default UserManagementTable;