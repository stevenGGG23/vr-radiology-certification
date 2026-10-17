import { Hero } from "@/components/marketing/hero";
import { TopicMarquee } from "@/components/marketing/topic-marquee";
import {
  AuthorCard, BundleBand, CertificateBand, FaqShort, FeaturedCourses, HowItWorks, Specialties, TeamsBand, TrustStrip, VanderbiltSection,
} from "@/components/marketing/home-sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TopicMarquee />
      <TrustStrip />
      <Specialties />
      <FeaturedCourses />
      <BundleBand />
      <VanderbiltSection />
      <HowItWorks />
      <CertificateBand />
      <TeamsBand />
      <AuthorCard />
      <FaqShort />
    </>
  );
}
