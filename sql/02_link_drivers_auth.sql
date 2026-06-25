-- ============================================================
-- BƯỚC 1: TẠO TÀI KHOẢN AUTH CHO TÀI XẾ (trên Dashboard)
-- ============================================================
-- 1. Vào: Authentication → Users → "Add User"
-- 2. Điền Email và Password cho từng tài xế
--    Ví dụ:
--      Email: taixe.an@beedriver.vn  | Password: TaixeAn@2025
--      Email: taixe.binh@beedriver.vn| Password: TaixeBinh@2025
-- 3. Copy UUID của từng tài xế từ cột "UID"
-- ============================================================


-- ============================================================
-- BƯỚC 2: THÊM TÀI XẾ VÀO BẢNG drivers VÀ LIÊN KẾT auth_user_id
-- ============================================================
-- Thay các UUID 'PASTE_USER_UUID_...' bằng UUID thực từ Auth Dashboard
-- ============================================================

INSERT INTO public.drivers
  (auth_user_id,                           full_name,          phone_number,   license_plate, status)
VALUES
  ('PASTE_USER_UUID_TAI_XE_1_HERE',        'Nguyễn Văn An',    '0901234567',   '51A-12345',   'OFFLINE'),
  ('PASTE_USER_UUID_TAI_XE_2_HERE',        'Trần Thị Bình',    '0912345678',   '51B-67890',   'OFFLINE'),
  ('PASTE_USER_UUID_TAI_XE_3_HERE',        'Lê Văn Cường',     '0923456789',   '51C-11111',   'OFFLINE'),
  ('PASTE_USER_UUID_TAI_XE_4_HERE',        'Phạm Thị Dung',    '0934567890',   '51D-22222',   'OFFLINE');

-- Ghi chú:
--   - Nếu tài xế chưa có tài khoản Auth, có thể để auth_user_id = NULL
--     và liên kết sau bằng UPDATE bên dưới
--   - Mỗi phone_number phải là DUY NHẤT trong bảng


-- ============================================================
-- TRƯỜNG HỢP: Thêm tài xế KHÔNG CÓ tài khoản Auth trước
-- (Liên kết auth_user_id sau khi tạo Auth user)
-- ============================================================

-- Bước A: Thêm tài xế chưa có Auth account
INSERT INTO public.drivers (full_name, phone_number, license_plate, status)
VALUES ('Hoàng Văn Em', '0945678901', '51E-33333', 'OFFLINE');

-- Bước B: Sau khi tạo Auth user cho họ → liên kết bằng UUID
UPDATE public.drivers
SET auth_user_id = 'PASTE_USER_UUID_TAI_XE_5_HERE'
WHERE phone_number = '0945678901';


-- ============================================================
-- BƯỚC 3: KIỂM TRA - Xác nhận liên kết thành công
-- ============================================================
SELECT
  d.id,
  d.full_name,
  d.phone_number,
  d.license_plate,
  d.status,
  d.auth_user_id,
  u.email AS auth_email,
  CASE
    WHEN d.auth_user_id IS NOT NULL THEN '✅ Đã liên kết'
    ELSE '❌ Chưa liên kết'
  END AS ket_qua
FROM public.drivers d
LEFT JOIN auth.users u ON u.id = d.auth_user_id
ORDER BY d.full_name;

-- Kết quả mong đợi:
--  full_name       | auth_email                    | ket_qua
-- -----------------+-------------------------------+------------------
--  Nguyễn Văn An  | taixe.an@beedriver.vn         | ✅ Đã liên kết
--  Trần Thị Bình  | taixe.binh@beedriver.vn        | ✅ Đã liên kết
--  ...


-- ============================================================
-- TIỆN ÍCH: Tìm UUID của user theo email (khi cần update)
-- ============================================================
SELECT id, email FROM auth.users
WHERE email ILIKE '%taixe%'   -- thay từ khóa phù hợp
ORDER BY created_at DESC;


-- ============================================================
-- TIỆN ÍCH: Gỡ liên kết nếu nhập sai UUID
-- ============================================================
-- UPDATE public.drivers
-- SET auth_user_id = NULL
-- WHERE phone_number = '0901234567';
