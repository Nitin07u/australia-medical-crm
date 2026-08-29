import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border py-3 shadow-xs'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#"
          className="font-medium text-lg tracking-tight text-text-primary hover:opacity-85 transition-opacity"
        >
          Lucky Dangle
        </a>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm text-text-secondary">
          <a
            href="#charms"
            onClick={(e) => scrollToSection(e, 'charms')}
            className="hover:text-text-primary transition-colors"
          >
            Choose your charm
          </a>
          <a
            href="#desktop"
            onClick={(e) => scrollToSection(e, 'desktop')}
            className="hover:text-text-primary transition-colors"
          >
            At home
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="hover:text-text-primary transition-colors"
          >
            Make it yours
          </a>
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, 'pricing')}
            className="hover:text-text-primary transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* Primary CTA */}
        <div className="flex items-center space-x-4">
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, 'pricing')}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent text-white text-xs sm:text-sm font-medium hover:bg-accent-hover transition-colors shadow-xs"
          >
            Get Lucky Dangle
          </a>
        </div>
      </div>
    </header>
  );
};
