import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import GallerySection from '../components/GallerySection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import StatsSection from '../components/StatsSection';

const Home = () => {
    return (
        <div className="bg-white text-text-primary font-body overflow-x-hidden">
            {/* 1. HERO SECTION (Beranda) */}
            <HeroSection />

            {/* 2. SERVICES SECTION (Layanan) */}
            <ServicesSection />

            {/* 3. GALLERY SECTION (Galeri) */}
            <GallerySection />

            {/* 4. ABOUT SECTION (Tentang) */}
            <AboutSection />

            {/* 5. STATS SECTION */}
            <StatsSection />

            {/* 6. FAQ SECTION */}
            <FAQSection />

            {/* 7. CONTACT SECTION (Kontak) */}
            <ContactSection />
        </div>
    );
};

export default Home;
