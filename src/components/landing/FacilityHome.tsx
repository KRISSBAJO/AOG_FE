"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, ChevronDown, MapPin, Menu, Phone, ShieldCheck, Sparkles, ParkingCircle, CalendarDays, Wrench, X } from "lucide-react";
import s from "./FacilityHome.module.css";
import { Blueprint, DrawCheck, EASE, HeroContent, HeroMedia, Lines, MotionLink, Reticle, ScrollProgress, fromRight, group, grow, inView, label, lineGroup, rail, rise, settle, slideIn, useScrolled, wipeRight, wipeUp } from "./FacilityMotion";

const services = [
  { name: "Commercial cleaning", icon: Sparkles, description: "A cleaner, healthier space. Daily janitorial care, deep cleaning, and specialized sanitation for your facility." },
  { name: "Security staffing", icon: ShieldCheck, description: "Keep people and property protected with guard coverage, patrol coordination, and incident reporting." },
  { name: "Parking management", icon: ParkingCircle, description: "A better experience from the moment guests arrive. Attendants, access control, and parking operations." },
  { name: "Event setup", icon: CalendarDays, description: "Make every gathering run smoothly with coordinated setup, seating, teardown, and venue turnover." },
  { name: "Facility support", icon: Wrench, description: "Keep the everyday details under control with maintenance, handyman, and grounds support." },
];
const industries = [
  { title: "Commercial offices", text: "Spaces that work as hard as your team.", image: "/Image_one.png" },
  { title: "Hospitality & venues", text: "A welcoming experience, down to the details.", image: "/Image_two.png" },
  { title: "Retail & mixed-use", text: "Clean, cared-for spaces for every visitor.", image: "/Image_five.png" },
];
const differences = ["A coordinated plan across five service lines", "Scheduling that fits your operations", "Quality checks and clear communication", "Online requests and service status tracking"];
const navigation = [{ label: "Industries we serve", href: "#industries" }, { label: "Our services", href: "#services" }, { label: "Why AOG", href: "#why-aog" }, { label: "Nashville", href: "#nashville" }];

export default function FacilityHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  return (
    <div className={s.site}>
      <a className={s.skip} href="#main">Skip to content</a>
      <div className={s.utility}><div className={s.container}><a href="#nashville"><MapPin size={13} /> Nashville, Tennessee <ChevronDown size={12} /></a><div><Link href="/booking-status">Track your service</Link><span aria-hidden="true">|</span><Link href="/sign-in">Client portal <ArrowRight size={12} /></Link></div></div></div>

      <header className={`${s.header} ${scrolled ? s.headerScrolled : ""}`}>
        <div className={`${s.container} ${s.navbar}`}>
          <Link href="/" className={s.brand} aria-label="AOG Services home"><Image src="/AOG-mark.png" alt="AOG" width={110} height={47} preload /><span>SERVICES<small>FACILITY SOLUTIONS</small></span></Link>
          <nav className={s.desktopNav} aria-label="Main navigation">{navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}<Link href="/contact">Contact</Link></nav>
          <a className={s.phone} href="tel:+14143191622"><Phone size={15} /> (414) 319-1622</a>
          <button className={s.menuButton} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav id="mobile-navigation" className={s.mobileNav} aria-label="Mobile navigation" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: EASE }}>
              {navigation.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}<Link href="/contact">Request service</Link><Link href="/sign-in">Client portal</Link>
            </motion.nav>
          )}
        </AnimatePresence>
        <ScrollProgress />
      </header>

      <main id="main">
        <section className={s.hero}>
          <HeroMedia>
            <Image className={s.heroImage} src="/nashville-hero.png" alt="Generated photographic illustration of the Nashville skyline along the Cumberland River" fill preload sizes="100vw" />
          </HeroMedia>
          <Blueprint />
          <HeroContent className={`${s.container} ${s.heroContent}`}>
            <motion.p className={s.heroEyebrow} variants={rise}><motion.span variants={grow} /> YOUR FACILITY. OUR FOCUS.</motion.p>
            <motion.h1 variants={lineGroup}><Lines lines={["The right partner.", "A better facility."]} /></motion.h1>
            <motion.p className={s.heroDescription} variants={rise}>From a spotless first impression to the details behind the scenes, AOG brings your facility services together. So you can focus on what you do best.</motion.p>
            <motion.div className={s.actions} variants={rise}><Link className={s.redButton} href="/contact">Get a service quote <ArrowRight size={17} /></Link><a className={s.outlineButton} href="#services">Explore our services</a></motion.div>
            <motion.p className={s.heroLocal} variants={rise}><MapPin size={15} /> Rooted in Nashville. Built around your business.</motion.p>
          </HeroContent>
          <motion.div className={s.heroCaption} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3, ease: EASE }}>
            <Reticle />
            <div>NASHVILLE, TENNESSEE <span>36.1627° N · 86.7816° W</span></div>
          </motion.div>
        </section>

        <div className={s.ribbon}>
          <motion.div className={s.container} variants={group} {...inView}>
            {services.map(({ name, icon: Icon }) => <motion.a variants={rise} href="#services" key={name}><Icon size={22} strokeWidth={1.5} /><span>{name}</span><ArrowRight size={14} /></motion.a>)}
          </motion.div>
        </div>

        <section id="services" className={`${s.section} ${s.container}`}>
          <motion.div className={s.sectionHeading} variants={group} {...inView}>
            <div><motion.p className={s.eyebrow} variants={rise}>ONE PARTNER. EVERYDAY PEACE OF MIND.</motion.p><motion.h2 variants={lineGroup}><Lines lines={["We take care of your space.", "You take care of your business."]} /></motion.h2></div>
            <motion.p variants={rise}>Every building is different. We bring cleaning, staffing, and facility support together in a plan that fits the way yours works.</motion.p>
          </motion.div>
          <motion.div className={s.servicesGrid} variants={group} {...inView}>
            {services.map(({ name, icon: Icon, description }, index) => (
              <motion.article className={s.serviceCard} variants={rise} key={name}>
                <div className={s.cardTop}><Icon size={30} strokeWidth={1.4} /><span>0{index + 1}</span></div>
                <h3>{name}</h3><p>{description}</p>
                <Link href="/contact">Discuss your needs <ArrowRight size={17} /></Link>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section id="why-aog" className={s.why}>
          <div className={`${s.container} ${s.whyGrid}`}>
            <motion.div className={s.whyPhoto} variants={wipeRight} {...inView}>
              <motion.div className={s.photoZoom} variants={settle}><Image src="/nashville-facility-team.png" alt="A facility manager and service team member reviewing work together" fill sizes="(max-width: 760px) 100vw, 50vw" /></motion.div>
              <motion.div className={s.photoLabel} variants={label}><Building2 size={25} /><span>People. Property. Peace of mind.</span></motion.div>
            </motion.div>
            <motion.div className={s.whyCopy} variants={group} {...inView}>
              <motion.p className={s.eyebrow} variants={rise}>THE AOG DIFFERENCE</motion.p>
              <motion.h2 variants={lineGroup}><Lines lines={["Less to coordinate.", "More confidence."]} /></motion.h2>
              <motion.p variants={rise}>Managing a facility means managing a hundred moving parts. AOG connects the people, the work, and the follow-through in one place.</motion.p>
              <motion.ul variants={group}>{differences.map(item => <motion.li key={item} variants={slideIn}><DrawCheck /> {item}</motion.li>)}</motion.ul>
              <MotionLink className={s.redButton} href="/contact" variants={rise}>Let’s talk about your facility <ArrowRight size={17} /></MotionLink>
            </motion.div>
          </div>
        </section>

        <section id="industries" className={`${s.container} ${s.section}`}>
          <motion.div className={s.sectionHeading} variants={group} {...inView}>
            <div><motion.p className={s.eyebrow} variants={rise}>SOLUTIONS THAT FIT YOUR WORLD</motion.p><motion.h2 variants={lineGroup}><Lines lines={["Your industry.", "Our attention to detail."]} /></motion.h2></div>
            <motion.p variants={rise}>From the front entrance to the last room on the floor, build a service plan around your people, your property, and your priorities.</motion.p>
          </motion.div>
          <motion.div className={s.industriesGrid} variants={group} {...inView}>
            {industries.map(industry => (
              <MotionLink className={s.industryCard} href="/contact" key={industry.title} variants={rise}>
                <motion.div className={s.industryImage} variants={wipeUp}><Image src={industry.image} alt={industry.title + " facility services"} fill sizes="(max-width: 760px) 100vw, 33vw" /></motion.div>
                <div className={s.industryCopy}><h3>{industry.title}</h3><p>{industry.text}</p><span>Find your solution <ArrowRight size={17} /></span></div>
              </MotionLink>
            ))}
          </motion.div>
          <motion.p className={s.industryNote} variants={rise} {...inView}>Have a different kind of facility? <Link href="/contact">Tell us about your space <ArrowRight size={14} /></Link></motion.p>
        </section>

        <section id="nashville" className={s.local}>
          <div className={`${s.container} ${s.localGrid}`}>
            <motion.div variants={group} {...inView}>
              <motion.p className={s.eyebrow} variants={rise}>LET’S GET TO WORK, NASHVILLE.</motion.p>
              <motion.h2 variants={lineGroup}><Lines lines={["Local connection.", "Complete facility care."]} /></motion.h2>
              <motion.p variants={rise}>Tell us what your facility needs. We’ll help you take the next step, whether it’s recurring cleaning, event support, or a coordinated service plan.</motion.p>
              <MotionLink className={s.redButton} href="/contact" variants={rise}>Connect with AOG <ArrowRight size={17} /></MotionLink>
            </motion.div>
            <motion.div className={s.contactCard} variants={fromRight} {...inView}>
              <motion.span className={s.cardRail} variants={rail} aria-hidden="true" />
              <span className={s.pin}><span aria-hidden="true" /><span aria-hidden="true" /><MapPin size={32} /></span>
              <h3>Find us in Nashville</h3>
              <address>100 Antioch Pike, Suite bb213<br />Nashville, TN</address>
              <a href="tel:+14143191622"><Phone size={16} /> +1 (414) 319-1622</a>
              <a href="mailto:sales@aoggroup.com">sales@aoggroup.com <ArrowRight size={16} /></a>
              <Link href="/booking-status">Already booked? Track your service <ArrowRight size={16} /></Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <motion.div className={`${s.container} ${s.footerGrid}`} variants={group} {...inView}>
          <motion.div variants={rise}><Link href="/" className={s.footerBrand}>AOG<span>SERVICES</span></Link><p>Care for your facility.<br />Confidence for your day.</p></motion.div>
          <motion.div variants={rise}><h3>Solutions</h3><a href="#services">Our services</a><a href="#industries">Industries we serve</a><a href="#why-aog">Why AOG</a></motion.div>
          <motion.div variants={rise}><h3>Get in touch</h3><Link href="/contact">Request service</Link><a href="#nashville">Nashville office</a><a href="mailto:sales@aoggroup.com">sales@aoggroup.com</a></motion.div>
          <motion.div variants={rise}><h3>Your workspace</h3><Link href="/sign-in">Client portal</Link><Link href="/booking-status">Track a service</Link><Link href="/modules">Explore AOG OS</Link></motion.div>
        </motion.div>
        <div className={`${s.container} ${s.copyright}`}><span>© {new Date().getFullYear()} AOG Services. All rights reserved.</span><span>Facility solutions. Thoughtfully coordinated.</span></div>
      </footer>
    </div>
  );
}
