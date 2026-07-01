import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Features from "../components/Features";
import CodeShowcase from "../components/CodeShowcase";
import Install from "../components/Install";
import Cta from "../components/Cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Features />
      <CodeShowcase />
      <Install />
      <Cta />
    </main>
  );
}
