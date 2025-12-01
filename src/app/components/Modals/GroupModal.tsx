import {
  Box, Button, Modal, TextField, Typography, IconButton, Select, MenuItem,
  FormControl, InputLabel, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { GroupFormData, Subject } from '@/types/all';


export default function GroupModal({
  open,
  onClose,
  onSubmit,
  isEdit = false,
  formData,
  setFormData,
  readonly,
  allSubjects,
}: {
  open: boolean,
  onClose: () => void,
  onSubmit: () => void,
  isEdit?: boolean,
  formData: GroupFormData,
  setFormData: (data: any) => void,
  readonly?: boolean,
  allSubjects: Subject[],
}) {

  const ViewOnlyField = ({ label, value }: { label: string; value: string | number }) => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ minWidth: 110, flexShrink: 0 }}>
        <Typography component="span" color="text.secondary" fontWeight={600} fontSize={14} sx={{ textTransform: 'capitalize' }}>
          {label}:
        </Typography>
      </Box>
      <Typography component="span" variant="body1" sx={{ color: 'primary.main', ml: 2, }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          bgcolor: isEdit ? '#10b981' : '#4361ee',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}><Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            {readonly ? 'View Group' : isEdit ? 'Edit Group' : 'Create New Group'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Group Name */}
          {readonly ? (
            <ViewOnlyField label="Group Name" value={formData.name} />
          ) : (
            <TextField
              fullWidth
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Criteria */}
          {readonly ? (
            <ViewOnlyField label="Criteria" value={formData.criteria || '-'} />
          ) : (
            <TextField
              fullWidth
              label="Criteria (Optional)"
              value={formData.criteria ?? ''}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          {/* Group Salary */}
          {readonly ? (
            <ViewOnlyField label="Group Salary" value={formData.groupSalary?.toFixed(2) ?? '0.00'} />
          ) : (
            <TextField
              fullWidth
              label="Group Salary"
              type="number"
              value={formData.groupSalary ?? ''}
              onChange={(e) => setFormData({ ...formData, groupSalary: parseFloat(e.target.value) })}
              sx={{ mb: 2 }}
            />
          )}

          {/* Group Fee */}
          {readonly ? (
            <ViewOnlyField label="Group Fee" value={formData.groupFee?.toFixed(2) ?? '0.00'} />
          ) : (
            <TextField
              fullWidth
              label="Group Fee"
              type="number"
              value={formData.groupFee ?? ''}
              onChange={(e) => setFormData({ ...formData, groupFee: parseFloat(e.target.value) })}
              sx={{ mb: 2 }}
            />
          )}

          {/* Fee Mode */}
          {readonly ? (
            <ViewOnlyField label="Fee Mode" value={formData.feeMode} />
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Fee Mode</InputLabel>
              <Select
                value={formData.feeMode}
                label="Fee Mode"
                onChange={(e) => setFormData({ ...formData, feeMode: e.target.value })}
              >
                <MenuItem value="Group">Group-wise</MenuItem>
                <MenuItem value="Member">Member-wise</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Salary Mode */}
          {readonly ? (
            <ViewOnlyField label="Salary Mode" value={formData.salaryMode} />
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Salary Mode</InputLabel>
              <Select
                value={formData.salaryMode}
                label="Salary Mode"
                onChange={(e) => setFormData({ ...formData, salaryMode: e.target.value })}
              >
                <MenuItem value="Group">Group-wise</MenuItem>
                <MenuItem value="Member">Member-wise</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Group Type */}
          {readonly ? (
            <ViewOnlyField label="Group Type" value={formData.type} />
          ) : (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Group Type</InputLabel>
              <Select
                value={formData.type}
                label="Group Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="FEE">FEE</MenuItem>
                <MenuItem value="SALARY">SALARY</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* {
            readonly ? (
              <ViewOnlyField
                label="Subjects"
                value={
                  formData.subjectId?.length
                    ? formData.subjectId.map(id => allSubjects.find(s => s.id === id)?.name || id).join(', ')
                    : 'No subjects selected'
                }
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  label="Subject"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                >
                  {allSubjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          } */}

          {!readonly && (
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onClose} variant="outlined">Cancel</Button>
              <Button
                onClick={onSubmit}
                variant="contained"
                disabled={!formData.name}
                sx={{
                  backgroundColor: isEdit ? '#10b981' : '#4361ee',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: isEdit ? '#0da271' : '#3a56d4'
                  }
                }}
              >
                {isEdit ? 'Save Changes' : 'Create Group'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
