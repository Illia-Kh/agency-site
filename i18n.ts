import { getRequestConfig } from 'next-intl/server';
import { loadAllMessages } from './src/i18n/message-loader';

export default getRequestConfig(async ({ locale }) => {
  const { locale: normalizedLocale, messages } = await loadAllMessages(locale);
  return {
    locale: normalizedLocale,
    messages,
  };
});
