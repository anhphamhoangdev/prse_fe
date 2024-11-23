// Tạo một custom hook để handle việc prevent inspect
import {useEffect} from "react";

export const usePreventInspect = () => {
    useEffect(() => {
        const preventInspect = (e: KeyboardEvent) => {
            // Prevent F12
            if(e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+I (Chrome)
            if(e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+J (Chrome)
            if(e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+C (Chrome)
            if(e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+U (View Source)
            if(e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        };

        const preventRightClick = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const preventDevTools = () => {
            // Check if DevTools is open
            const devtools = /./;
            devtools.toString = function() {
                preventDevTools();
                return 'Dev Tools disabled';
            }
        };

        // Add event listeners
        document.addEventListener('keydown', preventInspect);
        document.addEventListener('contextmenu', preventRightClick);
        window.addEventListener('devtoolschange', preventDevTools);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', preventInspect);
            document.removeEventListener('contextmenu', preventRightClick);
            window.removeEventListener('devtoolschange', preventDevTools);
        };
    }, []);
};

