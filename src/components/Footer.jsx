import { useI18n } from '../i18n/useI18n.js';

export default function Footer() {
  const { t } = useI18n();

  return <footer className="footer">{t.footer}</footer>;
}
