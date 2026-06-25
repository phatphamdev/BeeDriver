import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

// Cấu hình trạng thái hiển thị
const STATUS_DISPLAY = {
  OFFLINE: {
    label: 'Ngoại tuyến',
    emoji: '🔴',
    color: '#EF4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    ring: 'ring-red-500/20',
  },
  IDLE: {
    label: 'Đang rảnh',
    emoji: '🟢',
    color: '#22C55E',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    ring: 'ring-green-500/20',
  },
  PICKING_UP: {
    label: 'Đang đi lấy đơn',
    emoji: '🟡',
    color: '#EAB308',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/20',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    emoji: '🔵',
    color: '#3B82F6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
};

// Cấu hình các nút hành động
const ACTION_BUTTONS = [
  {
    id: 'start-shift',
    label: 'Bắt đầu ca làm',
    emoji: '▶️',
    targetStatus: 'IDLE',
    fromStatuses: ['OFFLINE'],
    gradient: 'from-green-600 to-green-500',
    shadow: 'shadow-green-500/30',
    description: 'Bắt đầu ca làm việc hôm nay',
  },
  {
    id: 'pickup',
    label: 'Nhận đơn - Đang đi lấy',
    emoji: '📦',
    targetStatus: 'PICKING_UP',
    fromStatuses: ['IDLE'],
    gradient: 'from-yellow-600 to-yellow-500',
    shadow: 'shadow-yellow-500/30',
    description: 'Đang trên đường đến lấy hàng',
  },
  {
    id: 'delivering',
    label: 'Đang đi giao',
    emoji: '🏍️',
    targetStatus: 'DELIVERING',
    fromStatuses: ['PICKING_UP'],
    gradient: 'from-blue-600 to-blue-500',
    shadow: 'shadow-blue-500/30',
    description: 'Đang giao hàng đến khách',
  },
  {
    id: 'done-rest',
    label: 'Hoàn thành - Nghỉ ngơi',
    emoji: '✅',
    targetStatus: 'IDLE',
    fromStatuses: ['DELIVERING'],
    gradient: 'from-green-600 to-teal-500',
    shadow: 'shadow-teal-500/30',
    description: 'Hoàn thành đơn, trở về trạng thái rảnh',
  },
  {
    id: 'end-shift',
    label: 'Kết thúc ca làm',
    emoji: '⏹️',
    targetStatus: 'OFFLINE',
    fromStatuses: ['IDLE', 'DELIVERING', 'PICKING_UP'],
    gradient: 'from-red-700 to-red-600',
    shadow: 'shadow-red-500/30',
    description: 'Kết thúc ca làm, đăng xuất khỏi hệ thống',
  },
];

function SwipeButton({ onConfirm, loading, label, emoji, gradient, shadow }) {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  
  const THUMB_WIDTH = 72;
  const PADDING = 6;

  const handlePointerDown = (e) => {
    if (loading) return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    const trackWidth = trackRef.current.offsetWidth;
    const maxDrag = trackWidth - THUMB_WIDTH - (PADDING * 2);

    const trackRect = trackRef.current.getBoundingClientRect();
    let newX = e.clientX - trackRect.left - (THUMB_WIDTH / 2) - PADDING;
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;

    setPosition(newX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging || !trackRef.current) return;
    setIsDragging(false);
    
    const trackWidth = trackRef.current.offsetWidth;
    const maxDrag = trackWidth - THUMB_WIDTH - (PADDING * 2);

    if (position > maxDrag * 0.75) {
      setPosition(maxDrag);
      onConfirm();
    } else {
      setPosition(0);
    }
  };

  useEffect(() => {
    if (!loading && !isDragging) {
      setPosition(0);
    }
  }, [loading, isDragging]);

  return (
    <div 
      ref={trackRef}
      className={`relative w-full h-[72px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center touch-none select-none shadow-lg ${shadow} mb-3`}
    >
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className={`font-bold text-sm ${position > 50 ? 'opacity-0' : 'opacity-100'} text-white/50 transition-opacity duration-200 uppercase tracking-wide`}>
             Vuốt để {label.toLowerCase()} &gt;&gt;&gt;
          </span>
       </div>

       <div 
         className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${gradient} opacity-20`}
         style={{ width: `${position + THUMB_WIDTH/2 + PADDING}px`, transition: isDragging ? 'none' : 'width 0.3s ease' }}
       />

       <div 
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}
         style={{ 
           transform: `translateX(${position}px)`,
           width: `${THUMB_WIDTH}px`,
           transition: isDragging ? 'none' : 'transform 0.3s ease'
         }}
         className={`absolute left-[6px] top-[6px] bottom-[6px] rounded-[14px] bg-gradient-to-r ${gradient} flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-md`}
       >
         {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
         ) : (
            <span className="text-2xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{emoji}</span>
         )}
       </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl
                  flex items-center gap-2 text-sm font-medium animate-bounce-in
                  ${type === 'success'
        ? 'bg-green-500/90 text-white'
        : 'bg-red-500/90 text-white'
      }`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

export default function Workspace() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // ID của button đang loading
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchDriverInfo = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Tài xế chưa được liên kết - hiển thị thông báo
        setDriverInfo(null);
      }
    } else {
      setDriverInfo(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDriverInfo();
  }, [fetchDriverInfo]);

  const handleStatusUpdate = async (button) => {
    if (!driverInfo) return;
    if (!button.fromStatuses.includes(driverInfo.status)) {
      showToast('Trạng thái không hợp lệ cho thao tác này.', 'error');
      return;
    }

    setUpdating(button.id);

    const { data, error } = await supabase
      .from('drivers')
      .update({ status: button.targetStatus })
      .eq('id', driverInfo.id)
      .select()
      .single();

    if (error) {
      showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
    } else {
      setDriverInfo(data);
      showToast(`Đã chuyển sang: ${STATUS_DISPLAY[button.targetStatus].label}`, 'success');
    }

    setUpdating(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/driver/login');
  };

  const currentStatus = driverInfo?.status || 'OFFLINE';
  const statusConfig = STATUS_DISPLAY[currentStatus];

  // Lọc các nút trạng thái làm việc (không bao gồm kết thúc ca)
  const primaryButtons = ACTION_BUTTONS.filter((btn) =>
    btn.id !== 'end-shift' && btn.fromStatuses.includes(currentStatus)
  );

  // Nút kết thúc ca làm (nếu có thể click lúc này)
  const endShiftButton = ACTION_BUTTONS.find((btn) =>
    btn.id === 'end-shift' && btn.fromStatuses.includes(currentStatus)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1923] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1923] flex flex-col">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-[#1A2636]/80 backdrop-blur-xl border-b border-white/8 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F5A623] to-[#D4891C] rounded-lg flex items-center justify-center text-lg">
              🐝
            </div>
            <span className="font-extrabold text-[#F5A623] text-base">BeeDriver</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/40 hover:text-red-400 transition-colors text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col">
        {!driverInfo ? (
          // Chưa được liên kết
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-white/80 font-bold text-xl mb-2">Tài khoản chưa được cấu hình</h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Tài khoản của bạn chưa được liên kết với hồ sơ tài xế.
              Vui lòng liên hệ quản trị viên để được hỗ trợ.
            </p>
          </div>
        ) : (
          <>
            {/* Driver Info Card */}
            <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-3xl p-5 mb-6 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(circle at 70% 50%, ${statusConfig.color}, transparent 60%)` }} />
              <div className="relative z-10">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${statusConfig.color}30, ${statusConfig.color}10)`,
                      border: `2px solid ${statusConfig.color}40`,
                      color: statusConfig.color,
                    }}
                  >
                    {driverInfo.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white/90 font-bold text-xl leading-tight">{driverInfo.full_name}</h2>
                    <p className="text-white/45 text-sm">{driverInfo.phone_number}</p>
                    {driverInfo.license_plate && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-md text-white/60 text-xs font-mono">
                        🚗 {driverInfo.license_plate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Status */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: statusConfig.color, boxShadow: `0 0 8px ${statusConfig.color}` }}
                  />
                  <div>
                    <p className="text-white/35 text-xs uppercase tracking-wider">Trạng thái hiện tại</p>
                    <p className={`${statusConfig.text} font-bold text-lg leading-tight`}>
                      {statusConfig.emoji} {statusConfig.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex flex-col justify-center mb-8">
              <h3 className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-3">
                Hành động khả dụng
              </h3>

              {primaryButtons.length === 0 && !endShiftButton ? (
                <div className="bg-white/4 border border-white/8 rounded-2xl p-6 text-center">
                  <p className="text-white/30 text-sm">Không có hành động nào khả dụng.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {primaryButtons.map((btn) => {
                    const isLoading = updating === btn.id;
                    return (
                      <SwipeButton
                        key={btn.id}
                        label={btn.label}
                        emoji={btn.emoji}
                        gradient={btn.gradient}
                        shadow={btn.shadow}
                        loading={isLoading}
                        onConfirm={() => handleStatusUpdate(btn)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Status Reference */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-4 mt-auto">
              <div className="flex justify-between items-center mb-3">
                <p className="text-white/30 text-xs uppercase tracking-wider font-semibold">
                  Tất cả trạng thái
                </p>
                {endShiftButton && (
                  <button 
                    onClick={() => handleStatusUpdate(endShiftButton)}
                    disabled={updating === endShiftButton.id}
                    className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/30 transition-all shadow-sm active:scale-95"
                  >
                    <span className="text-xl leading-none">{updating === endShiftButton.id ? '⏳' : endShiftButton.emoji}</span> 
                    {endShiftButton.label}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_DISPLAY).map(([key, cfg]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.border}
                                ${currentStatus === key ? cfg.bg : 'bg-transparent opacity-50'}`}
                  >
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                    {currentStatus === key && (
                      <span className="ml-auto text-white/40 text-xs">← Hiện tại</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
