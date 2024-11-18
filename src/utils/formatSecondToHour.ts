export const formatDuration = (seconds: number ) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        if (minutes > 0) {
            return `${hours} giờ ${minutes} phút`;
        }
        return `${hours} giờ`;
    }
    return `${minutes} phút`;
};