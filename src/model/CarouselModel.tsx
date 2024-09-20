

class CarouselModel{

    imageLink?: string;
    imageAlt?: string;

    constructor(imageLink: string, imageAlt: string) {
        this.imageLink = imageLink;
        this.imageAlt = imageAlt;
    }
}

export default CarouselModel;