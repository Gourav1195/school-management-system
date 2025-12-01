'use client'

import React, { useEffect, useState } from 'react'
import {
  Box, Typography,  Button,  List,  ListItem,  ListItemText,  Dialog,  DialogTitle,  DialogContent,  DialogActions, 
   TextField,  Paper,  IconButton,  Chip,  Divider,  Tooltip,  MenuItem,  Select,  Tabs,  Tab,
  } from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/app/utils/apiClient'
import { Group, Member,  } from '@/types/all';
import Attendance from '@/app/components/Group/MemberAttendance';
import Head from 'next/head';
import Marks from '@/app/components/Group/MemberMarks';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

export default function GroupDetail() {
  const params = useParams()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');  
  const [activeTab, setActiveTab] = useState(0);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [group, setGroup] = useState<Group | null>(null)
  const [open, setOpen] = useState(false)
  const [newMember, setNewMember] = useState<Member>({
    id: '',
    memberNo: 0,
    balance: 0,
    name: '',
    email: '',
    phoneNo: '',
    gender: '',
    special: '',
    criteriaVal: false,
    groupId: '',
    joiningDate: '',
    tenantId: '',
    // tenant: null,
    attendance: [],
    attendanceRecords: []
  })
  useEffect(() => {
  const handler = debounce(() => {
    setSearch(searchInput);
    setPage(1); // reset page when search is updated
  }, 500); // 500ms delay

  handler();
  return () => handler.cancel();
}, [searchInput]);

  const fetchGroup = async () => {
    try {
      const res = await apiClient(
      `/api/group/${params?.id}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      )
      if (!res){
      toast.error('Members request failed');
        return
      } ;
      if (!res.ok) {
        router.push('/not-found') // fallback
        return
      }

      const data = await res.json()
      setGroup(data)
    } catch (error) {
      console.error('Failed to fetch group:', error)
    }
  }


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (params?.id) fetchGroup();
  }, [params?.id, page, search]);


  // const handleAddMember = async () => {
  //   await apiClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/member`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       ...newMember,
  //       groupId: group.id,
  //     }),
  //   })

  //   setOpen(false)
  //   setNewMember({ name: '', criteria: '', criteriaVal: false })
  //   fetchGroup()
  // }

  // const handleEditMember = async (memberId: string) => {
  //   await apiClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/member/${memberId}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(newMember),
  //   })

  //   setOpen(false)
  //   setNewMember({ name: '', criteria: '', criteriaVal: false })
  //   fetchGroup()
  // }
  const handleEditMember = (member: any, index: number) => {
    setNewMember(member)
    setEditIndex(index) // You can also use setSelectedMemberId(member.id) if preferred
    setOpen(true)
  }

  const handleMemberSubmit = async () => {
    if (editIndex !== null) {
      // Edit member
      await apiClient(`/api/member/${newMember.id}`, {
        method: 'PUT',
        body: JSON.stringify(newMember)
      })
    } else {
      // Add new member
      if (!group) return; // Prevent submission if group is null
      await apiClient(`/api/member`, {
        method: 'POST',
        body: JSON.stringify({ ...newMember, groupId: group.id })
      })
    }

    fetchGroup()
    setOpen(false)
    setEditIndex(null)
    setNewMember({ 
      id: '',
      memberNo: 0,
      balance: 0,
      name: '',
      email: '',
      phoneNo: '',
      gender: '',
      special: '',
      // criteriaVal: false,
      groupId: '',
      joiningDate: '',
      tenantId: '',
      // tenant: null,
      attendance: [],
      attendanceRecords: []
    })
  }

  const handleDeleteMember = async (memberId: string) => {
    // console.log(memberId)
    await apiClient(`/api/member/${memberId}`, {
      method: 'DELETE',
    })

    fetchGroup()
  }

  // const fetchMember = async (memberId: string) => {
  //   const res = await apiClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/member/${memberId}`)
  //   const data = await res.json()
  //   setNewMember(data)
  //   setOpen(true)
  // }
  // if (!group) return <Typography>Loading group data...</Typography>

  //   useEffect(() => {
  //   if (!group?.id || !selectedDate) return;

  //   const yyyyMMdd = formatISO(selectedDate, { representation: 'date' });
  //   apiClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${group.id}/attendance?date=${yyyyMMdd}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       // build map of memberId → present
  //       const map: Record<string, boolean> = {};
  //       data.records?.forEach((r: any) => {
  //         map[r.memberId] = r.present;
  //       });
  //       setAttendance(map);
  //     })
  //     .catch(console.error);
  // }, [group?.id, selectedDate]);

  // // 2.2 Save handler
  // const handleSaveAttendance = () => {
  //   if (!group?.id || !selectedDate) return;
  //   const yyyyMMdd = formatISO(selectedDate, { representation: 'date' });
  //   const records = Object.entries(attendance).map(([memberId, present]) => ({ memberId, present }));

  //   apiClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${group.id}/attendance`, {
  //     method: 'POST',
  //     // headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ date: yyyyMMdd, records })
  //   })
  //   .then(res => res.json())
  //   .then(() => {
  //     // optionally show a toast/snackbar
  //   })
  //   .catch(console.error);
  // };

  return (
     <>
      <Head>
        <title>Group | EquaSeed</title>
        <meta name="description" content="Organize your Organisation" />
      </Head>
      <main>
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {group?.name} Members
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewMember({ id: '',
              memberNo: 0,
              balance: 0,
              name: '',
              email: '',
              phoneNo: '',
              gender: '',
              special: '',
              // criteriaVal: false,
              groupId: '',
              joiningDate: '',
              tenantId: '',
              // tenant: null,
              attendance: [],
              attendanceRecords: []
            });
            setEditIndex(null);
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
          Add Member
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: '#4361ee',
            height: 3,
            borderRadius: 2
          }
        }}
      >
        <Tab
          label="Members"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            '&.Mui-selected': { color: '#4361ee' }
          }}
        />
        <Tab
          label="Attendance"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            '&.Mui-selected': { color: '#4361ee' }
          }}
        />
        <Tab
          label="Marks"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            '&.Mui-selected': { color: '#4361ee' }
          }}
        />
      </Tabs>
        <TextField
          label="Search Members"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          sx={{ml:4}}
        />
      <Box sx={{ p: 2 }}>
        {activeTab === 0 ? (
          <Paper elevation={0} sx={{
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
          }}>
            <List sx={{ p: 0 }}>
              {group?.members?.map((member: any, index: number) => (
                <React.Fragment
                  key={member.id}
                // key={index}
                >
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': { backgroundColor: '#f9faff' },
                      transition: 'background-color 0.2s'
                    }}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditMember(member, member.id)}
                            sx={{
                              color: '#4361ee',
                              '&:hover': { backgroundColor: '#e0e7ff' },
                              mr: 1
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteMember(member.id)}
                            sx={{
                              color: '#ef4444',
                              '&:hover': { backgroundColor: '#fee2e2' }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
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
                        <Typography
                          variant="body1"
                          fontWeight="500"
                          onClick={() => router.push(`/member/${member.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {member?.name}
                        </Typography>
                      }
                      secondary={
                        member?.criteria && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Chip
                              label={member?.criteria}
                              size="small"
                              sx={{
                                backgroundColor: '#e0f2fe',
                                color: '#0c4a6e',
                                mr: 1,
                                fontWeight: 500
                              }}
                            />
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: member?.criteriaVal ? '#166534' : '#b91c1c',
                              fontWeight: 500
                            }}>
                              {member?.criteriaVal ?
                                <><CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> Completed</> :
                                <><CloseIcon fontSize="small" sx={{ mr: 0.5 }} /> Pending</>
                              }
                            </Box>
                          </Box>
                        )
                      }
                    />
                  </ListItem>
                  {index < group?.members?.length - 1 && <Divider sx={{ mx: 2 }} />}
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
                    This group doesn&quot;t have any members yet. Click &quot;Add Member&quot; to get started.
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>

        ) : activeTab === 1 ? (
         <Attendance group={group} page={page} search={search} />
        ) : (
          <Marks group={group}  />
        )}

        <Box display="flex" gap={2} alignItems="center" mb={2}>
        <Button onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</Button>
        <Typography>Page {page}</Typography>
        <Button onClick={() => setPage(prev => prev + 1)}>Next</Button>
      </Box>

      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          setEditIndex(null) // Clear edit mode on close
          setNewMember({id: '',
            memberNo: 0,
            balance: 0,
            name: '',
            email: '',
            phoneNo: '',
            gender: '',
            special: '',
            // criteriaVal: false,
            groupId: '',
            joiningDate: '',
            tenantId: '',
            // tenant: null,
            attendance: [],
            attendanceRecords: []
          })
        }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            width: '100%',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 'bold',
          backgroundColor: '#f5f7ff',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {editIndex !== null ? 'Edit Member' : 'Add New Member'}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <TextField
  label="Member ID"
  type="number"
  fullWidth
  margin="dense"
  value={newMember.memberNo || ''}
  onChange={(e) => setNewMember({ ...newMember, memberNo: parseInt(e.target.value || '0') })}
/>

<TextField
  label="Member Name"
  type="text"
  fullWidth
  margin="dense"
  value={newMember.name || ''}
  onChange={(e) => setNewMember({ ...newMember, name: e.target.value})}
/>

<TextField
  label="Email"
  fullWidth
  margin="dense"
  value={newMember.email || ''}
  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
/>

<TextField
  label="Phone Number"
  fullWidth
  margin="dense"
  value={newMember.phoneNo || ''}
  onChange={(e) => setNewMember({ ...newMember, phoneNo: e.target.value })}
/>

<Select
  fullWidth
  value={newMember.gender || ''}
  onChange={(e) =>
    setNewMember({
      ...newMember,
      gender: e.target.value,
    })
  }
  sx={{ borderRadius: 3, mt: 2 }}
>
  <MenuItem value="">Select Gender</MenuItem>
  <MenuItem value="Male">Male</MenuItem>
  <MenuItem value="Female">Female</MenuItem>
  <MenuItem value="Others">Other</MenuItem>
</Select>

<TextField
  label="Joining Date"
  type="date"
  fullWidth
  margin="dense"
  InputLabelProps={{ shrink: true }}
  value={newMember.joiningDate?.slice(0, 10) || ''}
  onChange={(e) => setNewMember({ ...newMember, joiningDate: e.target.value })}
/>

<TextField
  label="Special Notes"
  fullWidth
  margin="dense"
  value={newMember.special || ''}
  onChange={(e) => setNewMember({ ...newMember, special: e.target.value })}
/>

{/* <FormControl fullWidth margin="dense">
  <InputLabel id="criteria-status-label">Criteria Status</InputLabel>
  <Select
    labelId="criteria-status-label"
    value={newMember.criteriaVal ? 'true' : 'false'}
    onChange={(e) =>
      setNewMember({
        ...newMember,
        criteriaVal: e.target.value === 'true',
      })
    }
  >
    <MenuItem value="true">Completed</MenuItem>
    <MenuItem value="false">Pending</MenuItem>
  </Select>
</FormControl> */}

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => {
            setOpen(false)
            setEditIndex(null)
            setNewMember({
              id: '',
              memberNo: 0,
              balance: 0,
              name: '',
              email: '',
              phoneNo: '',
              gender: '',
              special: '',
              // criteriaVal: false,
              groupId: '',
              joiningDate: '',
              tenantId: '',
              // tenant: null,
              attendance: [],
              attendanceRecords: []
            })
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMemberSubmit}>
            {editIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
    </main>
    </>
  );
};
