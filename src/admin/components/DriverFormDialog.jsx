import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '../../lib/supabaseClient';

const INITIAL_FORM = {
  full_name: '',
  phone_number: '',
  license_plate: '',
  status: 'OFFLINE',
};

const STATUS_OPTIONS = [
  { value: 'OFFLINE', label: 'Ngoại tuyến' },
  { value: 'IDLE', label: 'Đang rảnh' },
  { value: 'PICKING_UP', label: 'Đang đi lấy đơn' },
  { value: 'DELIVERING', label: 'Đang giao hàng' },
];

const darkFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: 'rgba(255,255,255,0.87)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#F5A623' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F5A623' },
};

export default function DriverFormDialog({ open, onClose, driver, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!driver;

  useEffect(() => {
    if (driver) {
      setForm({
        full_name: driver.full_name || '',
        phone_number: driver.phone_number || '',
        license_plate: driver.license_plate || '',
        status: driver.status || 'OFFLINE',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setError('');
  }, [driver, open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.phone_number.trim()) {
      setError('Vui lòng điền đầy đủ họ tên và số điện thoại.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isEdit) {
        result = await supabase
          .from('drivers')
          .update({
            full_name: form.full_name.trim(),
            phone_number: form.phone_number.trim(),
            license_plate: form.license_plate.trim() || null,
            status: form.status,
          })
          .eq('id', driver.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('drivers')
          .insert({
            full_name: form.full_name.trim(),
            phone_number: form.phone_number.trim(),
            license_plate: form.license_plate.trim() || null,
            status: form.status,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onSuccess(result.data, isEdit ? 'update' : 'insert');
      onClose();
    } catch (err) {
      if (err.code === '23505') {
        setError('Số điện thoại này đã tồn tại trong hệ thống.');
      } else {
        setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1A2636',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700, pb: 1 }}>
        {isEdit ? '✏️ Chỉnh sửa tài xế' : '➕ Thêm tài xế mới'}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          {error && (
            <Typography
              variant="body2"
              sx={{
                color: '#EF4444',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              ⚠️ {error}
            </Typography>
          )}

          <TextField
            label="Họ và tên *"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={darkFieldSx}
          />

          <TextField
            label="Số điện thoại *"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={darkFieldSx}
          />

          <TextField
            label="Biển số xe"
            name="license_plate"
            value={form.license_plate}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="VD: 51A-12345"
            sx={darkFieldSx}
          />

          <FormControl fullWidth size="small" sx={darkFieldSx}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Trạng thái"
              sx={{ color: 'rgba(255,255,255,0.87)' }}
              MenuProps={{
                PaperProps: {
                  sx: { background: '#1A2636', border: '1px solid rgba(255,255,255,0.1)' },
                },
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ color: 'rgba(255,255,255,0.87)' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.87)' } }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #F5A623, #D4891C)',
            color: '#0F1923',
            fontWeight: 700,
            px: 3,
            '&:hover': { background: 'linear-gradient(135deg, #FFB74D, #F5A623)' },
          }}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: '#0F1923' }} /> : null}
        >
          {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm tài xế'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
