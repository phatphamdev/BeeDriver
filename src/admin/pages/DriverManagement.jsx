import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import PeopleIcon from '@mui/icons-material/People';
import { supabase } from '../../lib/supabaseClient';
import { StatusChip } from '../components/StatusChip';
import DriverFormDialog from '../components/DriverFormDialog';

const tableSx = {
  '& .MuiTableCell-root': {
    borderColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.82)',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  '& .MuiTableRow-root:hover .MuiTableCell-root': {
    background: 'rgba(255,255,255,0.03)',
  },
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('full_name');

    if (!error && data) setDrivers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFormSuccess = (driver, action) => {
    if (action === 'insert') {
      setDrivers((prev) =>
        [...prev, driver].sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      showSnackbar(`Đã thêm tài xế "${driver.full_name}" thành công!`);
    } else {
      setDrivers((prev) => prev.map((d) => (d.id === driver.id ? driver : d)));
      showSnackbar(`Đã cập nhật thông tin tài xế "${driver.full_name}"!`);
    }
  };

  const handleOpenAdd = () => {
    setEditDriver(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditDriver(driver);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('drivers').delete().eq('id', deleteTarget.id);
    if (error) {
      showSnackbar('Xóa tài xế thất bại. Vui lòng thử lại.', 'error');
    } else {
      setDrivers((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showSnackbar(`Đã xóa tài xế "${deleteTarget.full_name}".`);
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone_number?.includes(search) ||
      d.license_plate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: 'rgba(255,255,255,0.92)' }}>
            Quản lý tài xế
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            {drivers.length} tài xế trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            background: 'linear-gradient(135deg, #F5A623, #D4891C)',
            color: '#0F1923',
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
            '&:hover': { background: 'linear-gradient(135deg, #FFB74D, #F5A623)' },
          }}
        >
          Thêm tài xế
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Tìm kiếm theo tên, SĐT, biển số..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{
          mb: 2.5,
          width: { xs: '100%', sm: 360 },
          '& .MuiOutlinedInput-root': {
            color: 'rgba(255,255,255,0.87)',
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
            '&.Mui-focused fieldset': { borderColor: '#F5A623' },
          },
          '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(26, 38, 54, 0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Biển số xe</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật lúc</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.12)', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>
                      {search ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có tài xế nào.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver, idx) => (
                  <TableRow key={driver.id}>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.3)', width: 40 }}>{idx + 1}</TableCell>
                    <TableCell fontWeight={600}>{driver.full_name}</TableCell>
                    <TableCell>{driver.phone_number}</TableCell>
                    <TableCell>{driver.license_plate || '—'}</TableCell>
                    <TableCell><StatusChip status={driver.status} /></TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                      {driver.updated_at
                        ? new Date(driver.updated_at).toLocaleString('vi-VN')
                        : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(driver)}
                            sx={{ color: '#F5A623', '&:hover': { background: 'rgba(245,166,35,0.1)' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa tài xế">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(driver)}
                            sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Form Dialog */}
      <DriverFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        driver={editDriver}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: '#1A2636',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
          🗑️ Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Bạn có chắc muốn xóa tài xế{' '}
            <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{deleteTarget?.full_name}</strong>?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            sx={{
              background: '#EF4444',
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 700,
              '&:hover': { background: '#DC2626' },
            }}
          >
            {deleting ? 'Đang xóa...' : 'Xóa tài xế'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontFamily: 'Inter' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
