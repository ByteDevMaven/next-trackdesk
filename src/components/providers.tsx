import React, { ReactNode } from 'react';
import { SettingsProvider } from '@/lib/settings-context';
import { getUser } from '@/lib/server-api';

interface ProvidersProps {
    children: ReactNode;
    userAlias?: string;
    initialSettings?: any;
}

export async function Providers({
    children,
    initialSettings,
    userAlias: propUserAlias,
}: ProvidersProps) {
    // If userAlias wasn't provided, get it from the server
    let userAlias = propUserAlias;

    if (!userAlias) {
        try {
            const user = await getUser();
            userAlias = user?.alias || '';
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }

    if (!userAlias) {
        return <>{children}</>; // Render without settings provider if no user
    }

    return (
        <SettingsProvider userAlias={userAlias} initialSettings={initialSettings}>
            {children}
        </SettingsProvider>
    );
}