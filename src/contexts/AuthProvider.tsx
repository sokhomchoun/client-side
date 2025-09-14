import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, TUsers } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const storedAuth = localStorage.getItem('auth');
    const parsedAuth = storedAuth ? JSON.parse(storedAuth)[0] : null;

    const [accessToken, setAccessToken] = useState<string>(parsedAuth?.token || '');
    const [user, setUser] = useState<TUsers | null>(parsedAuth?.user || null);

    const login = (
        token: string,
        auth_id: string,
        userData: TUsers,
        domainList?: string,
        client_id?: string,
        company?: string,
    ) => {
        const authData = [{ token, auth_id, user: userData, domainList, client_id, company }];
        localStorage.setItem('auth', JSON.stringify(authData));
        setAccessToken(token);
        setUser(userData);
        navigate('/'); 
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth');
        setAccessToken('');
        navigate('/auth');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            accessToken, 
            login, 
            logout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};