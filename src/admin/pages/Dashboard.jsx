import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PeopleIcon from '@mui/icons-material/People';
import { supabase } from '../../lib/supabaseClient';
import DriverStatusCard from '../components/DriverStatusCard';
import { STATUS_CONFIG } from '../components/StatusChip';

const STATUSES = ['ALL', 'OFFLINE', 'IDLE', 'PICKING_UP', 'DELIVERING'];
const FILTER_LABELS = {
  ALL: 'Tất cả',
  OFFLINE: 'Ngoại tuyến',
  IDLE: 'Đang rảnh',
  PICKING_UP: 'Đang lấy đơn',
  DELIVERING: 'Đang giao hàng',
};

function StatSummary({ drivers }) {
  const counts = {
    TOTAL: drivers.length,
    OFFLINE: drivers.filter((d) => d.status === 'OFFLINE').length,
    IDLE: drivers.filter((d) => d.status === 'IDLE').length,
    PICKING_UP: drivers.filter((d) => d.status === 'PICKING_UP').length,
    DELIVERING: drivers.filter((d) => d.status === 'DELIVERING').length,
  };

  const stats = [
    { label: 'Tổng tài xế', value: counts.TOTAL, color: '#94A3B8' },
    { label: 'Đang rảnh', value: counts.IDLE, color: STATUS_CONFIG.IDLE.color },
    { label: 'Đang lấy đơn', value: counts.PICKING_UP, color: STATUS_CONFIG.PICKING_UP.color },
    { label: 'Đang giao hàng', value: counts.DELIVERING, color: STATUS_CONFIG.DELIVERING.color },
    { label: 'Ngoại tuyến', value: counts.OFFLINE, color: STATUS_CONFIG.OFFLINE.color },
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {stats.map((stat) => (
        <Grid item xs={6} sm={4} md={2.4} key={stat.label}>
          <Box
            sx={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${stat.color}25`,
              borderRadius: 2.5,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: stat.color, lineHeight: 1 }}
            >
              {stat.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block' }}>
              {stat.label}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Dashboard() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isLive, setIsLive] = useState(false);

  const fetchDrivers = useCallback(async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('full_name');

    if (!error && data) {
      setDrivers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrivers();

    // Đăng ký Realtime subscription
    const channel = supabase
      .channel('drivers-realtime-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setDrivers((prev) => {
            if (eventType === 'INSERT') {
              return [...prev, newRecord].sort((a, b) =>
                a.full_name.localeCompare(b.full_name)
              );
            }
            if (eventType === 'UPDATE') {
              return prev.map((d) => (d.id === newRecord.id ? newRecord : d));
            }
            if (eventType === 'DELETE') {
              return prev.filter((d) => d.id !== oldRecord.id);
            }
            return prev;
          });
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDrivers]);

  const filteredDrivers = filter === 'ALL'
    ? drivers
    : drivers.filter((d) => d.status === filter);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: 'rgba(255,255,255,0.92)' }}>
            Bảng trạng thái tài xế
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Cập nhật tự động theo thời gian thực
          </Typography>
        </Box>
        <Tooltip title={isLive ? 'Đang kết nối realtime' : 'Đang kết nối...'}>
          <Chip
            icon={
              <FiberManualRecordIcon
                sx={{
                  fontSize: '10px !important',
                  color: isLive ? '#22C55E !important' : '#EAB308 !important',
                  animation: isLive ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
            }
            label={isLive ? 'LIVE' : 'Đang kết nối...'}
            size="small"
            sx={{
              background: isLive ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
              border: `1px solid ${isLive ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
              color: isLive ? '#22C55E' : '#EAB308',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Tooltip>
      </Box>

      {/* Stats */}
      {!loading && <StatSummary drivers={drivers} />}

      {/* Filter Tabs */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        {STATUSES.map((s) => {
          const color = s === 'ALL' ? '#94A3B8' : STATUS_CONFIG[s]?.color;
          const isActive = filter === s;
          return (
            <Chip
              key={s}
              label={FILTER_LABELS[s]}
              onClick={() => setFilter(s)}
              size="small"
              sx={{
                cursor: 'pointer',
                background: isActive ? `${color}20` : 'transparent',
                border: `1px solid ${isActive ? color + '60' : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? color : 'rgba(255,255,255,0.5)',
                fontWeight: isActive ? 700 : 400,
                '&:hover': { background: `${color}15`, color: color },
              }}
            />
          );
        })}
      </Box>

      {/* Driver Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rounded"
                height={140}
                sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredDrivers.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          gap={2}
        >
          <PeopleIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.15)' }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.35)' }}>
            {filter === 'ALL' ? 'Chưa có tài xế nào trong hệ thống.' : `Không có tài xế ở trạng thái "${FILTER_LABELS[filter]}".`}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredDrivers.map((driver) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={driver.id}>
              <DriverStatusCard driver={driver} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
