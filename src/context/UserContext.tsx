// context/UserContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { UserData } from '../types/users';

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    isLoggedIn: false,
    setIsLoggedIn: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <UserContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);