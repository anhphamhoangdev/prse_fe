import {SubCategory} from "./SubCategory";

export class Category {
    id: number;
    name: string;
    orderIndex: number;
    subCategories: SubCategory[];
    createdAt: string;
    updatedAt: string;
    active: boolean;


    constructor(id: number, name: string, orderIndex: number, subCategories: SubCategory[], createdAt: string, updatedAt: string, active: boolean) {
        this.id = id;
        this.name = name;
        this.orderIndex = orderIndex;
        this.subCategories = subCategories;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
    }
}