import React, { createContext,useContext, useEffect, useState, ReactNode } from "react";

type Currency = "USD" | "KHR" | string;
interface CurrencyPreference {
    currency: Currency;
    rate: number;
}

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrencyState] = useState<Currency>("USD");
    const [exchangeRate, setExchangeRate] = useState<number>(1); // Default: USD

    const rateMap: Record<string, number> = {
        USD: 4000,
        KHR: 4000,
    };

    // Load currency preference from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("currency_preference");
        if (stored) {
            try {
                const parsed: CurrencyPreference = JSON.parse(stored);
                if (parsed.currency) setCurrencyState(parsed.currency);
                if (parsed.rate) setExchangeRate(parsed.rate);
            } catch (e) {
                console.error("Invalid currency_preference in localStorage");
            }
        }
    }, []);

    useEffect(() => {
        const rate = rateMap[currency] ?? 1;
        setExchangeRate(rate);
        const preference: CurrencyPreference = { currency, rate };
        localStorage.setItem("currency_preference", JSON.stringify(preference));
    }, [currency]);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
