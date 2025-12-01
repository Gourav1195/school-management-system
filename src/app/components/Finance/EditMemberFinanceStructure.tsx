import { apiClient } from '@/app/utils/apiClient';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, ToggleButton, ToggleButtonGroup, } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentLists from './ComponentLists';
import { GroupType } from '@prisma/client';
import toast from 'react-hot-toast';

interface EditMemberFinanceStructureProps {
  setEditOpen: (open: boolean) => void;
  editMemberId: string | null;
  setEditMemberId: (id: string | null) => void;
  selectedGroupId: string;
  setFees: (salaries: any[]) => void;
  setSalaries: (salaries: any[]) => void;
  editOpen: boolean;
  components: { name: string; amount: string }[];
  setComponents: React.Dispatch<React.SetStateAction<{ name: string; amount: string }[]>>;
  resolvedMode: GroupType;
}

const EditMemberFinanceStructure: React.FC<EditMemberFinanceStructureProps> = ({
  setEditOpen,
  editMemberId,
  setEditMemberId,
  selectedGroupId,
  setSalaries,
  setFees,
  editOpen,
  components,
  setComponents,
  resolvedMode  
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const isFee = resolvedMode === GroupType.FEE;

  useEffect(() => {
    if (editOpen && editMemberId && token) {
      setLoading(true);
      (async () => {
        try {
          const res = await apiClient(`/api/member/${editMemberId}/${isFee ? 'fee' : 'salary'}-structure`);
          if (!res) return;
          const data = await res.json();

          if (res.ok && Array.isArray(data.structures)) {
            setComponents(
              data.structures.map((s: any) => ({
                name: s.name,
                amount: String(s.amount),
              }))
            );
          } else {
            console.warn('No structures found or error:', data);
            setComponents([{ name: '', amount: '' }]);
          }
        } catch (err) {
          console.error(`Error loading ${isFee ? 'fee' : 'salary'} structures:`, err);
          setComponents([{ name: '', amount: '' }]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [editOpen, editMemberId, token, isFee]); // 👈 Make sure to re-fetch on mode toggle

  const handleAddComponent = () => {
    setComponents([...components, { name: '', amount: '' }]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  const handleEditSave = async () => {
    if (!editMemberId || !token) return;
    const invalidComponent = components.find(c => !c.name || isNaN(Number(c.amount)));
    if (invalidComponent) {
      toast.error('Please enter valid names and numeric amounts.');
      return;
    }

    try {
      const payload = components.map((c) => ({
        name: c.name,
        amount: isNaN(parseFloat(c.amount)) ? 0 : parseFloat(c.amount),
      }));

      await apiClient(`/api/member/${editMemberId}/${isFee ? 'fee' : 'salary'}-structure`, {
        method: 'POST',
        body: JSON.stringify({ components: payload }),
      });

      setEditOpen(false);
      setEditMemberId(null);
      setComponents([{ name: '', amount: '' }]);

      const groupRes = await apiClient(`/api/group/${selectedGroupId}/${isFee ? 'fee' : 'salary'}-structure`);
      if (!groupRes) return;
      const groupData = await groupRes.json();

      if (isFee) {
        setFees(groupData.fees || []);
      } else {
        setSalaries(groupData.salaries || []);
      }

    } catch (error) {
      console.error(`Error saving ${isFee ? 'fee' : 'salary'}:`, error);
    }
  };

  return (
    <Dialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: '100%',
          maxWidth: '500px'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #f0f0f0' }}>
        Edit Member {isFee ? 'Fee' : 'Salary'} Structure
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <ComponentLists
          components={components}
          onChange={handleComponentChange}
          onAdd={handleAddComponent}
          onRemove={handleRemoveComponent}
          loading={loading}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={handleEditSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberFinanceStructure;
