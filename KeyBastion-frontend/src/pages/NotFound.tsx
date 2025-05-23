import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Add type declaration for gtag
declare global {
    interface Window {
        gtag?: (command: string, action: string, params: object) => void;
    }
}

export default function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Console error (always log)
        console.error(`404 at ${location.pathname}`);

        // 2. Local storage tracking
        const errorEntry = {
            path: location.pathname,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };

        const recentErrors = JSON.parse(localStorage.getItem('recent_404s') || '[]');

        localStorage.setItem(
            'recent_404s',
            JSON.stringify([errorEntry, ...recentErrors.slice(0, 9)]) // Keep last 10
        );

        // 3. API tracking
        if (process.env.NODE_ENV === 'production') {
            api.post('/error-logging', {
                type: '404',
                ...errorEntry
            }).catch(() => { /* fail silently */ });
        }

        // 4. Google Analytics
        if (window.gtag) {
            window.gtag('event', '404', {
                page_path: location.pathname
            });
        }
    }, [location.pathname]);

    return (
        <div className="not-found">
            <h1>404 - Not Found</h1>
            <p>We couldn't find <code>{location.pathname}</code></p>
            <button onClick={() => navigate('/')}>Homepage</button>
        </div>
    );
}
