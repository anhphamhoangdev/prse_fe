import React from "react";
import {Carousel} from "./Carousel";
import CarouselModel from "../model/CarouselModel";

export function Content() {

    const courses = [
        {
            id: 1,
            name: 'Advanced React Development',
            price: 99.99,
            salePrice: 79.99,
            duration: '8 weeks',
            instructor: 'John Doe',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        },
        {
            id: 2,
            name: 'Machine Learning Fundamentals',
            price: 129.99,
            salePrice: 99.99,
            duration: '10 weeks',
            instructor: 'Jane Smith',
            image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80'
        },
        // Add more courses as needed
    ];

    const freeCourses = [
        {
            id: 1,
            name: 'Introduction to HTML & CSS',
            duration: '4 weeks',
            instructor: 'Alice Johnson',
            image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        },
        {
            id: 2,
            name: 'Python for Beginners',
            duration: '6 weeks',
            instructor: 'Bob Williams',
            image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80'
        },
        // Add more free courses as needed
    ];

    const blogPosts = [
        {
            id: 1,
            title: '10 Tips for Successful Online Learning',
            excerpt: 'Maximize your online learning experience with these helpful tips...',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        },
        {
            id: 2,
            title: 'The Future of AI in Education',
            excerpt: 'Explore how artificial intelligence is shaping the future of education...',
            image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        },
        // Add more blog posts as needed
    ];

    const imageAddress = "https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg";

    const images: CarouselModel[] = [
        {
            imageLink: 'https://fireship.io/courses/nextjs/img/featured.png',
            imageAlt: 'Banner 1',
        },
        {
            imageLink: 'https://www.mengutas.com/en/wp-content/uploads/2014/10/IELTS-Course.jpg',
            imageAlt: 'Banner 2',
        }
    ];

    return <>
        <div className="flex-grow">
             {/*Banner Carousel*/}
            <Carousel carousel={images}/>


            {/* Pro Courses */}
            <section className="mb-12">
                <div className="mb-3 flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">Pro Courses</h2>
                    <span
                        className="p-1 bg-blue-300 border-4 border-blue-500 text-white rounded-xl	 font-bold">HOT</span>
                </div>
                {/*<h2 className="text-2xl font-bold mb-6">Pro Courses</h2><span>New</span>*/}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={course.image} alt={course.name} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                                <div className="flex space-x-4 items-center mb-2">
                                    <span className="text-gray-500 line-through">${course.price.toFixed(2)}</span>
                                    <span className="text-green-500 font-bold">${course.salePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{course.duration}</span>
                                    <div className="flex items-center">
                                        <img
                                            src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80`}
                                            alt={course.instructor}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span>{course.instructor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Free Courses */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-3">Free Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {freeCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={course.image} alt={course.name} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{course.duration}</span>
                                    <div className="flex items-center">
                                        <img
                                            src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80`}
                                            alt={course.instructor}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span>{course.instructor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/*Blog*/}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-3">Latest from Our Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogPosts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                                <p className="text-gray-600">{post.excerpt}</p>
                                <a href="#" className="inline-block mt-4 text-blue-500 hover:underline">Read more</a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    </>
}