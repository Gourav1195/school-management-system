
// 'use client'
// import React  from 'react';
// import {
//   Typography,
//   Box,
//   Button,
//   IconButton,
//   Chip,
//   Avatar,
//   Grid,
//   Card,
//   CardContent,
//   CardActions,
// } from '@mui/material';

// import {
//   Add as AddIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Visibility as VisibilityIcon,
//   Group as GroupIcon,
//   Close as CloseIcon,
//   StarBorder,
//   Star,
//   ViewList as ViewListIcon,
//   GridView as GridViewIcon
// } from '@mui/icons-material';
// import { useRouter } from 'next/navigation';
// import { Group } from '@/types/all';
// // Render grid view item

// export const renderGridItem = (group: Group) => {
//         const router  = useRouter();

//     return (

//     <Grid size={{xs:12, lg:3, md:4, sm:6, }} key={group.id}>
//       <Card sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         borderRadius: 3,
//         boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
//         border: '1px solid #e0e0e0',
//         transition: 'all 0.3s ease',
//         '&:hover': {
//           transform: 'translateY(-5px)',
//           boxShadow: '0 12px 24px rgba(67, 97, 238, 0.15)',
//           borderColor: '#4361ee40',
//         }
//       }}>
//         <CardContent sx={{ flexGrow: 1 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <Avatar sx={{ 
//               bgcolor: 'primary.light', 
//               color: 'primary.main', 
//               width: 40, 
//               height: 40,
//               mr: 2
//             }}>
//               <GroupIcon fontSize="small" />
//             </Avatar>
//             <Box sx={{ flexGrow: 1 }}>
//               <Typography 
//                 variant="h6" 
//                 fontWeight={600}
//                 sx={{ cursor: 'pointer' }}
//                 onClick={() => router.push(`/group/${group.id}`)}
//               >
//                 {group.name}
//               </Typography>
//               <Chip
//                 label={group.type}
//                 size="small"
//                 sx={{
//                   mt: 0.5,
//                   bgcolor: group.type === 'FEE' ? 'info.light' : 'warning.light',
//                   color: group.type === 'FEE' ? 'info.dark' : 'warning.dark',
//                   fontWeight: 500
//                 }}
//               />
//             </Box>
//             <IconButton 
//               size="small" 
//               onClick={() => handleToggleFavorite(group.id)}
//               sx={{ ml: 1 }}
//             >
//               {favGroups.some(fav => fav.id === group.id) ? (
//                 <Star sx={{ color: 'warning.main' }} />
//               ) : (
//                 <StarBorder sx={{ color: 'text.secondary' }} />
//               )}
//             </IconButton>
//           </Box>

//           <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 2 }}>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Fee</Typography>
//               <Typography variant="h6" fontWeight={600} color="primary.main">
//                 ₹{group.groupFee?.toLocaleString() || '0.00'}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Salary</Typography>
//               <Typography variant="h6" fontWeight={600} color="primary.main">
//                 ₹{group.groupSalary?.toLocaleString() || '0.00'}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Members</Typography>
//               <Typography variant="h6" fontWeight={600}>
//                 {group.members?.length || 0}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="body2" color="text.secondary">Mode</Typography>
//               <Typography variant="body1" fontWeight={500}>
//                 {group.feeMode}/{group.salaryMode}
//               </Typography>
//             </Box>
//           </Box>
//         </CardContent>

//         <CardActions sx={{ 
//           pt: 0, 
//           px: 2, 
//           pb: 2,
//           justifyContent: 'space-between',
//           borderTop: '1px solid #f5f5f5'
//         }}>
//           <Button
//             size="small"
//             variant="outlined"
//             startIcon={<VisibilityIcon />}
//             onClick={() => handleOpenViewModal(group)}
//             sx={{ borderRadius: 2 }}
//           >
//             View
//           </Button>
//           <Box>
//             <IconButton
//               size="small"
//               onClick={() => handleOpenEditModal(group)}
//               sx={{ color: 'success.main' }}
//             >
//               <EditIcon fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               onClick={() => handleOpenDeleteModal(group)}
//               sx={{ color: 'error.main', ml: 1 }}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         </CardActions>
//       </Card>
//     </Grid>

//   );
// }
import React from 'react'

const GridGroupItems = () => {
  return (
    <div>
      
    </div>
  )
}

export default GridGroupItems
