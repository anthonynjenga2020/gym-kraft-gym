import Hero from '../sections/Hero.jsx'
import Stats from '../sections/Stats.jsx'
import About from '../sections/About.jsx'
import Classes from '../sections/Classes.jsx'
import Schedule from '../sections/Schedule.jsx'
import Transformation from '../sections/Transformation.jsx'
import Programs from '../sections/Programs.jsx'
import Trainers from '../sections/Trainers.jsx'
import Gallery from '../sections/Gallery.jsx'
import Testimonials from '../sections/Testimonials.jsx'
import Pricing from '../sections/Pricing.jsx'
import CTA from '../sections/CTA.jsx'
import FreeTrialForm from '../sections/FreeTrialForm.jsx'
import FAQ from '../sections/FAQ.jsx'
import Contact from '../sections/Contact.jsx'

export default function HomePage({ config }) {
  return (
    <main>
      <Hero config={config} />
      <Stats config={config} />
      <About config={config} />
      <Classes config={config} />
      <Schedule config={config} />
      <Transformation config={config} />
      <Programs config={config} />
      <Trainers config={config} />
      <Gallery config={config} />
      <Testimonials config={config} />
      <Pricing config={config} />
      <CTA config={config} />
      <FreeTrialForm config={config} />
      <FAQ config={config} />
      <Contact config={config} />
    </main>
  )
}
