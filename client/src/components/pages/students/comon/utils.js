import { validateDateString, validateEmail } from '@/utils/helper';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

export const readExcelFile = (file, onFinish) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });

        const sheetName = workbook.SheetNames[0]; // lấy sheet đầu tiên
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        onFinish(jsonData);
    };
    reader.readAsArrayBuffer(file);
};

export const validateJsonData = (jsonData) => {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return {
            errors: ['File không hợp lệ'],
        };
    }

    const requiredFields = ['username', 'password', 'full_name', 'email', 'mssv'];
    const errors = []
    jsonData.forEach((item, index) => {
        const missingFields = requiredFields.filter(field => !item[field]);
        if (missingFields.length > 0) {
            errors.push({
                row: index + 2,
                message: `Row: ${index + 2}: Missing fields: ${missingFields.join(', ')} `
            });
        }
        if (item.birth_day) {
            if (!validateDateString(item.birth_day)) {
                errors.push({
                    row: index + 2,
                    message: `Row: ${index + 2}: Wrong format date: ${item.birth_day}`
                });
            }
        }
        if (item.email) {
            if (!validateEmail(item.email)) {
                errors.push({
                    row: index + 2,
                    message: `Row: ${index + 2}: Wrong format email: ${item.email}`
                });
            }
        }
    })

    if (errors.length > 0) {
        return {
            errors
        };
    }

    return;
};
