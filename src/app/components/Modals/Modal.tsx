import React, { useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
interface AllModalProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  title?: string;
  message?: string;
  btntxt?: string;
  icon?: DynamicIconProps;
  color?: string;
}

const iconMap = {
  delete: DeleteIcon,
  success: CheckCircleIcon,
  error: ErrorOutlineIcon,
  cancel: CancelIcon,
  warning: WarningIcon,
};

interface DynamicIconProps {
  type: 'delete' | 'success' | 'error' | 'cancel' | 'warning';
  sx?: object;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ type, sx = {} }) => {
  const IconComponent = iconMap[type];
  const [clr, setClr] = React.useState("#F83738");
  useEffect(() => {
    switch (type) {
      case 'delete':
        setClr("#F83738");
        break;
      case 'success':
        setClr("#0057D9");
        break;
      case 'error':
        setClr("#F44336");
        break;
      case 'cancel':
        setClr("#FF9800");
        break;
      case 'warning':
        setClr("#FF9800");
        break;
      default:
        setClr("#F83738");
    }
  }, [type])
  const iconStyle = {
    fontSize: '44px',
    color: clr,
    borderRadius: '25px',
    p: 0.7,
    ...sx,
  };
  return <IconComponent sx={iconStyle} />;
};

const AllModal: React.FC<AllModalProps> = ({ open, handleClose, handleConfirm, title, message, btntxt, icon, color }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ display: "flex", alignItems: 'center', fontWeight: "semi-bold" }}>
        <DynamicIcon type={icon?.type ?? 'delete'} /> &nbsp; {title ?? "Confirm Delete"}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#A3AABC', fontSize: '12px' }}>{message ?? "Are you sure you want to delete this item?"}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancel</Button>
        <Button onClick={handleConfirm} color={color as "inherit" | "error" | "primary" | "secondary" | "success" | "info" | "warning" || "error"} variant="contained">{btntxt ?? 'Delete'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllModal;
