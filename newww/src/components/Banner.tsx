import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface BannerProps {
    title: string;
    image: string;
    subtitle?: string;
}

export function Banner({ title, image, subtitle }: BannerProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

    return (
        <div
            ref={ref}
            className="relative h-36 sm:h-44 md:h-52 w-full overflow-hidden bg-slate-900"
        >
            <motion.div style={{ y, opacity }} className="absolute inset-0">
                <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover scale-105"
                />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-slate-900/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-end">
                <div className="w-full px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90 mb-1">
                            Admin Portal
                        </p>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-white/70 mt-1 max-w-lg hidden sm:block">{subtitle}</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
