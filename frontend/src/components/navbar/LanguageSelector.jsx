import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiChevronDown } from "react-icons/fi";
import { LANGUAGES } from "./constants";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-xs font-bold text-gray-700">
        <FiGlobe className="text-xl mb-1" />
        <span className="text-xs font-bold uppercase tracking-wider">{currentLang.code}</span>
        <FiChevronDown className={`text-xs transition-transform duration-500 ${isOpen ? "rotate-180 text-pink-500" : "text-gray-400"}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 z-50 animate-fade-in-up overflow-hidden ring-1 ring-black/5">
          <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100/50 mb-1 flex justify-between items-center">
              <span>{t('navbar.language')}</span><FiGlobe />
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-1">
            {LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${i18n.language === lang.code ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100/80"}`}>
                <span className="flex-1 text-left">{lang.label}</span>
                {i18n.language === lang.code && <span className="bg-white/20 p-1 rounded-full animate-pulse"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;