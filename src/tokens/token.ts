export const ProvideToken = () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    try {
        const parsed = JSON.parse(auth);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].token;
        }
        return null;
    } catch (err) {
        console.error('Invalid Auth.', err);
        return null;
    };
}

export const AuthId = () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    try {
        const parsed = JSON.parse(auth);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].auth_id;
        }
        return null;
    } catch (err) {
        console.error('Invalid Auth.', err);
    }
};

export const User = () => {
    const user = localStorage.getItem('auth');
    if (!user) return null;
    try {
        const parsedUser = JSON.parse(user);
        const userObj = Array.isArray(parsedUser) ? parsedUser[0] : parsedUser;
        const user_name = userObj?.user?.name || null;
        const role = userObj?.user?.role || null;
        const email = userObj?.user?.email || null;
        const domain = userObj?.user?.domainList || null;
        const client_id = userObj?.user?.client_id || null;

        return { user_name, role, email, domain, client_id };
        
    } catch (err) {
        console.error("Error parsing user from localStorage", err);
        return null;
    }
};
