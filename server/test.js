const XLSX = require("xlsx");

// Khởi tạo dữ liệu
const accounts = [];
for (let i = 1; i <= 50; i++) {
  const username = `user${i}`;
  const password = `pass${i}`;
  const full_name = `Full Name ${i}`;
  const email = `user${i}@example.com`;
  const msnv = `MSSV${i.toString().padStart(3, "0")}`; // MSSV dạng 001, 002,...

  accounts.push({ username, password, full_name, email, msnv });
}

// Tạo workbook và sheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(accounts);

// Thêm sheet vào workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

// Lưu file Excel
XLSX.writeFile(workbook, "accounts.xlsx");
console.log("File 'accounts.xlsx' đã được tạo thành công!");


/*thêm route update với group ids
  thêm bảng mới dành cho report
  xử lý lại route update schedule
  thêm route accept cuộc họp: khi tạo cuộc hợp mới cần lưu thêm 1 trường accept_id, update sau khi người dùng accept cuộc họp, thêm reject_id
  lưu các user ko accept
  route accept chỉ cần update schedule
  
  
  frontend:
  thêm option chọn group_ids khi tạo schedule
  sửa lại giao diện meeting để hiển thị report
  thêm giao diện xử lý accept meeting

  ---> đổi lại ko p là giảng viên nữa chuyển thành nhóm trưởng và thành viên





  schedule gồm nhiều job: job xác định bằng start cycle, và end cycle khi done task hoặc close task
  thêm bảng job --> nhiêu task --> nhiều user (n-n)
    title
    description
    cycle_start
    cycle_end
    status: IN_PROGRESS, CLOSED, LATE
    deadline
    
  query jobs: cần list user nằm trong job, tính toán tiến độ dựa vào list task done/ tổng task

  thêm bảng task 
    job_id
    công việc
    mô tả
    status
    deadline
    người hoàn thành
    done_at
*/ 
