import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const highlights = [
  {
    title: 'Curated City Moments',
    description: 'From skyline brunches to evening music lounges, your day feels effortless and elevated.',
    image: '/img/optimist1.jpg',
  },
  {
    title: 'Premium Comfort Routing',
    description: 'Smart timing and smooth transitions so you spend less time planning and more time enjoying.',
    image: '/img/cltgolf.jpg',
  },
  {
    title: 'Live Local Energy',
    description: 'Discover what’s happening right now in Charlotte with a polished, personalized itinerary.',
    image: '/img/cltfans.jpg',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Share your style',
    description: 'Choose the atmosphere you’re in the mood for, from social and lively to relaxed and elegant.',
  },
  {
    step: '02',
    title: 'Set your comfort level',
    description: 'Pick your date, preferred pace, and budget range so every recommendation feels right for you.',
  },
  {
    step: '03',
    title: 'Enjoy your curated day',
    description: 'Get a live itinerary with smooth transitions, optional discoveries, and a beautiful map-driven experience.',
  },
];

const signatureExperiences = [
  {
    title: 'Game Day & Skyline Nights',
    subtitle: 'High-energy social flow',
    image: '/img/cltfans.jpg',
  },
  {
    title: 'Uptown Leisure Route',
    subtitle: 'Calm luxury pacing',
    image: '/img/cltgolf.jpg',
  },
  {
    title: 'Food & Design District',
    subtitle: 'Local flavor and culture',
    image: '/img/beergarden.jpg',
  },
];

const testimonials = [
  {
    quote: 'It felt like having a private concierge in my pocket—clean, fast, and beautifully designed.',
    author: 'Alex M. · Weekend Traveler',
  },
  {
    quote: 'The itinerary flow was smooth and surprisingly thoughtful. We spent more time enjoying and less time deciding.',
    author: 'Priya K. · Charlotte Visitor',
  },
  {
    quote: 'Modern, friendly, and premium without feeling overwhelming. Exactly what trip planning should feel like.',
    author: 'Jordan T. · First-Time Guest',
  },
];

const faqs = [
  {
    q: 'How long does planning take?',
    a: 'Usually under a minute. Pick your preferences and we generate a complete day flow instantly.',
  },
  {
    q: 'Can I adjust the plan after it generates?',
    a: 'Yes. You can swap between active schedule items and discovery suggestions at any time.',
  },
  {
    q: 'Is this only for tourists?',
    a: 'Not at all. Locals use it to find fresh ideas for weekends, date nights, and group plans too.',
  },
];

const Landing: React.FC = () => {
  return (
    <div className="bg-[#020202] text-[#F6F3EB]">
      <section className="relative min-h-screen overflow-hidden px-6 pb-20 pt-32">
        <img
          src="/img/northend.jpg"
          alt="Charlotte city atmosphere"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-[#020202]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="luxury-label text-[#79bfa0]"
          >
            Charlotte Luxury Travel Companion
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="mt-4 max-w-4xl text-5xl italic leading-tight sm:text-7xl"
          >
            Plan a day in Charlotte that feels refined, modern, and uniquely yours.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45 }}
            className="mt-5 max-w-2xl text-base text-white/75"
          >
            Start with your style, let our engine build your itinerary, and glide through the city with a beautifully designed live plan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/plan"
              className="rounded-full border border-[#79bfa0] bg-[#004D2C]/45 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] hover:bg-[#004D2C]/65"
            >
              Get Started
            </Link>
            <a
              href="#about"
              className="rounded-full border border-white/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/85 hover:border-[#d6c08e]/50"
            >
              About This Experience
            </a>
            <a
              href="#how"
              className="rounded-full border border-white/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/85 hover:border-[#d6c08e]/50"
            >
              How It Works
            </a>
          </motion.div>
        </div>
      </section>

      <section id="about" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="luxury-label text-[#79bfa0]">About CLTourism</p>
            <h2 className="mt-3 text-4xl italic">A friendly high-end planning experience</h2>
            <p className="mt-3 max-w-3xl text-white/70">
              Built for travelers who want premium recommendations without the planning stress. It’s modern, warm, and designed to feel as good as the day itself.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="luxury-panel overflow-hidden"
              >
                <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-2xl italic">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="luxury-label text-[#79bfa0]">How It Works</p>
            <h2 className="mt-3 text-4xl italic">A simple flow with a premium feel</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="luxury-panel p-6"
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#79bfa0]">{item.step}</p>
                <h3 className="mt-3 text-2xl italic">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="experiences" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="luxury-label text-[#79bfa0]">Signature Experiences</p>
              <h2 className="mt-3 text-4xl italic">Designed for every kind of day</h2>
            </div>
            <Link
              to="/plan"
              className="rounded-full border border-[#79bfa0]/70 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-[#004D2C]/35"
            >
              Try It Live
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {signatureExperiences.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="luxury-panel overflow-hidden"
              >
                <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-2xl italic">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.subtitle}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="luxury-label text-[#79bfa0]">Why Travelers Love It</p>
            <h2 className="mt-3 text-4xl italic">Made to feel effortless</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.blockquote
                key={item.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="luxury-panel p-6"
              >
                <p className="text-base text-white/80">“{item.quote}”</p>
                <footer className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#d6c08e]">{item.author}</footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="luxury-label text-[#79bfa0]">FAQ</p>
            <h2 className="mt-3 text-4xl italic">Quick answers</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="luxury-panel p-5"
              >
                <h3 className="text-2xl italic">{item.q}</h3>
                <p className="mt-2 text-sm text-white/70">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="luxury-panel flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="luxury-label">Ready when you are</p>
              <h3 className="mt-2 text-3xl italic">Build your personalized Charlotte day in under a minute.</h3>
            </div>
            <Link
              to="/plan"
              className="rounded-full border border-[#d6c08e]/60 bg-[#d6c08e]/15 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F6F3EB] hover:bg-[#d6c08e]/25"
            >
              Open Planner
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#79bfa0]">CLTourism</p>
            <p className="mt-1 text-sm text-white/60">Charlotte itineraries with style, comfort, and real-time local energy.</p>
          </div>
          <div className="flex gap-4 text-sm text-white/65">
            <a href="#about" className="hover:text-[#d6c08e]">About</a>
            <a href="#how" className="hover:text-[#d6c08e]">How It Works</a>
            <a href="#faq" className="hover:text-[#d6c08e]">FAQ</a>
            <Link to="/plan" className="hover:text-[#d6c08e]">Planner</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
