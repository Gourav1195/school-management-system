'use client';

import React, {useState} from 'react';
import { Box, Typography, Button, Tooltip, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReceiptIcon from '@mui/icons-material/Receipt';
import toast from 'react-hot-toast';
import BillModal from './BillModal';
import { apiClient } from '@/app/utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility'
import { GroupType } from '@prisma/client';

type PaymentRecord = {
  id: string;
  amountPaid: number;
  paidDate: string;
  note: string;
  amountExpected: number;

};

type Props = {
  memberId: string;
  memberName: string;
  records: Record<string, PaymentRecord[]>;
  showAllRecords: Record<string, boolean>;
  setShowAllRecords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  components: { name: string; amount: string }[];
  mode: 'Group' | 'Member';
  groupId: string; 
  // groupType: GroupType;
  resolvedMode: GroupType;
};
const PaymentHistory: React.FC<Props> = ({ memberId, memberName, records, showAllRecords, setShowAllRecords, components, mode, groupId, resolvedMode }) => {
  const router = useRouter();
  const [billOpen, setBillOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState<{
    memberId: string;
    memberName: string;
    records: PaymentRecord[];
    amountPaid: number;
    paidDate: Date;
    structures: { name: string; amount: string }[];
  } | null>(null);

  const all = records?.[memberId] || [];
  if (!all || all.length === 0) {
    // toast.error('No records found for memberId');
    console.log( memberId, records)
    return null;
  }

  const isAll = showAllRecords[memberId];
  const toShow = isAll ? all : all.slice(0, 3);

  const handleShowBillModal = async (amountPaid: number, paidDate: Date) => {
    try {
      setLoading(true);
      let url = '';

      if (mode === 'Group') {
        url = `/api/group/${groupId}/${resolvedMode.toLowerCase()}-structure`;
      } else {
        url = `/api/member/${memberId}/${resolvedMode.toLowerCase()}-structure`;
      }

      const res = await apiClient(url);
      setLoading(false);
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to load components');
        return;
      }

      setBillData({
        memberId,
        memberName,
        amountPaid,
        records: records[memberId],
        paidDate,
        structures: data.structures,
      });
      setBillOpen(true);
    } catch (err) {
      console.error('Error fetching components:', err);
      toast.error('Error loading components');
    }
  };

  const handleShowBill = async (amountPaid: number, paidDate: Date) => {
    try {
      setLoading(true);
      let url = '';

      if (mode === 'Group') {
        url = `/api/group/${groupId}/${resolvedMode.toLowerCase()}-structure`;
      } else {
        url = `/api/member/${memberId}/${resolvedMode.toLowerCase()}-structure`;
      }

      const res = await apiClient(url);
      if (!res){
        toast.error('failed request')
        return
      } 
      setLoading(false);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to load components');
        return;
      }

      const freshComponents = data.structures;

      setBillData({
        memberId,
        memberName,
        amountPaid,
        paidDate,
        records: records[memberId],
        structures: freshComponents,
      });

      sessionStorage.setItem('billData', JSON.stringify({
        memberId,
        memberName,
        records: records[memberId],
        amountPaid,
        paidDate,
        structures: freshComponents,
      }));
      router.push(`/finance/bill/${memberId}`);
    } catch (err) {
      console.error('Error fetching components:', err);
      toast.error('Error loading components');
    }
  };

  if (loading) return <CircularProgress />;
  // if (!memberId || !records[memberId]) {
  //   return <div>Loading...</div>; // or null
  // }

  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 1 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: 'background.level1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: '#4361ee', fontSize: '0.7rem' }}
          >
            ₹
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          PAYMENT HISTORY
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {toShow.map((r:any, i:any) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              backgroundColor: i % 2 === 0 ? 'background.level1' : 'transparent',
              fontSize: '0.8rem'
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                fontWeight: 600,
                color: '#4361ee',
                fontSize: '0.85rem'
              }}
            >
              ₹{r.amountPaid}
            </Box>
            <Box sx={{ ml: 1, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'right' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', textAlign: 'left', mt:r.note ? 0 : 0.9 }}>
                  {new Date(r.paidDate).toLocaleDateString()}
                </Typography>
                {r.note && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  note: {r.note}
                </Typography>
              )}
              </Box>
                <IconButton onClick={() => handleShowBillModal(r.amountPaid, new Date(r.paidDate))}>
                  <Tooltip title="View receipt" arrow>
                    <VisibilityIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                  </Tooltip>
                </IconButton>
                <IconButton onClick={() => handleShowBill(r.amountPaid, new Date(r.paidDate))}>
                  <Tooltip title="View receipt" arrow>
                    <ReceiptIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                  </Tooltip>
                </IconButton>

                <BillModal
                  open={billOpen}
                  onClose={() => setBillOpen(false)}
                  data={billData}
                  index={i}
                />
              </Box>

              
            </Box>
          </Box>
        ))}

        {all.length > 3 && (
          <Button
            size="small"
            sx={{
              mt: 0.5,
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 500,
              color: '#4361ee',
              fontSize: '0.75rem',
              minWidth: 0,
              p: 0.5,
              '&:hover': { bgcolor: 'transparent' }
            }}
            onClick={() =>
              setShowAllRecords(prev => ({
                ...prev,
                [memberId]: !prev[memberId]
              }))
            }
            endIcon={
              isAll ? (
                <ExpandLessIcon sx={{ fontSize: '0.9rem' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />
              )
            }
          >
            {isAll ? 'Show less' : `All ${all.length} transactions`}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PaymentHistory;
