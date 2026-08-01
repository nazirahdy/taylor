import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        const html = document.documentElement;
        const previousScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                const navbarOffset = 65;
                const y = target.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
                window.scrollTo(0, Math.max(0, y));
                html.style.scrollBehavior = previousScrollBehavior;
                return;
            }
        }

        window.scrollTo(0, 0);
        html.style.scrollBehavior = previousScrollBehavior;
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
