import Hero from "../components/sections/Hero";
import Challenges from "../components/sections/Challenges";
import Experience from "../components/sections/Experience";
import Projects from "../components/sections/Projects";
import Skills from "../components/sections/Skills";
import Articles from "../components/sections/Articles";
import Gallery from "../components/sections/Gallery";
import Contact from "../components/sections/Contact";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <Challenges />
      <Experience />
      <Projects />
      <Skills />
      <Articles />
      <Gallery />
      {/* <About /> */}
      <Contact />
    </main>
  );
}
