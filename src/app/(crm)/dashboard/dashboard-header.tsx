import { useTranslations } from "next-intl";

export function DashboardHeader({ user }: { user: { name: string } }) {
    const t = useTranslations("DashboardPage");

    return (
        <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p>{t("welcome", { name: user.name })}</p>
        </header>
    );
}