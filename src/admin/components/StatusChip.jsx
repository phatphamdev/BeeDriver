import Chip from '@mui/material/Chip';

const STATUS_CONFIG = {
  OFFLINE: {
    label: 'Ngoại tuyến',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  IDLE: {
    label: 'Đang rảnh',
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
  },
  PICKING_UP: {
    label: 'Đang đi lấy đơn',
    color: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
};

export function StatusChip({ status, size = 'small' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}40`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.85rem',
        '& .MuiChip-label': {
          px: 1.5,
        },
      }}
    />
  );
}

export { STATUS_CONFIG };
