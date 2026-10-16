import { RefObject, useEffect } from 'react';

export const useClickOutside = (refs: Array<RefObject<HTMLElement | null>>, onOutside: () => void, active = true): void => {
    useEffect(() => {
        if (!active) return;

        const handler = (event: MouseEvent) => {
            const target = event.target as Node;
            if (refs.some((ref) => ref.current && ref.current.contains(target))) return;
            onOutside();
        };
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onOutside();

        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('keydown', onKey);
        };
    }, [active, onOutside]);
};
