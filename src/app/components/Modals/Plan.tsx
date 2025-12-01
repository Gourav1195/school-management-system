import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Slide,
  styled,
  List,
  ListItem,
  ListItemIcon
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MessageIcon from '@mui/icons-material/Message';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Define plan structure
interface Plan {
  label: string;
  actualPrice: number;
  monthlyPrice: number;
  popular: boolean;
  features: {
    whatsapp: number;
    ai: number;
    bills: string;
    groups: string;
  };
}

const plans: Plan[] = [
  {
    label: "6 Months",
    actualPrice: 14999,
    monthlyPrice: 1666.50,
    popular: false,
    features: {
      whatsapp: 1000,
      ai: 50,
      bills: "Unlimited",
      groups: "Up to 5 groups"
    }
  },
  {
    label: "12 Months",
    actualPrice: 19999,
    monthlyPrice: 1250.00,
    popular: true,
    features: {
      whatsapp: 2500,
      ai: 150,
      bills: "Unlimited",
      groups: "Up to 15 groups"
    }
  },
  {
    label: "24 Months",
    actualPrice: 34999,
    monthlyPrice: 1041.63,
    popular: false,
    features: {
      whatsapp: 5000,
      ai: 500,
      bills: "Unlimited",
      groups: "Unlimited groups"
    }
  },
];

// Styled card component
const PlanCard = styled(Card)(({ theme }) => ({
  minWidth: 250,
  maxWidth: 350,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: -12,
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: 700,
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  borderRadius: 12,
}));

const PriceText = styled(Typography)({
  fontWeight: 800,
  background: '-webkit-linear-gradient(45deg, #1976d2, #4dabf5)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

export default function PricingModal() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleOpen}
        sx={{ py: 1.5, px: 4, fontWeight: 600 }}
      >
        View Pricing Plans
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, background: 'background.paper' } }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          py: 4,
          background: 'linear-gradient(45deg, #1976d2 0%, #4dabf5 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, zIndex: 1, position: 'relative' }}>
            Choose Your Plan
          </Typography>
          <Typography variant="subtitle1" component="div" sx={{ mt: 1, opacity: 0.9, zIndex: 1, position: 'relative' }}>
            Flexible billing options with powerful features
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: isMobile ? 2 : 4 }}>
          <Grid container spacing={3} justifyContent="center" sx={{ my:3 }}>
            {plans.map((plan) => (
              <Grid key={plan.label} size={{xs:12, sm:6, md:4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 350 }}>
                  {plan.popular && (
                    <PopularBadge label="MOST POPULAR" />
                  )}
                  
                  <PlanCard elevation={4} sx={{ 
                    border: plan.popular ? `2px solid ${theme.palette.primary.main}` : 'none',
                    transform: plan.popular ? 'translateY(-8px)' : 'none',
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h3" fontWeight={700}>
                          {plan.label}
                        </Typography>
                      </Box>
                     
                       <Box sx={{ mt: 2, mb: 3 }}>
                          <PriceText variant="h3" sx={{ fontWeight: 800 }}>
                            ₹{plan.monthlyPrice.toLocaleString()}
                          </PriceText>
                          <Typography variant="subtitle2" color="textSecondary">
                            per month · Billed ₹{plan.actualPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      
                      <List sx={{ 
                          bgcolor: 'background.paper', 
                          borderRadius: 2, 
                          p: 2, 
                          mb: 3,
                          border: `1px solid ${theme.palette.grey[300]}`
                        }}>
                        <ListItem disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <ReceiptIcon color="primary" />
                          </ListItemIcon>
                          <Typography variant="body2">
                            <strong>{plan.features.bills}</strong> bill generations
                          </Typography>
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <GroupIcon color="primary" />
                          </ListItemIcon>
                          <Typography variant="body2">
                            <strong>{plan.features.groups}</strong> with members
                          </Typography>
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <MessageIcon color="primary" />
                          </ListItemIcon>
                          <Typography variant="body2">
                            <strong>{plan.features.whatsapp.toLocaleString()}</strong> WhatsApp messages
                          </Typography>
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <SmartToyIcon color="primary" />
                          </ListItemIcon>
                          <Typography variant="body2">
                            <strong>{plan.features.ai.toLocaleString()}</strong> AI assistant messages
                          </Typography>
                        </ListItem>
                      </List>
                      
                      <Button 
                        fullWidth 
                        variant={plan.popular ? "contained" : "outlined"} 
                        color="primary"
                        size="large"
                        sx={{ 
                          fontWeight: 700,
                          py: 1.5,
                          ...(plan.popular && {
                            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            color: 'white',
                          })
                        }}
                      >
                        Select Plan
                      </Button>
                    </CardContent>
                  </PlanCard>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="h5" component="h3" textAlign="center" mb={3} fontWeight={600}>
            Plan Comparison
          </Typography>
          
          <TableContainer 
            component={Paper} 
            elevation={2} 
            sx={{ borderRadius: 3, border: `1px solid ${theme.palette.grey[200]}`, mb: 2 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[300] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color:'black' }}>Plan Details</TableCell>
                  {plans.map(plan => (
                    <TableCell key={plan.label} align="center" sx={{ fontWeight: 700, color:'black' }}>
                      {plan.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Total Price</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-price`} align="center">
                      ₹{plan.actualPrice.toLocaleString('en-IN')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Monthly Equivalent</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-monthly`} align="center">
                      ₹{plan.monthlyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Bill Generations</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-bills`} align="center">
                      {plan.features.bills}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Groups & Members</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-groups`} align="center">
                      {plan.features.groups}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>WhatsApp Messages</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-wa`} align="center">
                      {plan.features.whatsapp.toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>AI Messages</TableCell>
                  {plans.map(plan => (
                    <TableCell key={`${plan.label}-ai`} align="center">
                      {plan.features.ai.toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ 
            bgcolor: theme.palette.success.light, 
            borderRadius: 3, 
            p: 3,
            borderLeft: `4px solid ${theme.palette.success.main}`
          }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1, color: theme.palette.success.main }} />
              <strong>All plans include:</strong> 24/7 priority support, data encryption, automatic backups, and daily reports
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'paper.background', borderTop: `1px solid ${theme.palette.grey[200]}` }}>
          <Button onClick={handleClose} sx={{ fontWeight: 600 }}>
            Close
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            View Discounted Options
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}