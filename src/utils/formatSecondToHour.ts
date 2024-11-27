export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.round(seconds % 60); // Làm tròn giây

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} giờ`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} phút`);
    }
    if (remainingSeconds > 0 || parts.length === 0) { // Hiển thị giây nếu có hoặc nếu không có giờ và phút
        parts.push(`${remainingSeconds} giây`);
    }

    return parts.join(' ');
};