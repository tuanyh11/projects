import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Translations {
  [key: string]: string;
}

interface LocalizationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations: Record<string, Translations> = {
  'vi-VN': {
    'home-greeting': 'Xin chào 👋',
    'home-subtitle': 'Hôm nay bạn muốn học gì?',
    'home-stats-lessons': 'Bài Từ vựng',
    'home-stats-stories': 'Truyện',
    'home-stats-accuracy': 'Chính xác',
    'home-suggestions': 'Gợi ý học tập',
    'home-explore-title': 'Khám phá Ngôn Ngữ',
    'home-explore-desc': 'Vào mục Ngôn ngữ để chọn ngôn ngữ và luyện gõ, học từ vựng mỗi ngày.',
    'home-daily-challenge': 'Thử thách hôm nay',
    'home-challenge-title': 'Viết một đoạn văn ngắn',
    'home-challenge-desc': 'Mô tả kỳ nghỉ mơ ước của bạn.',
    'settings-title': 'Cài đặt',
    'settings-language': 'Ngôn ngữ giao diện',
    'settings-language-desc': 'Chọn ngôn ngữ hiển thị cho ứng dụng',
    'settings-account': 'Tài khoản',
    'settings-profile': 'Hồ sơ',
    'settings-notifications': 'Thông báo',
    'settings-about': 'Giới thiệu',
    'settings-logout': 'Đăng xuất',
    'settings-save': 'Lưu thay đổi',
    'lang-vietnamese': 'Tiếng Việt',
    'lang-english': 'English',
    'lang-german': 'Deutsch',
    'common-cancel': 'Hủy',
    'common-save': 'Lưu',
    'common-edit': 'Sửa',
    'common-delete': 'Xóa',
    'common-confirm': 'Xác nhận',
    'common-loading': 'Đang tải...',
  },
  'en-US': {
    'home-greeting': 'Hello 👋',
    'home-subtitle': 'What would you like to learn today?',
    'home-stats-lessons': 'Vocabulary Lessons',
    'home-stats-stories': 'Stories',
    'home-stats-accuracy': 'Accuracy',
    'home-suggestions': 'Learning Suggestions',
    'home-explore-title': 'Explore Languages',
    'home-explore-desc': 'Go to Languages section to choose a language and practice typing, learn vocabulary daily.',
    'home-daily-challenge': "Today's Challenge",
    'home-challenge-title': 'Write a short paragraph',
    'home-challenge-desc': 'Describe your dream vacation.',
    'settings-title': 'Settings',
    'settings-language': 'Interface Language',
    'settings-language-desc': 'Choose your preferred language for the app interface',
    'settings-account': 'Account',
    'settings-profile': 'Profile',
    'settings-notifications': 'Notifications',
    'settings-about': 'About',
    'settings-logout': 'Sign Out',
    'settings-save': 'Save Changes',
    'lang-vietnamese': 'Tiếng Việt',
    'lang-english': 'English',
    'lang-german': 'Deutsch',
    'common-cancel': 'Cancel',
    'common-save': 'Save',
    'common-edit': 'Edit',
    'common-delete': 'Delete',
    'common-confirm': 'Confirm',
    'common-loading': 'Loading...',
  },
  'de-DE': {
    'home-greeting': 'Hallo 👋',
    'home-subtitle': 'Was möchten Sie heute lernen?',
    'home-stats-lessons': 'Vokabellektionen',
    'home-stats-stories': 'Geschichten',
    'home-stats-accuracy': 'Genauigkeit',
    'home-suggestions': 'Lernvorschläge',
    'home-explore-title': 'Sprachen erkunden',
    'home-explore-desc': 'Gehen Sie zum Bereich Sprachen, um eine Sprache auszuwählen und täglich Tippen zu üben und Vokabeln zu lernen.',
    'home-daily-challenge': 'Heutige Herausforderung',
    'home-challenge-title': 'Schreiben Sie einen kurzen Absatz',
    'home-challenge-desc': 'Beschreiben Sie Ihren Traumurlaub.',
    'settings-title': 'Einstellungen',
    'settings-language': 'Oberflächensprache',
    'settings-language-desc': 'Wählen Sie Ihre bevorzugte Sprache für die App-Oberfläche',
    'settings-account': 'Konto',
    'settings-profile': 'Profil',
    'settings-notifications': 'Benachrichtigungen',
    'settings-about': 'Über',
    'settings-logout': 'Abmelden',
    'settings-save': 'Änderungen speichern',
    'lang-vietnamese': 'Tiếng Việt',
    'lang-english': 'English',
    'lang-german': 'Deutsch',
    'common-cancel': 'Abbrechen',
    'common-save': 'Speichern',
    'common-edit': 'Bearbeiten',
    'common-delete': 'Löschen',
    'common-confirm': 'Bestätigen',
    'common-loading': 'Wird geladen...',
  },
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('app_language') || 'vi-VN';
  });

  useEffect(() => {
    localStorage.setItem('app_language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  return (
    <LocalizationContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
