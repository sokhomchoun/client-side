export const Currency = () => {
    const raw = localStorage.getItem('currency_preference');
    if (!raw) {
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        const currency = parsed.currency;
        const rate = parsed.rate;

        return { currency, rate }
        
    } catch (error) {
        console.error("Failed to parse currency preference", error);
        return;
    }
};
