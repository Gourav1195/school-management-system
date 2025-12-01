'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { apiClient } from "@/app/utils/apiClient";
import ComponentLists from './ComponentLists';
import { GroupType, AssignmentMode } from '@prisma/client';

interface ComponentItem { name: string; amount: string; }

interface FinanceStructureProps {
  // groups: { id: string; name: string }[];
  selectedGroupId: string | null;
  settingsOpen: boolean;
  salaryMode: AssignmentMode;
  feeMode: AssignmentMode;
  // groupType: GroupType;
  onFeeModeChange?: (mode: AssignmentMode) => void;
  // onGroupChange: (id: string) => void;
  // onToggleSettings: () => void;
  onSalaryModeChange: (mode: AssignmentMode) => void;
  getFeeSalaries: () => void;
  resolvedMode: GroupType;
}

export default function FinanceStructure({
  // groups,
  selectedGroupId,
  settingsOpen,
  salaryMode,
  // onGroupChange,
  // onToggleSettings,
  // groupType,
  feeMode,
  onFeeModeChange,
  onSalaryModeChange,
  getFeeSalaries,
  resolvedMode,
}: FinanceStructureProps) {
  const [groupName, setGroupName] = useState('');
  const [components, setComponents] = useState<ComponentItem[]>([{ name: '', amount: '' }]);
  const [showStructure, setShowStructure] = useState(false);
  // Load group info when selected
  const isFee = resolvedMode === 'FEE';
  const mode = isFee ? feeMode : salaryMode;
  const setMode = isFee ? onFeeModeChange : onSalaryModeChange;

  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchGroup = async () => {
      const res = await apiClient(`/api/group/${selectedGroupId}`);
      if (!res) return; 
      if (res.ok) {
        const data = await res.json();
        setGroupName(data.name);
        setShowStructure(false);
      }
    };
    fetchGroup();
  }, [selectedGroupId]);

  // Load structure when toggled open
  useEffect(() => {
    if (!selectedGroupId || !showStructure) return;
    const fetchStructure = async () => {
      const type = resolvedMode.toLowerCase(); 
      const res = await apiClient(`/api/group/${selectedGroupId}/${type}-structure`);
      if (!res) return; 
      if (res.ok) {
        const data = await res.json();
        setComponents(
          data.structures?.length > 0
            ? data.structures.map((s: any) => ({ name: s.name, amount: String(s.amount) }))
            : [{ name: '', amount: '' }]
        );
      }
    };
    fetchStructure();
  }, [selectedGroupId, showStructure, resolvedMode]);

  const handleComponentChange = (idx: number, field: keyof ComponentItem, val: string) => {
    const arr = [...components];
    arr[idx][field] = val;
    setComponents(arr);
  };
  const addComponent = () => setComponents([...components, { name: '', amount: '' }]);
  const removeComponent = (idx: number) => setComponents(components.filter((_, i) => i !== idx));

  const handleSaveAll = async () => {
    if (!selectedGroupId) return;
      const invalidComponent = components.find(c => !c.name || isNaN(Number(c.amount)));
    if (invalidComponent) {
      toast.error('Please enter valid names and numeric amounts.');
      return;
    }
    try {
      // update group
      await apiClient(`/api/group/${selectedGroupId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: groupName, salaryMode, feeMode }),
      });

      // update structure only if needed
      if (showStructure && mode === 'Group') {
        await apiClient(`/api/group/${selectedGroupId}/${resolvedMode.toLowerCase()}-structure`, {
          method: 'POST',
          body: JSON.stringify({ components: components.map(c => ({ name: c.name, amount: isNaN(parseFloat(c.amount)) ? 0 : parseFloat(c.amount), })) }),
        });
      }

      toast.success('All settings saved');
      getFeeSalaries();
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    }
  };

  const handleShowStructureToggle = () => {
    if (mode === 'Member') {
      toast.error('Cannot toggle structure in Member mode');
      return;
    }
    // setLoading(true);
    setShowStructure(prev => !prev);
  };

  return (
    <>
      <Collapse in={settingsOpen}>
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Edit Group Settings</Typography>
              <Button variant="outlined" onClick={handleShowStructureToggle} 
                >
                {showStructure ? 'Hide Structure' : 'Show Structure'}
              </Button>
            </Box>

            <Stack spacing={3}>
              <TextField
                label="Group Name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
              <InputLabel>{isFee ? 'Fee Mode' : 'Salary Mode'}</InputLabel>
                <Select
                  value={mode ?? 'Group'}
                  label={isFee ? 'Fee Mode' : 'Salary Mode'}
                  onChange={e => setMode && setMode(e.target.value as AssignmentMode)}
                >
                  <MenuItem value="Group">Group</MenuItem>
                  <MenuItem value="Member">Member</MenuItem>
                </Select>
              </FormControl>

              <Collapse in={showStructure && mode === 'Group'}>
                <Typography variant="subtitle1"> {isFee ? 'Fee Structure' : 'Salary Structure'}</Typography>
                <ComponentLists
                  components={components}
                  onChange={handleComponentChange}
                  onAdd={addComponent}
                  onRemove={removeComponent}
                  loading={false} 
                  />
              </Collapse>

              <Button variant="contained" onClick={handleSaveAll}>
                Save Settings
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>
    </>
  );
}
