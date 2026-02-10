import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import Hero from "./components/Hero";
import TrustBadges from "./components/TrustBadges";
import TrustStats from "./components/sections/TrustStats";
import JourneyProgress from "./components/sections/JourneyProgress";
import ServiceCards from "./components/ServiceCards";
import Testimonials from "./components/Testimonials";
import HowItWorks from "./components/HowItWorks";
import Consultation from "./components/Consultation";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <ScrollProgress />
      <Navbar />
      <Hero />
      <TrustStats />
      <JourneyProgress currentStep={1} />
      <ServiceCards />
      <Testimonials />
      <HowItWorks />
      <Consultation />
      <FinalCTA />
      <Footer />
    </main>
  );
}
