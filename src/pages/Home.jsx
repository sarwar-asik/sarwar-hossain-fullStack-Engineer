import Hero       from '../components/sections/Hero'
import About      from '../components/sections/About'
import Experience from '../components/sections/Experience'
import Projects   from '../components/sections/Projects'
import Challenges from '../components/sections/Challenges'
import Skills     from '../components/sections/Skills'
import Gallery    from '../components/sections/Gallery'
import Articles   from '../components/sections/Articles'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Challenges />
      <Skills />
      <Gallery />
      <Articles />
    </main>
  )
}
