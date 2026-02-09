import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBadges from "./components/TrustBadges";
import ServiceCards from "./components/ServiceCards";
import AboutUs from "./components/AboutUs";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";
import HowItWorks from "./components/HowItWorks";
import PhoneCallAway from "./components/PhoneCallAway";
import Services from "./components/Services";
import ExtendedSupport from "./components/ExtendedSupport";
import Consultation from "./components/Consultation";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <TrustBadges />
      <ServiceCards />
      <AboutUs />
      <WhyChooseUs />
      <Testimonials />
      <HowItWorks />
      <PhoneCallAway />
      <Services />
      <ExtendedSupport />
      <Consultation />
      <FinalCTA />
      <Footer />
    </main>
  );
}
