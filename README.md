# 📌 MoneyMinder: Personal Finance Management System

## 👥 Team Members
- Nguyen Son Giang
- Tran Nam Nhat Anh
- Nguyen Tran Nhat Minh
- Nguyen Hoang Nam

## 📄 Brief Description
**MoneyMinder** là một ứng dụng toàn diện dựa trên cơ sở dữ liệu được thiết kế để giúp các cá nhân **và các nhóm (gia đình, bạn cùng phòng)** theo dõi thu nhập, chi phí và mục tiêu tiết kiệm của họ một cách thông minh và linh hoạt.

**Vấn đề (The Problem):** Nhiều cá nhân gặp khó khăn trong việc duy trì sức khỏe tài chính do dữ liệu nằm rải rác, khó theo dõi các khoản chi chung trong nhóm, hay quên các khoản thanh toán định kỳ (subscription). Họ cũng thường bối rối khi đi du lịch nước ngoài với nhiều loại tiền tệ khác nhau, và không nhận ra kịp thời khi một hóa đơn (điện, nước) tăng cao bất thường.

**Giải pháp (The Solution):** Hệ thống này giải quyết vấn đề bằng cách cung cấp một nền tảng tập trung để ghi lại các giao dịch tài chính **(cá nhân và chung)**, hỗ trợ **đa tiền tệ** cho việc đi lại, tự động hóa các **khoản chi định kỳ**, và chủ động **cảnh báo** khi có dấu hiệu chi tiêu bất thường. Nó tận dụng cơ sở dữ liệu quan hệ mạnh mẽ để đảm bảo tính toàn vẹn của dữ liệu và cho phép truy vấn phức tạp về lịch sử tài chính.

## 🎯 Functional & Non-functional Requirements

### Functional Requirements (Yêu cầu chức năng)

1.  **User Management (Quản lý người dùng):** Người dùng có thể đăng ký, đăng nhập và thiết lập hồ sơ (bao gồm chọn đồng tiền cơ sở mặc định, ví dụ: VND).
2.  **Group Management (Quản lý nhóm):** Tạo nhóm chi tiêu chung, mời thành viên và xem danh sách thành viên.
3.  **Transaction Management (Quản lý giao dịch):** CRUD thu nhập/chi phí. Chọn ngữ cảnh "Cá nhân" hoặc "Nhóm" khi tạo giao dịch.
4.  **Multi-Currency & Travel Mode (Đa tiền tệ & Chế độ du lịch - TÍNH NĂNG MỚI):**
    * Cho phép ghi lại giao dịch bằng ngoại tệ khác với đồng tiền cơ sở (ví dụ: chi tiêu USD khi đi du lịch trong khi tài khoản chính là VND).
    * Người dùng nhập số tiền nguyên tệ và tỷ giá hối đoái tại thời điểm giao dịch. Hệ thống lưu trữ cả hai và quy đổi về đồng tiền chính để báo cáo.
5.  **Subscription & Recurring Payments (Quản lý đăng ký & Thanh toán định kỳ - TÍNH NĂNG MỚI):**
    * Người dùng thiết lập các khoản chi lặp lại (ví dụ: Netflix, tiền thuê nhà, tiền Internet) với tần suất nhất định (hàng tháng, hàng năm).
    * Hệ thống tự động tạo giao dịch khi đến hạn hoặc gửi thông báo nhắc nhở người dùng xác nhận thanh toán.
6.  **Unusual Spending Alerts (Cảnh báo chi tiêu bất thường - TÍNH NĂNG MỚI):**
    * Hệ thống phân tích lịch sử chi tiêu cho các danh mục thiết yếu (ví dụ: Điện, Nước).
    * Nếu một hóa đơn mới nhập vào cao hơn đáng kể so với mức trung bình lịch sử của người dùng đó (ví dụ: vượt quá 25%), hệ thống sẽ hiển thị cảnh báo để người dùng kiểm tra lại.
7.  **Categorization & Budgeting (Phân loại & Ngân sách):** Liên kết giao dịch với danh mục và đặt giới hạn chi tiêu hàng tháng.
8.  **Reporting (Báo cáo):** Tạo báo cáo tài chính tổng hợp, có thể lọc theo thời gian, danh mục, thành viên nhóm, hoặc loại tiền tệ.

### Non-functional Requirements (Yêu cầu phi chức năng)
1.  **Data Integrity:** Cơ sở dữ liệu phải thực thi nghiêm ngặt tính toàn vẹn tham chiếu (khóa ngoại) và các thuộc tính ACID.
2.  **Security:** Mật khẩu được băm; ngăn chặn SQL injection. Đảm bảo quyền riêng tư dữ liệu giữa các nhóm và cá nhân.
3.  **Performance:** Các truy vấn lịch sử và tính toán báo cáo phải nhanh chóng, ngay cả khi dữ liệu giao dịch tăng lên theo thời gian.
4.  **Scalability:** Lược đồ DB cần được thiết kế để dễ dàng mở rộng cho các tính năng mới (ví dụ: tích hợp API tỷ giá hối đoái tự động trong tương lai).

## 🔄 System Workflow

Biểu đồ dưới đây minh họa luồng người dùng cấp cao trong hệ thống MoneyMinder.

*(Lưu ý: Luồng công việc bên dưới là cơ bản. Các tính năng mới như "Chọn loại tiền tệ" sẽ xuất hiện trong bước "Add Transaction". Tính năng "Recurring Payments" sẽ là một tiến trình chạy nền tự động tạo giao dịch).*

![Personal Financial Management System Workflow](https://github.com/Mancupfire/Database_Management/blob/main/Image/Workflow.png)

## 🧱 Planned Core Entities
*Tóm tắt lược đồ cơ sở dữ liệu (Đã cập nhật cho 3 tính năng mới):*

1.  **Users:** Thông tin xác thực, hồ sơ, và **`base_currency` (đồng tiền mặc định)**.
2.  **Groups & User_Groups:** Quản lý thông tin nhóm và thành viên nhóm.
3.  **Accounts:** Các nguồn tiền (Tiền mặt, Ngân hàng).
4.  **Categories:** Các loại chi tiêu/thu nhập.
5.  **Transactions (CẬP NHẬT LỚN):** Bảng dữ kiện trung tâm.
    * Các trường cũ: amount, date, description, type, UserID, AccountID, CategoryID, GroupID (nullable).
    * **Trường mới cho Đa tiền tệ:** `original_amount` (số tiền ngoại tệ), `currency_code` (loại ngoại tệ, v.d: USD), `exchange_rate` (tỷ giá áp dụng).
6.  **Recurring_Payments (MỚI):** Lưu trữ định nghĩa các khoản chi lặp lại.
    * Các trường: `frequency` (tần suất: hàng tháng/tuần), `start_date`, `next_due_date`, số tiền dự kiến, và các khóa ngoại liên kết đến User, Category.
7.  **Budgets:** Giới hạn chi tiêu theo danh mục.

## 🔧 Tech Stack

* **Database:** [MySQL / PostgreSQL] - *Hãy chọn 1 loại bạn đang dùng*
* **Backend:** [Python (Flask) / Node.js / PHP] - *Hãy chọn stack bạn đang dùng*
* **Frontend:** [HTML5, CSS3, Bootstrap / React] - *Hãy chọn stack bạn đang dùng*
* **Version Control:** Git & GitHub
* **Diagramming Tools:** [Draw.io / Lucidchart] (cho ER Diagrams)

## 👥 Team Roles and Responsibilities

*(Điều chỉnh lại cho phù hợp với thực tế nhóm của bạn)*

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Nguyen Son Giang** | Project Lead & DB Architect | Thiết kế ERD, chuẩn hóa lược đồ DB (bao gồm bảng Recurring mới và các trường tiền tệ). |
| **Tran Nam Nhat Anh** | Backend Developer | Phát triển API CRUD, logic xử lý giao dịch đa tiền tệ và tiến trình tự động cho thanh toán định kỳ. |
| **Nguyen Tran Nhat Minh** | Frontend Developer | Thiết kế UI/UX, tạo form nhập liệu hỗ trợ chọn ngoại tệ và giao diện quản lý subscription. |
| **Nguyen Hoang Nam** | QA & Documentation | Kiểm thử chức năng (đặc biệt là tính toán tỷ giá và cảnh báo bất thường), viết tài liệu. |

## 🗓️ Timeline (Planned Milestones)

* **Week 1: Requirement Analysis & Design**
    * Finalize scope with new features (Multi-currency, Recurring, Alerts).
    * Finalize ER Diagram and database normalization.
* **Week 2: Database Implementation**
    * Set up DBMS. Write DDL scripts for all tables bao gồm `Recurring_Payments` và các thay đổi trong `Transactions`.
* **Week 3: Backend Development - Core & Currency**
    * Implement basic CRUD and Authentication.
    * Implement logic for handling multi-currency transactions and exchange rate storage.
* **Week 4: Backend Development - Advanced Features**
    * Implement logic for Recurring Payments scheduler.
    * Implement logic for Unusual Spending Alerts (so sánh với lịch sử trung bình).
* **Week 5: Frontend Integration & Testing**
    * Build UI for transaction inputs (with currency formatting) and subscription management.
    * Perform comprehensive testing and deployment.
