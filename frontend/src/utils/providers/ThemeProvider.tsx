import { useEffect, createContext, useState } from "react";

interface ThemeContextType {
	theme: string;
	setTheme: (theme: string) => void;
	toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
	theme: "dark",
	setTheme: () => { },
	toggleTheme: () => { },
});

function getTheme() {
    const theme = localStorage.getItem("theme");
    if (!theme) {
        localStorage.setItem("theme", "dark");
        return "dark";
    } else {
        return theme;
    }
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getTheme);

    function toggleTheme() {
        if (theme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    };

    useEffect(() => {
        const refreshTheme = () => {
            localStorage.setItem("theme", theme);
        };

        refreshTheme();
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
