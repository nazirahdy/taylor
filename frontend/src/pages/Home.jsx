import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import GallerySection from '../components/GallerySection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';

const Home = () => {
    return (
        <div className="bg-white text-text-primary font-body overflow-x-hidden">
            {/* 1. HERO SECTION (Beranda) */}
            <HeroSection />

             {/* 2. ABOUT SECTION (Tentang) */}
            <AboutSection />

            {/* 3. SERVICES SECTION (Layanan) */}
            <ServicesSection />

            {/* 4. GALLERY SECTION (Galeri) */}
            <GallerySection />

            {/* 5. FAQ SECTION */}
            <FAQSection />

            {/* 6. CONTACT SECTION (Kontak) */}
            <ContactSection />
        </div>
    );
};

export default Home;
