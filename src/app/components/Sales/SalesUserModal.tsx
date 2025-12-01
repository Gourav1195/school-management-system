'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem
} from '@mui/material'
import { GenderType, Group, Member, Sale } from '@prisma/client' // your Member type import here
// import { Member } from '@/types/all'

// type Props = {
//   open: boolean
//   onClose: () => void
//   onSave: (data: Partial<Member>) => Promise<void>
//   initialData?: Member | null
// }

interface SalesUser {
  id: string;
  name: string;
  email?: string;
  region?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  targetMonthly?: number;
  avatarUrl?: string;
  createdAt?: string;
  //  id: string;
  groupId: string | null;
  tenantId: string;
  member: Member;
  group?: Group;
  sale: Sale;
  isActive: boolean;
}

interface SalesUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => void;
  initialData?: SalesUser | null;
}


const SalesUserFormModal: React.FC<SalesUserModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    email: '',
    // gender: '',
  })

  useEffect(() => {
    if (initialData && initialData.member) {
      setFormData(initialData.member)
    } else {
      setFormData({
        name: '',
        email: '',
        // gender: '',
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit' : 'Add'} Sales User</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          fullWidth
          required
        />
        {/* <TextField
          select
          label="Gender"
          name="gender"
          value={formData.gender || ''}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SalesUserFormModal
