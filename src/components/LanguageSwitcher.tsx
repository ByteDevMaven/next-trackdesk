'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const localeLabels = {
    en: 'English',
    es: 'Español',
};

const locales = Object.keys(localeLabels);

export default function LanguageSwitcher() {
    const router = useRouter();
    const currentLocale = useLocale();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;

        // Store selected locale in cookie
        document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`; // 1 year

        // Refresh the page to apply new locale
        router.refresh();
    };

    return (
        <select
            title='&#127760;'
            value={currentLocale}
            onChange={handleChange}
            className="border rounded px-2 py-1 bg-background text-foreground"
        >
            {locales.map((locale) => (
                <option key={locale} value={locale}>
                    {localeLabels[locale]}
                </option>
            ))}
        </select>
    );
}
