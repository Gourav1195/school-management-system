'use client';
import { useState } from 'react';
import { 
  Box,  Typography,  Grid, 
  List, ListItem, ListItemText, Switch, Button, 
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const NotificationSettings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
      <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
      Notification Preferences
    </Typography>
    
    <Grid container spacing={3}>
      <Grid size={{xs:12, md:6}} >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Email Notifications
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Account Activity" secondary="Login alerts, password changes" />
            <Switch edge="end" defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemText primary="System Updates" secondary="New features, maintenance notices" />
            <Switch edge="end" defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemText primary="Promotional Offers" secondary="Product updates, special offers" />
            <Switch edge="end" />
          </ListItem>
        </List>
      </Grid>
      
      <Grid  size={{xs:12, md:6}}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          In-App Notifications
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="New Messages" secondary="Alert when new messages arrive" />
            <Switch edge="end" defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemText primary="Assignment Deadlines" secondary="Reminders for upcoming deadlines" />
            <Switch edge="end" defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemText primary="Fee Payment Reminders" secondary="Alerts for pending payments" />
            <Switch edge="end" defaultChecked />
          </ListItem>
        </List>
      </Grid>
    </Grid>
    
    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 500 }}>
      Notification Schedule
    </Typography>
    <List dense>
      <ListItem>
        <ListItemText primary="Weekdays" secondary="8:00 AM - 8:00 PM" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Weekends" secondary="10:00 AM - 6:00 PM" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Do Not Disturb" secondary="Enabled from 10:00 PM to 7:00 AM" />
        <Switch edge="end" defaultChecked />
      </ListItem>
    </List>
    
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="contained" color="primary">Save Notification Settings</Button>
    </Box>
  </Box>
);
export default NotificationSettings;