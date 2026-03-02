import { useState } from "react";

const SideCarousel = () => {
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const [fade, setFade] = useState("opacity-100");
    const [isAnimating, setIsAnimating] = useState(false);

    const testimonials = [
        {
            quote: "Untitled Labs were a breeze to work alongside, we can't recommend them enough. We launched 6 months earlier than expected and are growing 30% MoM.",
            author: "Amélie Laurent",
            role: "Founder, Sisyphus",
            image: "/writer_image.jpg"
        },
        {
            quote: "Working with Untitled Labs transformed our business. Their expertise and dedication helped us achieve remarkable results.",
            author: "John Smith",
            role: "CEO, TechCorp",
            image: "/writer_image1.jpg"
        },
        {
            quote: "The team's innovative approach and attention to detail exceeded our expectations. Highly recommended!",
            author: "Sarah Johnson",
            role: "CTO, Innovation Inc",
            image: "/writer_image2.jpg"
        }
    ];

    const animateTestimonial = (newIndex: number) => {
        setIsAnimating(true);
        // Trigger fade-out
        setFade("opacity-0");
        // After fade-out duration, update the index and trigger fade-in
        setTimeout(() => {
            setCurrentTestimonialIndex(newIndex);
            setFade("opacity-100");
            // After fade-in is complete, allow new animations
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }, 300);
    };

    const handlePrevTestimonial = () => {
        if (isAnimating) return;
        const newIndex = currentTestimonialIndex === 0 ? testimonials.length - 1 : currentTestimonialIndex - 1;
        animateTestimonial(newIndex);
    };

    const handleNextTestimonial = () => {
        if (isAnimating) return;
        const newIndex = currentTestimonialIndex === testimonials.length - 1 ? 0 : currentTestimonialIndex + 1;
        animateTestimonial(newIndex);
    };

    return (
        <div className="hidden lg:flex m-4 p-4 rounded-tl-[2rem] rounded-br-[2rem] shadow-[0px_5px_15px_rgba(0,0,0,0.35)] bg-cover md:p-8 justify-start items-end relative"  style={{ backgroundImage: `url(${testimonials[currentTestimonialIndex].image})` }}>
            <div className="max-w-[640px] mx-auto p-4 md:p-8 relative overflow-hidden rounded-lg bg-white shadow-lg">
                <div className={`transition-opacity duration-300 ease-in-out ${fade}`}>
                    <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed mb-8 text-gray-800">
                        "{testimonials[currentTestimonialIndex].quote}"
                    </blockquote>
                    <div className="mb-8">
                        <p className="font-bold mb-1 text-gray-900">
                            {testimonials[currentTestimonialIndex].author}
                        </p>
                        <p className="text-gray-500">
                            {testimonials[currentTestimonialIndex].role}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevTestimonial}
                        aria-label="Previous testimonial"
                        className="w-10 h-10 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shadow hover:shadow-lg"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleNextTestimonial}
                        aria-label="Next testimonial"
                        className="w-10 h-10 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shadow hover:shadow-lg"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SideCarousel;