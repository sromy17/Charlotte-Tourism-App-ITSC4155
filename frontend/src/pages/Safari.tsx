import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const experiences = [
  {
    title: 'Skyline Social',
    subtitle: 'High-energy day with events and city views',
    image: '/img/cltfans.jpg',
  },
  {
    title: 'Fairway Leisure',
    subtitle: 'Relaxed premium pacing with elegant stops',
    image: '/img/cltgolf.jpg',
  },
  {
    title: 'Market & Culture Route',
    subtitle: 'Design districts, food gems, and local flavor',
    image: '/img/optimist1.jpg',
  },
  {
    title: 'Evening Garden Circuit',
    subtitle: 'Sunset-friendly picks and cozy social spots',
    image: '/img/beergarden.jpg',
  },
];

const Safari: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#020202] px-6 pb-20 text-[#F6F3EB]">
      <div className="mx-auto max-w-6xl">
        <header className="luxury-panel p-7">
          <p className="luxury-label text-[#79bfa0]">Discovery Studio</p>
          <h1 className="mt-3 text-5xl italic">Explore signature Charlotte moods</h1>
          <p className="mt-2 max-w-3xl text-white/70">
            Preview curated vibe directions and launch straight into your custom planner when you’re ready.
          </p>
          <Link
            to="/plan"
            className="mt-6 inline-flex rounded-full border border-[#79bfa0] bg-[#004D2C]/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-[#004D2C]/65"
          >
            Build My Experience
          </Link>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {experiences.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="luxury-panel overflow-hidden"
            >
              <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-5">
                <h2 className="text-3xl italic">{item.title}</h2>
                <p className="mt-2 text-sm text-white/70">{item.subtitle}</p>
              </div>
            </motion.article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Safari;
