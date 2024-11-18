export const formatLocalDateTimeToVN = (isoString: string) => {
    const date = new Date(isoString);

    // Format time: hh:mm:ss
    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // Format date: dd/mm/yy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    const year = date.getFullYear().toString().slice(-2);

    return `${time} ${day}/${month}/${year}`;
};