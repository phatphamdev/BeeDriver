import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#F5A623' },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
});

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: 'rgba(255,255,255,0.87)',
    background: 'rgba(255,255,255,0.04)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
    '&.Mui-focused fieldset': { borderColor: '#F5A623' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F5A623' },
};

export default function AdminLogin() {
  const { user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu đã đăng nhập và là admin, redirect
  if (user && isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    // Kiểm tra role sau khi đăng nhập
    // AuthContext sẽ cập nhật user, sau đó redirect
    setTimeout(() => {
      navigate('/admin/dashboard');
      setLoading(false);
    }, 300);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F1923 0%, #1A2636 50%, #0F1923 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Login Card */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(26, 38, 54, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #F5A623, #D4891C)',
                borderRadius: 3,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                mb: 2,
                boxShadow: '0 8px 24px rgba(245,166,35,0.3)',
              }}
            >
              🐝
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'rgba(255,255,255,0.92)' }}>
              BeeDriver Admin
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
              Đăng nhập để quản lý hệ thống
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Box
              sx={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 2,
                p: 1.5,
                mb: 3,
              }}
            >
              <Typography variant="body2" sx={{ color: '#EF4444' }}>
                ⚠️ {error}
              </Typography>
            </Box>
          )}

          {/* Fields */}
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Email quản trị"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoComplete="email"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Mật khẩu"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw(!showPw)}
                      edge="end"
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                background: 'linear-gradient(135deg, #F5A623, #D4891C)',
                color: '#0F1923',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFB74D, #F5A623)',
                  boxShadow: '0 6px 20px rgba(245,166,35,0.45)',
                },
              }}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#0F1923' }} /> : null}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
