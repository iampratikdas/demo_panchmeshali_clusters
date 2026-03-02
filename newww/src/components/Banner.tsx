import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface BannerProps {
    title: string;
    image: string;
}

export function Banner({ title, image }: BannerProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden" ref={ref}>
            <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </motion.div>
            <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                <div className="container mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
                    >
                        {title}
                    </motion.h1>
                </div>
            </div>
        </div>
    );
}
