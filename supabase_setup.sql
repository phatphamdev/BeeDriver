-- ============================================================
-- BeeDriver - SQL Setup Script
-- Chạy script này trong Supabase SQL Editor
-- ============================================================

-- 1. Tạo bảng drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name     text NOT NULL,
  phone_number  text UNIQUE NOT NULL,
  license_plate text,
  status        text NOT NULL DEFAULT 'OFFLINE'
                  CHECK (status IN ('OFFLINE', 'IDLE', 'PICKING_UP', 'DELIVERING')),
  updated_at    timestamptz DEFAULT now()
);

-- 2. Tạo function tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Gắn trigger cập nhật updated_at
DROP TRIGGER IF EXISTS trg_drivers_updated_at ON public.drivers;
CREATE TRIGGER trg_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Bật Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Admin (user có role 'admin' trong metadata) có toàn quyền
CREATE POLICY "Admin full access"
  ON public.drivers
  FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
  );

-- 6. Policy: Tài xế chỉ có thể đọc record của chính mình
CREATE POLICY "Driver read own"
  ON public.drivers
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- 7. Policy: Tài xế chỉ có thể update trạng thái của mình
CREATE POLICY "Driver update own status"
  ON public.drivers
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- 8. Bật Realtime cho bảng drivers
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;

-- ============================================================
-- Thêm tài khoản Admin (chạy sau khi tạo user qua Supabase Dashboard)
-- Thay 'your-admin-user-id' bằng UUID thực của admin user
-- ============================================================
-- UPDATE auth.users 
--   SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
-- WHERE id = 'your-admin-user-id';

-- ============================================================
-- Dữ liệu mẫu (tuỳ chọn - để test)
-- ============================================================
-- INSERT INTO public.drivers (full_name, phone_number, license_plate, status)
-- VALUES
--   ('Nguyễn Văn An', '0901234567', '51A-12345', 'IDLE'),
--   ('Trần Thị Bình', '0912345678', '51B-67890', 'DELIVERING'),
--   ('Lê Văn Cường', '0923456789', '51C-11111', 'PICKING_UP'),
--   ('Phạm Thị Dung', '0934567890', '51D-22222', 'OFFLINE');
