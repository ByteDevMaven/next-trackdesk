"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchSettings, Settings } from '@/lib/server-api';

interface SettingsContextType {
    settings: Settings | null;
    loading: boolean;
    error: Error | null;
    refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
    initialSettings?: Settings | null;
    userAlias: string;
}

export function SettingsProvider({
    children,
    initialSettings = null,
    userAlias
}: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings | null>(initialSettings);
    const [loading, setLoading] = useState<boolean>(!initialSettings);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettingsData = async () => {
        if (!userAlias) return;

        try {
            setLoading(true);
            setError(null);
            const settingsData = await fetchSettings(userAlias);
            setSettings(settingsData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialSettings) {
            fetchSettingsData();
        }
    }, [userAlias]);

    const refetchSettings = async () => {
        await fetchSettingsData();
    };

    const value = {
        settings,
        loading,
        error,
        refetchSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}