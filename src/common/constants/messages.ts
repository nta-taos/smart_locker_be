export const SuccessMessages = {
  USER_REGISTERED: 'Đăng ký người dùng thành công.',
  USER_CREATED: 'Tạo người dùng thành công.',
  TOKEN_VALID: 'Token hợp lệ.',
  USER_LOGGED_IN: 'Đăng nhập thành công.',
  USER_UPDATED: 'Cập nhật người dùng thành công',
  RESET_CODE_SENT: 'Mã đặt lại mật khẩu đã được gửi.',
  PASSWORD_RESET: 'Đặt lại mật khẩu thành công.',

  TRANSACTION_RETRIEVED: 'Lấy thông tin giao dịch thành công.',
  TRANSACTION_CREATED: 'Tạo giao dịch thành công.',
  TRANSACTION_UPDATED: 'Cập nhật giao dịch thành công.',
  TRANSACTION_DELETED: 'Xóa giao dịch thành công.',

  BUILDING_PUBLIC_RETRIEVED: 'Lấy danh sách building public thành công.',

  ORDERS_RETRIEVED: 'Lấy danh sách đơn hàng thành công.',
  ORDER_STATS_RETRIEVED: 'Lấy thống kê đơn hàng 7 ngày gần nhất thành công.',
  ORDER_CREATED: 'Đơn hàng đã được tạo thành công',
  NOTIFICATION_LIST: 'Lấy danh sách thông báo thành công.',
  NOTIFICATION_READ: 'Đã đánh dấu thông báo là đã đọc.',
  NOTIFICATION_ALL_READ: 'Đã đánh dấu tất cả thông báo là đã đọc.',
  NOTIFICATION_DELETED: 'Xóa thông báo thành công.',
  PAYMENT_CREATED: 'Tạo yêu cầu thanh toán thành công.',
  PAYMENT_CONFIRMED: 'Xác nhận thanh toán thành công.',
  ORDER_AUTHORIZATION_CREATED: 'Yêu cầu ủy quyền đã được tạo thành công.',
  ORDER_AUTHORIZATION_RETRIEVED: 'Lấy thông tin ủy quyền thành công.',
  ORDER_AUTHORIZATION_USED: 'Yêu cầu ủy quyền đã được sử dụng.'
}

export const ErrorMessages = {
  TOKEN_REQUIRED: 'Token là bắt buộc.',
  TOKEN_REVOKED: 'Token đã bị thu hồi.',
  TOKEN_EXPIRED: 'Phiên đang nhập đã hết hạn.',
  TOKEN_INVALID: 'Token không hợp lệ.',

  REGISTER_ERROR: 'Tạo người dùng thất bại',
  USER_NOT_FOUND: 'Người dùng không tồn tại.',
  UNAUTHORIZED: 'Không có quyền truy cập.',
  PHONE_ALREADY_REGISTERED: 'Số điện thoại đã tồn tại.',
  EMAIL_ALREADY_REGISTERED: 'Email đã tồn tại.',
  BUILDING_NOT_FOUND: 'Tòa nhà không tồn tại.',
  LOGIN_FAILED: 'Đăng nhập thất bại.',
  RESET_CODE_INVALID: 'Liên kết đặt lại mật khẩu không hợp lệ.',
  RESET_CODE_EXPIRED: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại.',

  IMAGE_REQUIRED: 'Không có file để lưu.',
  IMAGE_INVALID: 'Chỉ được upload file ảnh.',

  UPDATE_USER_FAILED: 'Cập nhật người dùng không thành công.',

  SLOT_NOT_FOUND: 'Hộc tủ không tồn tại.',
  SLOT_ALREADY_RENTED: 'Hộc tủ này đã được thuê.',
  SLOT_PERMISSION_DENIED: 'Bạn không có quyền thuê hộc tủ này.',
  LOCKER_INACTIVE: 'Tủ không có kết nối hoặc đang bảo trì.',
  INVALID_SLOT_SIZE: 'Kích thước tủ (slot size) không hợp lệ.',
  INSUFFICIENT_FUNDS: 'Số dư ví không đủ để thực hiện giao dịch này.',
  NOTIFICATION_NOT_FOUND: 'Thông báo không tồn tại.',
  PAYMENT_INVALID_CHECKSUM: 'Checksum không hợp lệ.',
  PAYMENT_INVALID_SIGNATURE: 'Chữ ký không hợp lệ.'
}

export const ValidationMessages = {
  PHONE_INVALID: 'Số điện thoại không hợp lệ',
  PHONE_REQUIRED: 'Số điện thoại là bắt buộc.',
  NAME_REQUIRED: 'Tên là bắt buộc.',
  NAME_MAX_LENGTH: 'Tên không được quá 50 ký tự.',
  EMAIL_REQUIRED: 'Email là bắt buộc',
  EMAIL_INVALID: 'Email không hợp lệ',
  PASSWORD_REQUIRED: 'Mật khẩu là bắt buộc.',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự.',
  OTP_REQUIRED: 'Mã xác thực là bắt buộc.',
  OTP_INVALID: 'Mã xác thực phải gồm 6 chữ số.',
  RESET_TOKEN_REQUIRED: 'Token đặt lại mật khẩu là bắt buộc.',
  BUILDING_ID_NUMBER: 'ID tòa nhà phải là số.',
  ROLE_INVALID: 'Phân quyền không hợp lệ',

  PAGE_MUST_BE_INT: 'Page phải là số nguyên.',
  PAGE_MIN: 'Page phải lớn hơn hoặc bằng 1.',
  LIMIT_MUST_BE_INT: 'Limit phải là số nguyên.',
  LIMIT_MIN: 'Limit phải lớn hơn hoặc bằng 1.',

  LOCKER_SLOT_REQUIRED: 'Locker slot là bắt buộc.',
  LOCKER_SLOT_INVALID: 'Locker slot không hợp lệ.',
  END_TIME_REQUIRED: 'Thời gian kết thúc là bắt buộc.',
  END_TIME_INVALID: 'Thời gian kết thúc không hợp lệ.',
  END_TIME_MIN: 'Thời gian kết thúc phải lớn hơn hiện tại.',

  ORDER_CODE_REQUIRED: 'Mã đơn hàng là bắt buộc.',
  ORDER_CODE_INVALID: 'Mã đơn hàng phải là chuỗi.'
}
