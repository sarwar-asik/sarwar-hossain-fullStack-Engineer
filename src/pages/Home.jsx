import { lazy, Suspense } from "react";
import Hero from "../components/sections/Hero";

// Below-fold sections loaded only when needed — reduces initial JS parse/eval
const Challenges = lazy(() => import("../components/sections/Challenges"));
const Experience  = lazy(() => import("../components/sections/Experience"));
const Projects    = lazy(() => import("../components/sections/Projects"));
const Skills      = lazy(() => import("../components/sections/Skills"));
const Articles    = lazy(() => import("../components/sections/Articles"));
const Gallery     = lazy(() => import("../components/sections/Gallery"));
const Contact     = lazy(() => import("../components/sections/Contact"));

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <Suspense fallback={null}>
        <Challenges />
        <Experience />
        <Projects />
        <Skills />
        <Articles />
        <Gallery />
        <Contact />
      </Suspense>
    </main>
  );
}
