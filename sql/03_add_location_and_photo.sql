-- ============================================================
-- BƯỚC 3: CẬP NHẬT DATABASE CHO TÍNH NĂNG ĐỊNH VỊ & CHỤP ẢNH
-- Chạy script này trong Supabase SQL Editor
-- ============================================================

-- 1. Thêm cột tọa độ và ảnh vào bảng drivers
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS last_photo_url text;

-- 2. Tạo Storage bucket 'checkins' (Chứa ảnh chụp của tài xế)
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkins', 'checkins', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy: Cho phép tài xế đã đăng nhập được upload ảnh lên bucket 'checkins'
DROP POLICY IF EXISTS "Cho phép tài xế upload ảnh" ON storage.objects;
CREATE POLICY "Cho phép tài xế upload ảnh"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkins');

-- 4. Policy: Cho phép mọi người đọc ảnh từ bucket 'checkins'
DROP POLICY IF EXISTS "Cho phép xem ảnh công khai" ON storage.objects;
CREATE POLICY "Cho phép xem ảnh công khai"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkins');
