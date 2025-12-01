'use client';
import { useState, useEffect } from 'react';
import { 
  Box, Tabs, Tab, Typography, Paper, Grid, Divider, 
  List, ListItem, ListItemText, Switch, Button, TextField,
  InputAdornment, IconButton, Avatar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  Visibility,
  VisibilityOff,
  LockReset,
  CheckCircle
} from '@mui/icons-material';
import DataBackupRestore from '../components/Settings/DataImportExport';
import NotificationSettings from '../components/Settings/NotificationSettings';
import { toast } from 'react-hot-toast';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import GeneralSettings from '../components/Settings/GeneralSettings';
// Placeholder components for each settings section
// const GeneralSettings = () => {
//     const { token, loading:tokenLoading, role, } = useAuth();

//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     logoUrl: '',
//     logoFile: null as File | null,

//   });

//   const [loading, setLoading] = useState(false);

//   const fetchTenant = async () => {
//     try {
//       const res = await apiClient('/api/tenant', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to load tenant');
//       setForm({
//         name: data.name || '',
//         email: data.email || '',
//         logoUrl: data.logoUrl || '',
//         logoFile: null,
//       });
//     } catch (err: any) {
//       toast.error(err.message || 'Error fetching tenant');
//     }
//   };

//   useEffect(() => {
//     fetchTenant();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };
    
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setForm((prev) => ({ ...prev, logoFile: file }));
//     }
//   };

//   const uploadLogo = async (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', 'your_upload_preset'); // Cloudinary unsigned upload preset

//     const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await res.json();
//     return data.secure_url;
//   };


//   const handleSubmit = async () => {
//   setLoading(true);
//   try {
//     let logoUrl = form.logoUrl;

//     if (form.logoFile) {
//       logoUrl = await uploadLogo(form.logoFile);
//     }

//     const res = await apiClient('/api/tenant', {
//       method: 'PUT',
//       body: JSON.stringify({
//         name: form.name,
//         email: form.email,
//         logoUrl,
//       }),
//     });

//     const data = await res.json();
//     if (!res) throw new Error(data.error || 'Failed to update tenant');

//     toast.success('Tenant info updated Successfully');
//     setForm((prev) => ({
//       ...prev,
//       logoUrl,
//       logoFile: null,
//     }));
//   } catch (err: any) {
//     toast.error(err.message || 'Update failed');
//   } finally {
//     setLoading(false);
//   }
// };

//   return(
//   <Box sx={{ p: 3 }}>
//     <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
//       <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//       System Preferences
//     </Typography>
    
//     <Grid container spacing={3}>
//        <Grid  size={{xs:12, md:6}}>
//           <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
//             School Information
//           </Typography>

//           <TextField
//             fullWidth
//             label="School Name"
//             name="name"
//             variant="outlined"
//             sx={{ mb: 2 }}
//             value={form.name}
//             onChange={handleChange}
//           />

//           <TextField
//             fullWidth
//             label="Contact Email"
//             name="email"
//             variant="outlined"
//             sx={{ mb: 2 }}
//             value={form.email}
//             onChange={handleChange}
//           />

//           {/* <TextField
//             fullWidth
//             label="Logo URL"
//             name="logoUrl"
//             variant="outlined"
//             sx={{ mb: 2 }}
//             value={form.logoUrl}
//             onChange={handleChange}
//           /> */}
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//           />

//           {form.logoUrl && (
//             <Box mt={2}>
//               <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
//                 Logo Preview
//               </Typography>
//               <Box
//                 component="img"
//                 src={form.logoUrl}
//                 alt="Logo preview"
//                 sx={{
//                   width: 160,
//                   height: 160,
//                   objectFit: 'contain',
//                   border: '1px solid #ddd',
//                   borderRadius: 2,
//                   p: 1,
//                   backgroundColor: '#f9f9f9',
//                 }}
//               />
//             </Box>
//           )}

//           <Button variant="contained" onClick={handleSubmit} disabled={loading}>
//             {loading ? 'Saving...' : 'Save Changes'}
//           </Button>
//         </Grid>
      
//       <Grid  size={{xs:12, md:6}}>        
//       </Grid>
//     </Grid>
    
//     {/* <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//       <Button variant="contained" color="primary">Save Changes</Button>
//     </Box> */}
//   </Box>
// );}

const AcademicSettings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
      <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
      Academic Configuration
    </Typography>
    
    <Grid container spacing={3}>
      <Grid size={{xs:12, md:6}}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Academic Year
        </Typography>
        <TextField 
          fullWidth 
          label="Current Academic Year" 
          variant="outlined" 
          sx={{ mb: 2 }}
          defaultValue="2023-2024"
        />
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 500 }}>
          Grading System
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Percentage System" />
            <Switch edge="end" defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemText primary="GPA System" />
            <Switch edge="end" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Letter Grades" />
            <Switch edge="end" />
          </ListItem>
        </List>
      </Grid>
      
      <Grid  size={{xs:12, md:6}}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Attendance Settings
        </Typography>
        <TextField 
          fullWidth 
          label="Minimum Attendance %" 
          variant="outlined" 
          type="number"
          sx={{ mb: 2 }}
          defaultValue="75"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 500 }}>
          Class Schedule
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Period Duration" secondary="45 minutes" />
          </ListItem>
          <ListItem>
            <ListItemText primary="School Days" secondary="Monday to Friday" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Lunch Break" secondary="12:00 PM - 1:00 PM" />
          </ListItem>
        </List>
      </Grid>
    </Grid>
    
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="contained" color="primary">Save Academic Settings</Button>
    </Box>
  </Box>
);

const FinanceSettings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
      <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
      Financial Configuration
    </Typography>
    
    <Grid container spacing={3}>
      <Grid size={{xs:12, md:6}}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Payment Settings
        </Typography>
        <TextField 
          fullWidth 
          label="Currency" 
          variant="outlined" 
          sx={{ mb: 2 }}
          defaultValue="USD"
        />
        <TextField 
          fullWidth 
          label="Bank Account Number" 
          variant="outlined" 
          sx={{ mb: 2 }}
        />
        <TextField 
          fullWidth 
          label="Bank Name" 
          variant="outlined" 
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid size={{xs:12, md:6}}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Fee Structure
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Tuition Fee" secondary="$500 per month" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Transportation Fee" secondary="$100 per month" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Library Fee" secondary="$20 per semester" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Late Payment Penalty" secondary="5% after due date" />
          </ListItem>
        </List>
      </Grid>
    </Grid>
    
    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 500 }}>
      Payment Gateways
    </Typography>
    <List dense>
      <ListItem>
        <ListItemText primary="Stripe" secondary="Credit/Debit Card payments" />
        <Switch edge="end" defaultChecked />
      </ListItem>
      <ListItem>
        <ListItemText primary="PayPal" secondary="Online payments" />
        <Switch edge="end" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Bank Transfer" secondary="Direct bank payments" />
        <Switch edge="end" defaultChecked />
      </ListItem>
    </List>
    
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="contained" color="primary">Save Financial Settings</Button>
    </Box>
  </Box>
);

const UserManagement = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        User Accounts
      </Typography>
      
      <Grid container spacing={3}>
        <Grid  size={{xs:12, md:6}}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            Account Information
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, mr: 2 }}>A</Avatar>
            <div>
              <Typography variant="subtitle1">Admin User</Typography>
              <Typography variant="body2" color="text.secondary">admin@greenwood.edu</Typography>
            </div>
          </Box>
          
          <TextField 
            fullWidth 
            label="Full Name" 
            variant="outlined" 
            sx={{ mb: 2 }}
            defaultValue="Administrator"
          />
          <TextField 
            fullWidth 
            label="Email" 
            variant="outlined" 
            sx={{ mb: 2 }}
            defaultValue="admin@greenwood.edu"
          />
          <TextField 
            fullWidth 
            label="Phone" 
            variant="outlined" 
            sx={{ mb: 2 }}
            defaultValue="+1 (555) 123-4567"
          />
        </Grid>
        
        <Grid size={{xs:12, md:6}}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            Security Settings
          </Typography>
          <TextField 
            fullWidth 
            label="Current Password" 
            variant="outlined" 
            type={showPassword ? 'text' : 'password'}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField 
            fullWidth 
            label="New Password" 
            variant="outlined" 
            type="password"
            sx={{ mb: 2 }}
          />
          <TextField 
            fullWidth 
            label="Confirm New Password" 
            variant="outlined" 
            type="password"
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="outlined" 
            startIcon={<LockReset />}
            sx={{ mt: 1 }}
          >
            Reset Password
          </Button>
        </Grid>
      </Grid>
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, fontWeight: 500 }}>
        User Roles & Permissions
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText 
            primary="Administrator" 
            secondary="Full system access" 
          />
          <CheckCircle color="success" />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Teacher" 
            secondary="Academic management, attendance" 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Accountant" 
            secondary="Financial operations" 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Parent" 
            secondary="Student progress, payments" 
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary">Save User Settings</Button>
      </Box>
    </Box>
  );
};


export default function SchoolERPSettings() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    { label: 'General', icon: <SettingsIcon /> },
    { label: 'Academic', icon: <SchoolIcon /> },
    { label: 'Finance', icon: <PaymentIcon /> },
    { label: 'Users', icon: <PeopleIcon /> },
    { label: 'Data', icon: <BackupIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return <GeneralSettings />;
      case 1: return <AcademicSettings />;
      case 2: return <FinanceSettings />;
      case 3: return <UserManagement />;
      case 4: return <DataBackupRestore />;
      case 5: return <NotificationSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        School ERP Settings
      </Typography>
      
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#3f51b5',
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ 
                minHeight: 64,
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#3f51b5',
                },
              }}
            />
          ))}
        </Tabs>
        <Divider />
      </Paper>
      
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
        {renderTabContent()}
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Equaseed School ERP System • Version 3.2.1
        </Typography>
        <Typography variant="body2" color="text.secondary">
          © 2025 EquaSeed Education Systems. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}