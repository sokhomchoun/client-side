export const Authorizations = (token: string) => {
    return {
        Authorization: `Bearer ${token}`
    };
};