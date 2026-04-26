import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import './SettingsPage.css';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const availableLanguages: Language[] = [
  { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
];

export const SettingsPage: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useLocalization();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update language preference on server
      // const userId = getCurrentUserId(); // Get from auth context
      // await fetch(`/api/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ preferred_language: selectedLanguage }),
      // });

      // Update local state
      setLanguage(selectedLanguage);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">{t('settings-title')}</h1>

        {/* Language Settings Section */}
        <section className="settings-section">
          <h2 className="section-title">{t('settings-language')}</h2>
          <p className="section-description">{t('settings-language-desc')}</p>

          <div className="language-options">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="language-flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
                {selectedLanguage === lang.code && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Account Settings Section */}
        <section className="settings-section">
          <h2 className="section-title">{t('settings-account')}</h2>
          <div className="settings-list">
            <button className="settings-item">
              <span className="item-icon">👤</span>
              <span className="item-label">{t('settings-profile')}</span>
              <span className="item-arrow">›</span>
            </button>
            <button className="settings-item">
              <span className="item-icon">🔔</span>
              <span className="item-label">{t('settings-notifications')}</span>
              <span className="item-arrow">›</span>
            </button>
            <button className="settings-item">
              <span className="item-icon">ℹ️</span>
              <span className="item-label">{t('settings-about')}</span>
              <span className="item-arrow">›</span>
            </button>
          </div>
        </section>

        {/* Save Button */}
        {hasChanges && (
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('common-loading') : t('settings-save')}
          </button>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="success-message">
            ✓ {t('settings-save')} successfully!
          </div>
        )}

        {/* Logout Button */}
        <button className="logout-button">
          <span className="logout-icon">🚪</span>
          {t('settings-logout')}
        </button>
      </div>
    </div>
  );
};
