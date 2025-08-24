export const metadata = {
  title: "About | KAMKM Serve",
  description: "Personal story, mission, experience, and skills of Khalil Abd El-Majid (KAMKM Serve)",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">About</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Get to know the person behind KAMKM Serve — the journey, principles, and skills that shape the work.
        </p>
      </header>

      <section aria-labelledby="story" className="prose prose-slate dark:prose-invert">
        <h2 id="story">Personal Story</h2>
        <p>
          I’m Khalil Abd El-Majid, a Sudanese web developer and designer currently based in Egypt. My journey started
          with a strong background in Electrical Engineering at SUST, where I completed three semesters before the war
          disrupted my studies. Despite the challenges of displacement, I leaned into my passion for technology and
          creativity, turning my skills in web development into both a livelihood and a way to help others.
        </p>
        <p>
          I’ve built a path that bridges resilience and innovation — from upgrading my own computers piece by piece, to
          designing and developing websites that empower businesses and educational platforms. Along the way, I’ve grown
          from someone who loved experimenting with tech into a professional who delivers results-driven digital
          solutions.
        </p>

        <h3>Mission</h3>
        <p>
          My mission is to create modern, accessible, and user-focused digital experiences that help businesses,
          organizations, and individuals bring their ideas to life online. I believe technology should feel effortless and
          empowering, not overwhelming.
        </p>
        <p>
          At the same time, I want to use my skills and story to inspire others — especially young people from difficult
          circumstances — to see that creativity, persistence, and learning can open new doors no matter where you start.
        </p>

        <h3>Experience</h3>
        <h4>Web Development &amp; Design</h4>
        <ul>
          <li>Skilled in Webflow, WordPress, Odoo, React, and Tailwind CSS.</li>
          <li>
            Built projects like SoftMedics.sd (an e-learning platform), E-Shop (React + TypeScript e-commerce app), and
            multiple Webflow-based sites for brands and businesses.
          </li>
          <li>Specialize in responsive design, UI/UX improvements, and CMS-powered websites.</li>
        </ul>
        <h4>Odoo Development</h4>
        <ul>
          <li>
            Created custom Odoo modules such as Employee Training Management, integrating features like course scheduling,
            attendance tracking, and certifications.
          </li>
          <li>Experience in building models, forms, list views, and automating workflows.</li>
        </ul>
        <h4>Creative Projects</h4>
        <ul>
          <li>
            Designed animated portfolio components (HeroPreview, Testimonials, ServicesShowcase, CaseStudies) with React,
            Framer Motion, and Lucide icons.
          </li>
          <li>
            Experimented with over-engineered 404 pages featuring confetti, floating particles, parallax, and keyboard
            shortcuts.
          </li>
        </ul>
        <h4>Content Creation</h4>
        <ul>
          <li>YouTuber making videos about sitcoms, tech, and personal experiences.</li>
          <li>
            Planning Twitch streams, gaming content, and educational tech content around upgrades, coding, and
            productivity.
          </li>
        </ul>
      </section>

      <section aria-labelledby="skills" className="mt-12">
        <div className="mb-6">
          <h2 id="skills" className="text-2xl font-bold text-slate-900 dark:text-white">
            Skills Overview
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A snapshot of tools and practices I use.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Web Development &amp; Design</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-300">
              <li>Front-End: HTML, CSS, JavaScript, TypeScript, React, Tailwind CSS, Framer Motion, Lucide Icons</li>
              <li>Web Builders &amp; CMS: Webflow, WordPress, Odoo (custom modules, ERP integration)</li>
              <li>UI/UX: Responsive design, interactive interfaces, accessibility, SEO optimization</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">E‑Commerce &amp; Business Tools</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-300">
              <li>E‑Shop Development: React + TypeScript + Tailwind</li>
              <li>CMS &amp; Dynamic Content: Webflow CMS, WordPress CMS, Odoo CMS modules</li>
              <li>ERP Systems: Odoo customizations (training management, HR modules, data migration)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Software Development Practices</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-300">
              <li>Git/GitHub (version control, branching, collaboration)</li>
              <li>CI/CD workflows (GitHub Actions basics)</li>
              <li>pnpm &amp; package management</li>
              <li>API integration &amp; reverse proxy configurations (Apache)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Creative &amp; Communication</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-300">
              <li>Portfolio animations, motion design, interactive landing pages (parallax, particles, confetti)</li>
              <li>Content: YouTube videos on sitcoms/tech; Twitch streaming plans</li>
              <li>Writing proposals, client communication, and documentation</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <h3 className="text-lg font-semibold">Technical Foundations</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-700 dark:text-slate-300">
              <li>Electrical Engineering: probability, statistics, circuit theory, differential equations</li>
              <li>Hands-on hardware: RAM/SSD upgrades, troubleshooting and optimization</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-semibold">Let’s build something great</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Have a project in mind? I’d love to hear about it.</p>
        </div>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Get in touch
        </a>
      </section>
    </main>
  );
}
