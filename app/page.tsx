import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import WhyModox from "@/components/WhyModox";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import Reviews from "@/components/Reviews";
import Stats from "@/components/Stats";
export default function Home() {
  return (
  <>
    <Navbar />
    <Hero />
    <Stats />
    <Products />
    <WhyModox />
    <Reviews />
    <FAQ />
    <Footer />
  </>
);
}