'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';

type MemberPending = {
  id: string;
  name: string;
  expected: number;
  paid: number;
  pending: number;
  pendingMonthNames: string[];
};

type PendingResponse = {
  perMember: MemberPending[];
  grand: {
    expected: number;
    paid: number;
    pending: number;
  };
  page: number;
  limit: number;
  totalCount: number;
};

const PendingFinancePage = () => {
  const [data, setData] = useState<PendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // MUI is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPending = async (currentPage: number, currentLimit: number) => {
    setLoading(true);
    try {
      const res = await apiClient(`/api/finance/pending?sessionYear=2025&type=FEE&page=${currentPage + 1}&limit=${currentLimit}`, {
        // headers: {
        //   'Authorization': 'Bearer your_jwt_token_here'
        // }
      });
      if (!res) return;
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching pending finance:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Pending Finance
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Grand Total</Typography>
              <Typography>Expected: ₹{data?.grand.expected.toFixed(2)}</Typography>
              <Typography>Paid: ₹{data?.grand.paid.toFixed(2)}</Typography>
              <Typography>Pending: ₹{data?.grand.pending.toFixed(2)}</Typography>
            </CardContent>
          </Card>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Expected (₹)</TableCell>
                <TableCell align="right">Paid (₹)</TableCell>
                <TableCell align="right">Pending (₹)</TableCell>
                <TableCell>Pending Months</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.perMember.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell align="right">{member.expected.toFixed(2)}</TableCell>
                  <TableCell align="right">{member.paid.toFixed(2)}</TableCell>
                  <TableCell align="right">{member.pending.toFixed(2)}</TableCell>
                  <TableCell>{member.pendingMonthNames.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={data?.totalCount || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </>
      )}
    </Box>
  );
};

export default PendingFinancePage;
