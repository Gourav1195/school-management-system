// ComponentList.tsx
'use client'
import React from 'react';
import {
  Stack,
  TextField,
  IconButton,
  Button,
  Box,
  Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ComponentItem {
  name: string;
  amount: string;
}

interface ComponentListProps {
  components: ComponentItem[];
  onChange: (index: number, field: 'name' | 'amount', value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  loading?: boolean; // optional
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onChange,
  onAdd,
  onRemove,
  loading = false,
}) => {
  if (loading) {
    return (
      <Stack spacing={2}>
        {[...Array(2)].map((_, idx) => (
          <Stack direction="row" spacing={1} key={idx} p={2}>
            <Skeleton variant="rounded" height={56} width="100%" />
            <Skeleton variant="rounded" height={56} width={120} />
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {components.map((comp, idx) => (
        <Stack direction="row" spacing={1} key={idx} p={2}>
          <TextField
            label="Component Name"
            value={comp.name}
            onChange={(e) => onChange(idx, 'name', e.target.value)}
            fullWidth
          />
          <TextField
            label="Amount"
            type="number"
            value={comp.amount}
            onChange={(e) => onChange(idx, 'amount', e.target.value)}
            sx={{ minWidth: 120 }}
            InputProps={{
              startAdornment: <Box sx={{ color: 'text.secondary', mr: 1 }}>₹</Box>,
            }}
          />
          <IconButton onClick={() => onRemove(idx)} color="error">
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button onClick={onAdd} startIcon={<AddIcon />}>
        Add Component
      </Button>
    </Stack>
  );
};

export default ComponentList;
