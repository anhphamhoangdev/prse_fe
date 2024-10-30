export class Banner {
    id: number;
    imageUrl: string;
    url: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;

    constructor(
        id: number,
        imageUrl: string,
        url: string,
        isActive: boolean,
        orderIndex: number,
        createdAt: string,
        updatedAt: string
    ) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.url = url;
        this.isActive = isActive;
        this.orderIndex = orderIndex;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}