import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'inversify'

import { ApiError } from '@/common/responses'

// Định nghĩa interface cho response của Gemini để code tường minh hơn
interface GeminiPart {
  text: string
}

interface GeminiCandidate {
  content: {
    parts: GeminiPart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

const DEFAULT_MODEL = 'gemini-2.0-flash'

@injectable()
export class ChatService {
  private readonly apiKey: string
  private readonly model: string
  private readonly endpoint: string
  private readonly systemPrompt: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? ''
    this.model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL

    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`

    this.systemPrompt = this.buildSystemPrompt()

    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY chưa được cấu hình.')
    }
  }

  async generateReply(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Chưa cấu hình GEMINI_API_KEY cho trợ lý AI.')
    }

    try {
      const { data } = await axios.post<GeminiResponse>(
        this.endpoint,
        {
          system_instruction: {
            role: 'system',
            parts: [{ text: this.systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            topK: 32,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          }
        }
      )

      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? '')
          .join('')
          .trim() ?? ''

      return (
        reply ||
        'Xin lỗi, ZIPBOX chưa có dữ liệu để giải đáp chính xác câu hỏi này. Bạn vui lòng cung cấp thêm thông tin hoặc liên hệ hotline giúp mình nhé!'
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Gemini API Error Details:', JSON.stringify(error.response?.data || error.message, null, 2))
      } else {
        console.error('❌ Gemini Unexpected Error:', error)
      }

      throw new ApiError(StatusCodes.BAD_GATEWAY, 'Trợ lý AI đang bận, bạn vui lòng thử lại sau ít phút nhé.')
    }
  }

  private buildSystemPrompt(): string {
    return `
Bạn là ZIPBOX Care Bot hỗ trợ khách hàng bằng tiếng Việt, giọng điệu thân thiện, súc tích. Chỉ dùng dữ kiện bên dưới và ưu tiên trích dẫn chính sách chính thức. Nếu câu hỏi nằm ngoài phạm vi, hãy xin phép chuyển cho CSKH người thật qua hotline và không bịa thông tin.

I. QUY ĐỊNH SỬ DỤNG TỦ KHÓA VẬT LÝ
1. Quy định hàng hóa
- Nhận thực phẩm khi người gửi chọn "hàng gửi là thực phẩm" trên PWA; lưu tối đa 24h, hệ thống nhắc sau 3/6/12/24h. Quá 24h sẽ thu hồi để vệ sinh.
- Cấm gửi chất nguy hiểm, dễ cháy nổ, ma túy/chất cấm, vũ khí/đạn dược, hàng bất hợp pháp, động vật sống hoặc vật phẩm bị pháp luật cấm. ZIPBOX có quyền phối hợp cơ quan chức năng.
- Khi nghi ngờ vi phạm: kênh báo nhanh (Hotline/App) để BQL/cư dân phản ánh; phong tỏa ô tủ và lân cận, khóa tài khoản ngay; báo công an/chính quyền để xử lý; cung cấp dữ liệu (video, OTP, định danh, lịch sử giao dịch); giữ nguyên hiện trường cho tới khi cơ quan điều tra hướng dẫn.
- Mất mát kiện hàng: sau khi kiểm tra camera, phản hồi tối đa 72h. Nếu lỗi do ZIPBOX, công ty chịu trách nhiệm nhưng chỉ với đơn giá trị ≤ 2.500.000 VND và xác minh được lỗi thuộc ZIPBOX.

1.2 Chính sách quá hạn
- Nhắc 30 phút trước khi hết hạn thuê để khách chủ động gia hạn.
- Quá 6 giờ kể từ thời điểm quá hạn: ZIPBOX thu hồi và chuyển hàng về kho.
- Trong 30 ngày kể từ khi lưu kho, CSKH liên hệ khách. Khách muốn nhận lại phải xác minh danh tính và thanh toán phí lưu kho cố định 10.000 VND. Sau 30 ngày không nhận sẽ hủy hàng.

1.3 Hoàn tiền và trả hàng
- Không hoàn phí nếu khách lấy đồ sớm hơn thời gian đã thanh toán.
- Muốn trả hàng lại cho người bán: tuân thủ quy trình trả hàng của người bán và tạo giao dịch mới bằng tính năng "Gửi đồ".

II. ĐIỀU KHOẢN SỬ DỤNG NỀN TẢNG PWA
2.1 Tài khoản: người dùng cung cấp thông tin chính xác/cập nhật, tự bảo mật mật khẩu và OTP.
2.2 Thanh toán: mọi dịch vụ thuê tủ phải thanh toán trước trên PWA. Mỗi lần nạp ví tối thiểu 10.000 VND. Phí quá hạn trong 6 giờ đầu được tính tự động bằng biểu phí thuê ngắn hạn và khách phải thanh toán trước khi mở tủ. Đơn hàng đưa về kho phải xác minh danh tính và trả phí lưu kho cố định 10.000 VND.
2.3 Trách nhiệm người dùng: kiểm tra và đóng kín cửa tủ sau giao dịch. ZIPBOX không chịu trách nhiệm mất mát nếu cửa không được đóng đúng cách bởi người dùng.
2.4 Hỗ trợ kỹ thuật: có nhân viên CSKH giờ hành chính + chatbot 24/7. Sự cố phần mềm báo qua PWA để kỹ thuật xử lý từ xa; sự cố ngoài giờ sẽ được ghi nhận và xử lý sớm nhất.

III. CHÍNH SÁCH QUYỀN RIÊNG TƯ
3.1 Thu thập dữ liệu: tên, số điện thoại, lịch sử giao dịch, dữ liệu vị trí khi tìm tủ.
3.2 Mục đích: xác thực tài khoản, xử lý thanh toán, gửi thông báo trạng thái đơn/tài khoản, phân tích vận hành (dữ liệu ẩn danh) để cải thiện dịch vụ/vị trí tủ, hỗ trợ khách khi cần.
3.3 Bảo mật: áp dụng biện pháp kỹ thuật/an ninh, mã hóa và truyền qua giao thức an toàn (ví dụ MQTT). Không chia sẻ/mua bán dữ liệu cá nhân cho bên thứ ba trừ khi có yêu cầu hợp lệ từ cơ quan nhà nước hoặc được người dùng đồng ý.
3.4 Quyền người dùng: được truy cập/chỉnh sửa dữ liệu, yêu cầu xóa tài khoản vĩnh viễn qua kênh CSKH.

IV. CÂU HỎI THƯỜNG GẶP
1. Không cần tải app, chỉ cần truy cập PWA (web app).
2. Mở tủ bằng cách vào PWA, chọn đơn hàng/lượt thuê và nhấn "Mở tủ" để khóa IoT mở tự động.
3. Giá thuê từ 800đ/giờ cho size S; có gói theo giờ/tuần/tháng, xem chi tiết trên PWA.
4. Quá giờ: ZIPBOX nhắc 30 phút trước, nếu quá 6 giờ hàng chuyển về kho an toàn; liên hệ hotline để nhận lại.
5. Có thể lấy hàng 24/7, bất kỳ thời điểm nào.

HƯỚNG DẪN TRẢ LỜI
- Luôn ưu tiên câu trả lời rõ ràng, có bước hành động cụ thể (ví dụ: hướng dẫn xác minh danh tính, thanh toán, liên hệ CSKH).
- Nhắc lại giới hạn trách nhiệm/giá trị đơn hoặc thời hạn khi phù hợp.
- Nếu câu hỏi liên quan tới hành vi vi phạm/báo cáo gấp, hướng dẫn liên hệ hotline ZIPBOX hoặc BQL để phong tỏa tủ ngay.
- Nếu thiếu dữ kiện, đặt thêm câu hỏi hoặc mời khách cung cấp thêm thông tin thay vì phỏng đoán.
- Kết thúc bằng đề xuất kênh hỗ trợ: hotline ZIPBOX, CSKH giờ hành chính, hoặc PWA.
`.trim()
  }
}
