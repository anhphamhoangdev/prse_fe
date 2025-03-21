// src/components/ThemeSwitcher.tsx
import React from 'react';
import {useTheme} from "../../context/ThemeContext";

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-2">
            <span>Theme:</span>
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            >
                <option value="light">sang</option>
                <option value="dark">toi</option>
                <option value="system">he thong</option>
            </select>
        </div>
    );
};

export default ThemeSwitcher;