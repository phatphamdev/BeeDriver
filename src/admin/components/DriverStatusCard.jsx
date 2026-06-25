import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';
import { StatusChip, STATUS_CONFIG } from './StatusChip';

export default function DriverStatusCard({ driver }) {
  const config = STATUS_CONFIG[driver.status] || STATUS_CONFIG.OFFLINE;

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${config.color}30`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          background: 'rgba(255,255,255,0.07)',
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${config.color}20`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          borderRadius: '12px 12px 0 0',
          background: config.color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header: Avatar + Name */}
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
              border: `2px solid ${config.color}50`,
              color: config.color,
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {driver.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 }}
            >
              {driver.full_name}
            </Typography>
            <StatusChip status={driver.status} />
          </Box>
        </Box>

        {/* Info rows */}
        <Box display="flex" flexDirection="column" gap={0.75}>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {driver.phone_number}
            </Typography>
          </Box>
          {driver.license_plate && (
            <Box display="flex" alignItems="center" gap={1}>
              <DirectionsCarIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {driver.license_plate}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
