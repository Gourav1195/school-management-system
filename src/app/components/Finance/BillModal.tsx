'use client';

import React, {useState, useEffect} from 'react';
import { Modal, Box, Typography, Divider, Button } from '@mui/material';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

type PaymentRecord = {
   id: string;
  amountPaid: number;
  paidDate: string;
  note: string;
  amountExpected: number;
};

// type Structure = {
//   name: string;
//   amount: string;
// };

type BillModalProps = {
  open: boolean;
  onClose: () => void;
  data: {
    memberId: string;
    memberName: string;
    records: PaymentRecord[];
    amountPaid: number;
    paidDate: Date;
    structures: { name: string; amount: string }[];
  } | null;
  index: number;
};

const BillModal: React.FC<BillModalProps> = ({ open, onClose, data, index }) => {
  const { tenantId, token } = useAuth();
    const [logoSrc, setLogoSrc] = useState<string|null>(null);
    const [tenantName, setTenantName] = useState<string | null>(null);

    useEffect(() => {
      if (!open || !token) return;

      const fetchTenantDetails = async () => {
        try {
          const res = await fetch('/api/tenant', {
            headers: {
              Authorization: `Bearer ${token}`, // from your auth context
            },
          });

          if (!res.ok) throw new Error('Failed to fetch tenant info');

          const data = await res.json();
          setTenantName(data.name); // or whatever key your API returns
        } catch (err) {
          console.error('Could not fetch tenant info:', err);
        }
      };

      fetchTenantDetails();
    }, [token]);

    useEffect(() => {
    if (!tenantId) return;

    const basePath = `/uploads/${tenantId}/logo`;
    
    const testImage = async (ext: string) => {
      const url = `${basePath}.${ext}`;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          setLogoSrc(url);
          return true;
        }
      } catch (_) {}
      return false;
    };

    const loadLogo = async () => {
      const found = await testImage('png') || await testImage('jpg') || await testImage('jpeg');
      if (!found) setLogoSrc(null);
    };

    loadLogo();
  }, [tenantId]);
  if (!data) return null;

  const { memberName, records, structures, amountPaid, paidDate } = data;
  const record = records[index]; // Since we pass one at a time
  const totalExpected = structures.reduce((acc, s) => acc + Number(s.amount), 0);

  return (
  <Modal open={open} onClose={onClose} sx={{
        borderRadius: "10px",
        "& .MuiPaper-root": {
          // width: '100%',
          // height: '100%',
        },
        "& .MuiDialog-paper": { width: "80vw", maxWidth: "none", height: "80vh", maxHeight: "none" },
      }}>
  <Box
    id="printable-bill"
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      p: 3,
      borderRadius: 2,
      boxShadow: 24,
      width: 350,
      maxWidth: '90%',
    }}
  >
    <Box sx={{ textAlign: 'center', mb: 2 }}>
    
      
    {!logoSrc ? (
  <CorporateFareIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
) : (
  <Image
    src={logoSrc}
    alt="Organisation Logo"
    style={{ width: 100, height: 100, objectFit: 'contain' }}
    onError={() => setLogoSrc(null)} // fallback if img fails to load
  />
)}
      <Typography variant="h6" fontWeight={700}>
        Payment Receipt
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {tenantName}
      </Typography>
    </Box>

    <Divider sx={{ my: 1 }} />

    <Typography variant="body2" fontWeight={600}>
      Member: {memberName}
    </Typography>

    <Divider sx={{ my: 1 }} />

    <Typography variant="subtitle2" gutterBottom>
      Components
    </Typography>
    {structures.map((s, idx) => (
      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">{s.name}</Typography>
        <Typography variant="body2">₹{s.amount}</Typography>
      </Box>
    ))}

    <Divider sx={{ my: 1 }} />

    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2">Expected Total</Typography>
      <Typography variant="body2">₹{totalExpected}</Typography>
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2">Amount Paid</Typography>
      <Typography variant="body2" fontWeight={600}>
        ₹{amountPaid}
      </Typography>
    </Box>

    <Typography variant="body2" color="text.secondary" mt={1}>
      Date: {new Date(paidDate).toLocaleDateString()}
    </Typography>

    {record?.note && (
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Note: {record?.note}
      </Typography>
    )}

    <Divider sx={{ my: 1 }} />

    <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
      This is a system-generated receipt — no signature required.
    </Typography>

    <Box sx={{ mt: 2,  gap: 1, display:'none' }}>
      <Button fullWidth variant="outlined" onClick={onClose}>
        Close
      </Button>
      <Button 
        fullWidth 
        variant="contained" 
        onClick={() => {
          const printContent = document.getElementById('printable-bill');
          const win = window.open('', '', 'width=800,height=600');
          if (win && printContent) {
            win.document.write('<html><head><title>Receipt</title></head><body>');
            win.document.write(printContent.innerHTML);
            win.document.write('</body></html>');
            win.document.close();
            win.focus();
            win.print();
            win.close();
          }
        }}
      >
        Print
      </Button>
    </Box>
  </Box>
</Modal>

  );
};

export default BillModal;
