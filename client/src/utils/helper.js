export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const validateDateString = (dateStr) => {
    console.log(dateStr);
    let date = dateStr;
    if (typeof dateStr !== 'string') {
        date = String(dateStr);
    }
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

    if (!regex.test(date)) {
        return false;
    }

    const dateObj = new Date(date);
    const [month, day, year] = date.split('/').map((item) => parseInt(item));
    return (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() + 1 === month &&
        dateObj.getDate() === day
    );
}