"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, List, ListItem, ListItemIcon, Grid, CardContent 
} from "@mui/material";
import Confetti from "react-confetti";
import { apiClient } from "@/app/utils/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import ReceiptIcon from "@mui/icons-material/Receipt";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { styled } from "@mui/material/styles";

// Styled Card
const PlanCard = styled("div")(({ theme }) => ({
  borderRadius: theme.shape.borderRadius as number * 2,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 350,
}));

// Fake badge
const PopularBadge = ({ label }: { label: string }) => (
  <Box
    sx={{
      position: "absolute",
      top: -12,
      right: 12,
      bgcolor: "primary.main",
      color: "white",
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      fontSize: "0.75rem",
      fontWeight: 700,
    }}
  >
    {label}
  </Box>
);

const planData = [
  {
    id: "6M",
    label: "6 Months",
    price: 14999,
    features: { whatsapp: 1000, ai: 50, bills: "Unlimited", groups: 5 },
  },
  {
    id: "12M",
    label: "12 Months",
    price: 19999,
    features: { whatsapp: 2500, ai: 150, bills: "Unlimited", groups: 15 },
    popular: true,
  },
  {
    id: "24M",
    label: "24 Months",
    price: 34999,
    features: { whatsapp: 5000, ai: 500, bills: "Unlimited", groups: "Unlimited" },
  },
];

export default function PlanPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token, loading } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [referral, setReferral] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [referralApplied, setReferralApplied] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ new flag
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const selectedPlan = planData.find((p) => p.id === id);
    setPlan(selectedPlan || null);
  }, [id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !loading && !token) {
      router.push("/auth/login");
    }
  }, [mounted, loading, token, router]);


  const handleApplyReferral = async () => {
    if (!referral || !plan) return;

    try {
      const res = await apiClient("/api/referrals/validate", {
        method: "POST",
        body: JSON.stringify({ code: referral, planId: plan.id }),
      });
      if (!res) return;

      const data = await res.json();

      if (data.valid) {
        setDiscountedPrice(data.finalPrice);
        console.log("Commission:", data.commission);
        setCelebrate(true);
        setReferralApplied(true);
        setTimeout(() => setCelebrate(false), 7000);
      } else {
        alert(data.message || "Invalid referral ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }
  };
  if (!mounted) return null;

  if (!plan) {
    return (
      <Box p={4}>
        <Typography variant="h5">Loading plan...</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {celebrate && <Confetti />}
      <Grid container justifyContent="center">
        <Grid size={{xs:10, md:6, sm:6, }}>
          <Box sx={{ position: "relative", mx: "auto" }}>

            <PlanCard>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" component="h3" fontWeight={700}>
                    {plan.label}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    ₹{(discountedPrice || plan.price).toLocaleString("en-IN")}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    one time billing
                  </Typography>
                </Box>

                <List
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                    border: "1px solid #e0e0e0",
                  }}
                >
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
                      <strong>{plan.features.groups}</strong> groups
                    </Typography>
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <MessageIcon color="primary" />
                    </ListItemIcon>
                    <Typography variant="body2">
                      <strong>{plan.features.whatsapp.toLocaleString()}</strong>{" "}
                      WhatsApp messages
                    </Typography>
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SmartToyIcon color="primary" />
                    </ListItemIcon>
                    <Typography variant="body2">
                      <strong>{plan.features.ai.toLocaleString()}</strong> AI
                      assistant messages
                    </Typography>
                  </ListItem>
                </List>

                <TextField
                  label="Referral Code (optional)"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled={referralApplied}
                />

                <Button
                  variant="outlined"
                  onClick={handleApplyReferral}
                  sx={{ mr: 2 }}
                  disabled={referralApplied}
                >
                  Apply Referral
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: 700, py: 1.5, mt: 2 }}
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </PlanCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
