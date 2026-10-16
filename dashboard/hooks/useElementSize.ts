import { RefObject, useEffect, useState } from 'react';

export interface Size {
    width: number;
    height: number;
}

export const useElementSize = (ref: RefObject<HTMLElement | SVGElement | null>): Size => {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () => {
            const rect = element.getBoundingClientRect();
            setSize((prev) => (prev.width === rect.width && prev.height === rect.height ? prev : { width: rect.width, height: rect.height }));
        };
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(element);

        return () => observer.disconnect();
    }, [ref]);

    return size;
};
