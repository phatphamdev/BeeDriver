-- ============================================================
-- BƯỚC 1: TẠO ADMIN USER TRONG SUPABASE AUTH
-- ============================================================
-- Có 2 cách để tạo user admin:
--
-- CÁCH A (Khuyến nghị): Dùng Supabase Dashboard
--   1. Vào: Authentication → Users → "Add User" (nút góc phải)
--   2. Điền Email và Password cho admin
--   3. Nhấn "Create User"
--   4. Copy UUID của user vừa tạo (cột "UID")
--   5. Sau đó chạy BƯỚC 2 bên dưới
--
-- CÁCH B: Tạo trực tiếp bằng SQL (chỉ dùng nếu cần)
--   Lưu ý: Supabase không khuyến nghị INSERT trực tiếp vào auth.users
-- ============================================================


-- ============================================================
-- BƯỚC 2: SET ROLE = 'admin' CHO USER VỪA TẠO
-- ============================================================
-- Thay 'PASTE_ADMIN_USER_UUID_HERE' bằng UUID bạn copy từ bước trên
-- Ví dụ: '550e8400-e29b-41d4-a716-446655440000'
-- ============================================================

UPDATE auth.users
SET
  raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}',
  raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE id = 'PASTE_ADMIN_USER_UUID_HERE';


-- ============================================================
-- KIỂM TRA: Xác nhận đã set role thành công
-- ============================================================
SELECT
  id,
  email,
  raw_app_meta_data ->> 'role'  AS app_role,
  raw_user_meta_data ->> 'role' AS user_role,
  created_at
FROM auth.users
WHERE id = 'PASTE_ADMIN_USER_UUID_HERE';

-- Kết quả mong đợi:
--  app_role | user_role
-- ----------+-----------
--  admin    | admin


-- ============================================================
-- (TÙY CHỌN) Xem tất cả user đang có trong hệ thống
-- ============================================================
SELECT
  id,
  email,
  raw_app_meta_data ->> 'role' AS role,
  created_at
FROM auth.users
ORDER BY created_at DESC;
