export class SubCategory{
    id: number;
    name: string;
    orderIndex: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
    active: boolean;


    constructor(id: number, name: string, orderIndex: number, categoryId: number, createdAt: string, updatedAt: string, active: boolean) {
        this.id = id;
        this.name = name;
        this.orderIndex = orderIndex;
        this.categoryId = categoryId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
    }
}