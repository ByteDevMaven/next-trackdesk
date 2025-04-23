import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');
  return <h1>{t('welcome')}</h1>;
}