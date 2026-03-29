import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center bg-[#1e2336]/80 backdrop-blur-md border border-slate-700/50 rounded-full px-3 py-1.5 shadow-lg">
            <Languages className="w-4 h-4 text-slate-300 mr-2" />
            <select
                value={i18n.resolvedLanguage}
                onChange={handleLanguageChange}
                className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer appearance-none font-sans"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
                <option value="en" className="bg-[#1e2336] text-slate-200">{t('languageSelector.english')}</option>
                <option value="hi" className="bg-[#1e2336] text-slate-200">{t('languageSelector.hindi')}</option>
                <option value="bn" className="bg-[#1e2336] text-slate-200">{t('languageSelector.bangla')}</option>
            </select>
        </div>
    );
};
