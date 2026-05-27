"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Award,
  Briefcase,
  Calendar,
  Check,
  FileText,
  Heart,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  PieChart,
  Plus,
  Shield,
  Star,
  Tractor,
  Users,
  ArrowRight,
  X,
} from "lucide-react";

const services = [
  { icon: FileText, title: "Wills", href: "/wills", body: "Make sure your wishes are clearly recorded and legally sound." },
  { icon: Shield, title: "Trusts", href: "/trusts", body: "Protect assets for children, vulnerable family, or future generations." },
  { icon: Users, title: "Lasting Powers of Attorney", href: "/lpa", body: "Choose who makes decisions for you if you ever can't." },
  { icon: PieChart, title: "Inheritance Tax Planning", href: "/inheritance-tax-planning", body: "Support with mitigating tax and leaving more to the people you love." },
  { icon: Heart, title: "Care Planning", href: "/care-planning", body: "Plan ahead, honestly, so you and your family understand your options." },
  { icon: Briefcase, title: "Business Protection", href: "/business-protection", body: "Keep your business in safe hands, whatever happens." },
  { icon: Tractor, title: "Agricultural Estate Planning", href: "/agricultural-land", body: "Pass land and farming assets to the next generation, properly." },
];

const testimonials = [
  { theme: "Confusion", quote: "They explained everything so clearly. We finally feel like things are in order - and that we understand them.", name: "Margaret", town: "Leamington Spa" },
  { theme: "Trust", quote: "Patient, professional, and never once made us feel rushed or pressured. We knew exactly what we were paying for.", name: "David", town: "Warwick" },
  { theme: "Family stress", quote: "Took a real weight off our shoulders. A difficult subject made manageable, with kindness throughout.", name: "The Hollis family", town: "Stratford-upon-Avon" },
  { theme: "Cost", quote: "Honest about what we did and didn't need. We came away spending less than expected, with more confidence than we'd had in years.", name: "Patrick", town: "Kenilworth" },
  { theme: "Care fees", quote: "Cut through the noise about care fee schemes and gave us a straight answer. Refreshing.", name: "Sarah & Tom", town: "Southam" },
  { theme: "Complexity", quote: "We had a blended family and a farm. Felt completely out of our depth. They walked us through every part of it.", name: "The Whitmore family", town: "Warwickshire" },
];

const faqs = [
  {
    q: "Do I really need a will if I'm married?",
    a: "Yes. A common misconception is that everything passes to your spouse automatically. In England and Wales, the intestacy rules can divide your estate in ways that surprise families. A simple will makes your wishes clear.",
  },
  {
    q: "How much does estate planning cost?",
    a: "We agree clear costs with you before any work begins. More involved planning is scoped after an initial, no-obligation conversation.",
  },
  {
    q: "What's the difference between a will and a trust?",
    a: "A will sets out your wishes when you die. A trust is a structure that holds assets to protect them for someone, manage how inheritance is passed on, or support tax planning.",
  },
  {
    q: "How does care planning work?",
    a: "We help you understand how care is paid for, what local authorities can and can't take into account, and the legitimate planning options available.",
  },
  {
    q: "How long does the whole process take?",
    a: "It depends on what you need and how complex your circumstances are. We explain the process clearly at the start and keep you updated throughout.",
  },
  {
    q: "What happens at the initial chat?",
    a: "We listen first, understand what's prompted you to think about planning, and help you leave with a clearer view of your options.",
  },
];

function semanticId(prefix: string, value: string) {
  return `${prefix}-${value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="hero">
      <div className="container hero__copy">
        <h1>Estate planning that feels <em>calm, clear, and human.</em></h1>
        <p className="hero__sub">Wills, trusts, lasting powers of attorney and later-life planning - explained simply and shaped around your family in Leamington Spa and across Warwickshire.</p>
        <p className="hero__services">Wills | Trusts | LPAs | Inheritance tax planning</p>
        <div className="hero__ctas">
          <button className="btn btn--primary btn--lg" onClick={onBook}>
            <Calendar className="btn__icon" /> Start with an initial chat
          </button>
          <a href="tel:07902863999" className="btn btn--ghost btn--lg">
            <Phone className="btn__icon" /> Call 07902 863999
          </a>
        </div>
        <div className="hero__assure">
          <Check width="18" height="18" />
          <span>No obligation. No jargon. Home visits available across Warwickshire.</span>
        </div>
      </div>
      <div className="hero__visual">
        <Image src="/generated/clear-path-hero.jpg" alt="Warm garden path leading to a welcoming front door" fill sizes="100vw" priority />
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Shield, text: "Over 15 years of experience" },
    { icon: Award, text: "Fully qualified and insured" },
    { icon: MapPin, text: "Local to Leamington Spa" },
    { icon: Home, text: "Home visits available" },
  ];
  return (
    <div className="trustbar">
      <div className="trustbar__inner">
        {items.map(({ icon: Icon, text }) => (
          <div className="trust" key={text}>
            <span className="trust__icon"><Icon width="18" height="18" /></span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProblemSection() {
  const problems = [
    "Long delays before family can access money or property",
    "Decisions made by courts rather than by you",
    "Tax planning opportunities that could have reduced unnecessary exposure",
    "Disputes between relatives about what you would have wanted",
    "Care costs that quietly erode everything you've built",
  ];
  return (
    <section className="problem-section" id="cost-of-doing-nothing">
      <div className="container">
        <div className="problem">
          <h4>The cost of doing nothing</h4>
          <h2>Without a plan, your family is left to guess.</h2>
          <p className="problem__lede">When nothing is in place, the people you love are the ones who deal with the consequences - often at the hardest possible time.</p>
          <p className="problem__intro">Without clear planning, families can face:</p>
          <ul className="problem__list">
            {problems.map((problem) => (
              <li id={semanticId("problem", problem)} data-semantic-id={semanticId("problem", problem)} key={problem}><span className="check"><Check width="12" height="12" /></span><span>{problem}</span></li>
            ))}
          </ul>
          <p className="problem__close">A clear plan, made in advance, protects the people you care about from all of it.</p>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const items = [
    { icon: Users, title: "Genuinely personal", body: "You'll deal with the same person from your first chat to the final document. No call centres, no handovers." },
    { icon: Shield, title: "Properly experienced", body: "Over 15 years helping families across Warwickshire - from straightforward wills to complex estates." },
    { icon: MessageCircle, title: "Always clear", body: "We won't bury you in legal terms or surprise you with costs. If something isn't right for you, we'll say so." },
  ];
  return (
    <section className="why-section section--cream" id="why-families-choose-us">
      <div className="container">
        <div className="why__head">
          <h4>Why families choose us</h4>
          <h2>The reassurance of one person, start to finish.</h2>
        </div>
        <div className="why__grid">
          {items.map(({ icon: Icon, title, body }) => (
            <div className="why__card" id={semanticId("why", title)} data-semantic-id={semanticId("why", title)} key={title}>
              <div className="why__icon"><Icon width="24" height="24" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const steps = [
    { icon: MessageCircle, title: "An initial chat", body: "We talk through your situation. No pressure, no commitment, no jargon." },
    { icon: FileText, title: "Your tailored plan", body: "We explain what we'd suggest and why - with clear, agreed costs before you decide." },
    { icon: Pencil, title: "Drafting and signing", body: "We prepare your documents in plain English and guide you through signing." },
    { icon: Heart, title: "Ongoing support", body: "Life changes. We're here when something needs updating or you just want to talk." },
  ];

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`process ${inView ? "in-view" : ""}`} id="process" ref={ref}>
      <div className="container">
        <div className="process__head">
          <h4 style={{ marginBottom: 12 }}>How it works</h4>
          <h2>Four simple steps.</h2>
          <p>The same calm, unhurried process whether you&apos;re writing a first will or planning across generations.</p>
        </div>
        <div className="process__grid">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <div className="step" id={semanticId("process", title)} data-semantic-id={semanticId("process", title)} key={title}>
              <div className="step__head">
                <div className="step__num">{String(index + 1).padStart(2, "0")}</div>
                <span className="step__icon"><Icon width="28" height="28" /></span>
              </div>
            <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services">
      <div className="container">
        <div className="services__head">
          <h4 style={{ marginBottom: 12 }}>What we help with</h4>
          <h2>The full range, handled by one person.</h2>
          <p>Each service is offered on its own or as part of a plan that ties them together.</p>
        </div>
        <div className="services__grid">
          {services.map(({ icon: Icon, title, body, href }) => (
            <a className="service" href={href} id={semanticId("service", title)} data-semantic-id={semanticId("service", title)} key={title}>
              <span className="service__icon"><Icon width="30" height="30" /></span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="service__arrow">Learn more <ArrowRight width="14" height="14" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const loop = [...testimonials, ...testimonials];
  return (
    <section id="reviews">
      <div className="container">
        <div className="testimonials__head">
          <h4 style={{ marginBottom: 12 }}>What our clients say</h4>
          <h2>Quiet confidence, in their own words.</h2>
        </div>
      </div>
      <div className="testimonials__viewport" tabIndex={0} aria-label="Client testimonials carousel - hover to pause">
        <div className="testimonials__track">
          {loop.map((testimonial, index) => (
            <figure className="testimonial" id={index < testimonials.length ? semanticId("review", testimonial.theme) : undefined} data-semantic-id={index < testimonials.length ? semanticId("review", testimonial.theme) : undefined} key={`${testimonial.name}-${index}`} aria-hidden={index >= testimonials.length}>
              <span className="testimonial__theme">On {testimonial.theme.toLowerCase()}</span>
              <blockquote className="testimonial__quote">{testimonial.quote}</blockquote>
              <div className="testimonial__stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, star) => <Star key={star} width="14" height="14" fill="currentColor" />)}
              </div>
              <figcaption className="testimonial__attr">{testimonial.name}, {testimonial.town}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalTrust() {
  const towns = ["Leamington Spa", "Warwick", "Kenilworth", "Stratford-upon-Avon", "Southam", "Rugby"];
  return (
    <section id="where-we-work">
      <div className="container">
        <div className="local">
          <div className="local__copy">
            <h4 style={{ marginBottom: 16 }}>Where we work</h4>
            <h2>Based in Leamington Spa.<br />Visiting families across Warwickshire.</h2>
            <p style={{ marginTop: 20 }}>We meet at our office, in clients&apos; homes, or wherever feels most comfortable. Many families prefer a kitchen-table conversation to a formal meeting room.</p>
            <p>If travel or mobility is an issue, we&apos;ll come to you.</p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {towns.map((town) => (
                <span key={town} style={{ fontSize: 13, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--hairline)", color: "var(--stone)" }}>{town}</span>
              ))}
            </div>
          </div>
          <div className="local__visual">
            <Image src="/leamington_location.jpg" alt="Jephson Gardens in Leamington Spa" fill sizes="(max-width: 880px) 100vw, 45vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq">
      <div className="container">
        <div className="faq__head">
          <h4 style={{ marginBottom: 12 }}>Common questions</h4>
          <h2>Honest answers to what families ask first.</h2>
        </div>
        <div className="faq__list">
          {faqs.map((item, index) => (
            <div className={`faq__item ${open === index ? "open" : ""}`} id={semanticId("faq", item.q)} data-semantic-id={semanticId("faq", item.q)} key={item.q}>
              <button className="faq__btn" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
                <span>{item.q}</span>
                <span className="faq__icon"><Plus width="16" height="16" /></span>
              </button>
              <div className="faq__answer" role="region">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="faq__see-all">
          <a href="#contact" onClick={(event) => { event.preventDefault(); onBook(); }}>
            Ask us directly <ArrowRight width="14" height="14" style={{ verticalAlign: "middle" }} />
          </a>
        </p>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter__inner">
        <div>
          <h4 style={{ marginBottom: 12 }}>Stay in touch</h4>
          <h2>Plain-English guides, <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--sage)" }}>with a lighter touch.</em></h2>
          <p style={{ marginTop: 12, maxWidth: "42ch" }}>Practical notes on wills, trusts, tax planning and care - plus occasional celebrity estate-planning stories and useful lessons.</p>
        </div>
        <form className="newsletter__form-wrap" onSubmit={(event) => { event.preventDefault(); setDone(true); }}>
          {done ? (
            <div style={{ padding: "14px 18px", background: "var(--sage-light)", borderRadius: 10, color: "var(--sage-deep)", fontWeight: 500 }}>Thank you - please check your inbox to confirm.</div>
          ) : (
            <>
              <div className="newsletter__form">
                <input type="email" required placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" />
                <button type="submit" className="btn btn--primary">Sign up</button>
              </div>
              <p className="newsletter__note">We never share your details.</p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function FinalCTA({ onBook }: { onBook: () => void }) {
  return (
    <section className="finalcta" id="contact">
      <div className="container">
        <h4 style={{ color: "var(--sage)", marginBottom: 18 }}>Take the first step</h4>
        <h2>Start with an initial, no-obligation chat.</h2>
        <p>Most people leave their first conversation feeling lighter - clearer about what they need, and reassured that it&apos;s more straightforward than they expected.</p>
        <div className="finalcta__ctas">
          <button className="btn btn--primary btn--lg" onClick={onBook}><Calendar className="btn__icon" /> Book your initial chat</button>
          <a className="btn btn--ghost btn--lg" href="tel:07902863999"><Phone className="btn__icon" /> Call 07902 863999</a>
        </div>
        <p className="finalcta__phone">Happy to talk things through on the phone first - Mon-Fri, 9-5.</p>
      </div>
    </section>
  );
}

function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({ name: "", phone: "", email: "", when: "morning", note: "" });

  const closeModal = useCallback(() => {
    setSubmitted(false);
    setData({ name: "", phone: "", email: "", when: "morning", note: "" });
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal, open]);

  if (!open) return null;

  return (
    <div className="modal" onClick={closeModal}>
      <div className="modal__card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Book an initial chat">
        <button className="modal__close" onClick={closeModal} aria-label="Close"><X width="20" height="20" /></button>
        {submitted ? (
          <div className="success">
            <div className="success__icon"><Check width="28" height="28" /></div>
            <h3>Thank you, {data.name.split(" ")[0] || "we've got it"}.</h3>
            <p className="modal__lede">We&apos;ll be in touch within one working day to confirm a time that suits you.</p>
            <button className="btn btn--ghost" onClick={closeModal}>Close</button>
          </div>
        ) : (
          <form className="form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <h3>Book your initial chat</h3>
            <p className="modal__lede">In person, by phone, or video. We&apos;ll listen, and you&apos;ll leave with a clearer view.</p>
            <div className="field">
              <label htmlFor="bk-name">Your name</label>
              <input id="bk-name" required value={data.name} onChange={(event) => setData({ ...data, name: event.target.value })} />
            </div>
            <div className="field__row">
              <div className="field">
                <label htmlFor="bk-phone">Phone</label>
                <input id="bk-phone" type="tel" required value={data.phone} onChange={(event) => setData({ ...data, phone: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="bk-email">Email</label>
                <input id="bk-email" type="email" required value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="bk-when">Preferred time</label>
              <select id="bk-when" value={data.when} onChange={(event) => setData({ ...data, when: event.target.value })}>
                <option value="morning">Weekday mornings</option>
                <option value="afternoon">Weekday afternoons</option>
                <option value="evening">Early evenings</option>
                <option value="weekend">Weekends</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="bk-note">Anything you&apos;d like us to know? <span style={{ color: "var(--stone)", fontWeight: 400 }}>(optional)</span></label>
              <textarea id="bk-note" rows={3} value={data.note} onChange={(event) => setData({ ...data, note: event.target.value })} />
            </div>
            <div className="form__assure"><Lock width="14" height="14" /> Your details stay with the practice. We never share them.</div>
            <button type="submit" className="btn btn--primary btn--lg form__submit"><Calendar className="btn__icon" /> Request an initial chat</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PathwaysExportHome() {
  const [bookOpen, setBookOpen] = useState(false);
  const onBook = () => setBookOpen(true);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <a href="#main" className="sr-only">Skip to content</a>
      <main id="main">
        <Hero onBook={onBook} />
        <TrustBar />
        <ProblemSection />
        <WhySection />
        <Process />
        <Services />
        <div className="softcta">
          <div className="container">
            <p>Not sure what you need?<a href="#contact" onClick={(event) => { event.preventDefault(); onBook(); }}>Start with an initial chat. <ArrowRight width="14" height="14" style={{ verticalAlign: "middle" }} /></a></p>
          </div>
        </div>
        <Testimonials />
        <LocalTrust />
        <FAQ onBook={onBook} />
        <Newsletter />
        <FinalCTA onBook={onBook} />
      </main>
      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} />
    </>
  );
}
