const XLSX = require("xlsx");

// Khởi tạo dữ liệu
const accounts = [];
for (let i = 1; i <= 50; i++) {
  const username = `user${i}`;
  const password = `pass${i}`;
  const full_name = `Full Name ${i}`;
  const email = `user${i}@example.com`;
  const mssv = `MSSV${i.toString().padStart(3, "0")}`; // MSSV dạng 001, 002,...

  accounts.push({ username, password, full_name, email, mssv });
}

// Tạo workbook và sheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(accounts);

// Thêm sheet vào workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

// Lưu file Excel
XLSX.writeFile(workbook, "accounts.xlsx");
console.log("File 'accounts.xlsx' đã được tạo thành công!");
