import { lazy, Suspense, useState, useCallback } from "react";
import Hero from "../components/sections/Hero";
import AIChatOrb from "../components/chatbot/AIChatOrb";
import AIChatModal from "../components/chatbot/AIChatModal";

// Below-fold sections loaded only when needed — reduces initial JS parse/eval
const Challenges = lazy(() => import("../components/sections/Challenges"));
const Experience = lazy(() => import("../components/sections/Experience"));
const Projects = lazy(() => import("../components/sections/Projects"));
const Skills = lazy(() => import("../components/sections/Skills"));
const Articles = lazy(() => import("../components/sections/Articles"));
const Gallery = lazy(() => import("../components/sections/Gallery"));
const Contact = lazy(() => import("../components/sections/Contact"));

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);

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

      <AIChatOrb isOpen={chatOpen} onOpen={openChat} />
      <AIChatModal isOpen={chatOpen} onClose={closeChat} />
    </main>
  );
}
