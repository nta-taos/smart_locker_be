export const SuccessMessages = {
  USER_REGISTERED: 'Đăng ký người dùng thành công.',
  USER_CREATED: 'Tạo người dùng thành công.',
  TOKEN_VALID: 'Token hợp lệ.',
  USER_LOGGED_IN: 'Đăng nhập thành công.',

  TRANSACTION_RETRIEVED: 'Lấy thông tin giao dịch thành công.',
  TRANSACTION_CREATED: 'Tạo giao dịch thành công.',
  TRANSACTION_UPDATED: 'Cập nhật giao dịch thành công.',
  TRANSACTION_DELETED: 'Xóa giao dịch thành công.',

  BUILDING_PUBLIC_RETRIEVED: 'Lấy danh sách building public thành công.',

  ORDERS_RETRIEVED: 'Lấy danh sách đơn hàng thành công.',
  ORDER_STATS_RETRIEVED: 'Lấy thống kê đơn hàng 7 ngày gần nhất thành công.'
}

export const ErrorMessages = {
  TOKEN_REQUIRED: 'Token là bắt buộc.',
  TOKEN_REVOKED: 'Token đã bị thu hồi.',
  TOKEN_EXPIRED: 'Phiên đang nhập đã hết hạn.',
  TOKEN_INVALID: 'Token không hợp lệ.',

  USER_NOT_FOUND: 'Người dùng không tồn tại.',
  UNAUTHORIZED: 'Không có quyền truy cập.',
  PHONE_ALREADY_REGISTERED: 'Số điện thoại đã tồn tại.',
  EMAIL_ALREADY_REGISTERED: 'Email đã tồn tại.',
  BUILDING_NOT_FOUND: 'Tòa nhà không tồn tại.',
  LOGIN_FAILED: 'Đăng nhập thất bại.'
}

export const ValidationMessages = {
  PHONE_INVALID: 'Số điện thoại không hợp lệ',
  PHONE_REQUIRED: 'Số điện thoại là bắt buộc.',
  NAME_REQUIRED: 'Tên là bắt buộc.',
  EMAIL_REQUIRED: 'Email là bắt buộc',
  EMAIL_INVALID: 'Email không hợp lệ',
  PASSWORD_REQUIRED: 'Mật khẩu là bắt buộc.',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự.',
  BUILDING_ID_NUMBER: 'ID tòa nhà phải là số.',
  ROLE_INVALID: 'Phân quyền không hợp lệ',

  PAGE_MUST_BE_INT: 'Page phải là số nguyên.',
  PAGE_MIN: 'Page phải lớn hơn hoặc bằng 1.',
  LIMIT_MUST_BE_INT: 'Limit phải là số nguyên.',
  LIMIT_MIN: 'Limit phải lớn hơn hoặc bằng 1.'
}
