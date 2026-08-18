import PageTransition from '../components/ui/PageTransition';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import PopularCategories from '../components/landing/PopularCategories';
import FeaturedItems from '../components/landing/FeaturedItems';
import WhyBorrowBox from '../components/landing/WhyBorrowBox';
import TrustSection from '../components/landing/TrustSection';
import CommunityStats from '../components/landing/CommunityStats';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';

export default function Landing() {
  return (
    <PageTransition>
      <Hero />
      <HowItWorks />
      <PopularCategories />
      <FeaturedItems />
      <WhyBorrowBox />
      <TrustSection />
      <CommunityStats />
      <Testimonials />
      <FinalCTA />
    </PageTransition>
  );
}
