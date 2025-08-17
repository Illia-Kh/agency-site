'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm({ onSubmit, className = '' }) {
  const t = useTranslations('common');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('contact.nameRequired');
    }
    if (!formData.contact.trim()) {
      newErrors.contact = t('contact.contactRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      // Form submission logic would go here
      if (onSubmit) onSubmit(formData);
      // Reset form
      setFormData({ name: '', contact: '', message: '' });
    }
  };

  return (
    <form
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 ${className}`}
      onSubmit={handleSubmit}
    >
      <label className="text-sm font-medium text-[var(--text)]">
        {t('contact.title')}
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60 ${
              errors.name ? 'ring-[var(--error)]' : ''
            }`}
            placeholder={t('contact.name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-[var(--error)]">
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <input
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            className={`rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60 ${
              errors.contact ? 'ring-[var(--error)]' : ''
            }`}
            placeholder={t('contact.contact')}
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? 'contact-error' : undefined}
          />
          {errors.contact && (
            <p id="contact-error" className="text-xs text-[var(--error)]">
              {errors.contact}
            </p>
          )}
        </div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          className="sm:col-span-2 rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60"
          rows={3}
          placeholder={t('contact.message')}
        />
      </div>
      <button
        type="submit"
        className="mt-3 w-full rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--white)] hover:bg-[var(--primary-hover)] transition"
      >
        {t('contact.submit')}
      </button>
    </form>
  );
}
