import { useState, useEffect, useRef, RefObject } from 'react';

interface Options extends IntersectionObserverInit {
    triggerOnce?: boolean;
}

export const useInView = (options?: Options): [RefObject<HTMLDivElement>, boolean] => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (options?.triggerOnce) {
                        observer.unobserve(element);
                    }
                } else {
                    if (!options?.triggerOnce) {
                         setIsInView(false);
                    }
                }
            },
            options
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, options?.threshold, options?.root, options?.rootMargin, options?.triggerOnce]);

    return [ref, isInView];
};