export class Course {
    id: number;
    instructorId: number;
    title: string;
    shortDescription: string;
    description: string;
    imageUrl: string;
    language: string;
    originalPrice: number;
    discountPrice?: number;
    averageRating: number;
    totalStudents: number;
    totalViews: number;
    isPublish: boolean;
    isHot: boolean;
    isDiscount: boolean;
    createdAt: string;
    updatedAt: string;


    constructor(
        id: number,
        instructorId: number,
        title: string,
        shortDescription: string,
        description: string,
        imageUrl: string,
        language: string,
        originalPrice: number,
        averageRating: number,
        totalStudents: number,
        totalViews: number,
        isPublish: boolean,
        isHot: boolean,
        isDiscount: boolean,
        createdAt: string,
        updatedAt: string,
        discountPrice?: number // Add optional parameter
    ) {
        this.id = id;
        this.instructorId = instructorId;
        this.title = title;
        this.shortDescription = shortDescription;
        this.description = description;
        this.imageUrl = imageUrl;
        this.language = language;
        this.originalPrice = originalPrice;
        this.averageRating = averageRating;
        this.totalStudents = totalStudents;
        this.totalViews = totalViews;
        this.isPublish = isPublish;
        this.isHot = isHot;
        this.isDiscount = isDiscount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.discountPrice = discountPrice; // Set discountPrice
    }
}