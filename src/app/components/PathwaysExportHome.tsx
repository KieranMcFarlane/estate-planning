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
  Shield,
  Tractor,
  Users,
  ArrowRight,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CmsContentBlock, CmsPage } from "../cms/types";

const defaultServices = [
  { icon: FileText, title: "Wills", href: "/wills", body: "Make sure your wishes are clearly recorded and legally sound." },
  { icon: Shield, title: "Trusts", href: "/trusts", body: "Protect assets for children, vulnerable family, or future generations." },
  { icon: Users, title: "Lasting Powers of Attorney", href: "/lpa", body: "Choose who makes decisions for you if you ever can't." },
  { icon: PieChart, title: "Inheritance Tax Planning", href: "/inheritance-tax-planning", body: "Support with mitigating tax and leaving more to the people you love." },
  { icon: Heart, title: "Care Planning", href: "/care-planning", body: "Plan ahead, honestly, so you and your family understand your options." },
  { icon: Briefcase, title: "Business Protection", href: "/business-protection", body: "Keep your business in safe hands, whatever happens." },
  { icon: Tractor, title: "Agricultural Estate Planning", href: "/agricultural-land", body: "Pass land and farming assets to the next generation, properly." },
];

const defaultTestimonials = [
  {
    theme: "Confusion",
    problem: "We had put everything off because the paperwork felt too big and too legal.",
    solution: "Pathway broke it into plain-English decisions and kept us moving calmly.",
    result: "We finally know our wishes are recorded properly, and the family knows where it stands.",
    name: "Margaret",
    town: "Royal Leamington Spa",
  },
  {
    theme: "Trust",
    problem: "We were worried we would be rushed into documents we did not understand.",
    solution: "Every option was explained, priced clearly, and checked against what we actually needed.",
    result: "We signed with confidence and no surprises, knowing the plan fits our family.",
    name: "David",
    town: "Warwick",
  },
  {
    theme: "Family stress",
    problem: "A difficult family situation had made estate planning feel emotionally heavy.",
    solution: "The conversation was handled gently, with each concern turned into a practical next step.",
    result: "The pressure lifted, and everyone had a clearer view of what would happen next.",
    name: "The Hollis family",
    town: "Stratford-upon-Avon",
  },
  {
    theme: "Cost",
    problem: "We expected estate planning to be expensive and were unsure what was essential.",
    solution: "Pathway separated what mattered now from what could wait, with clear costs before work began.",
    result: "We spent less than expected and came away with exactly the protection we needed.",
    name: "Patrick",
    town: "Kenilworth",
  },
  {
    theme: "Care fees",
    problem: "Care fee advice online left us confused and worried about making the wrong move.",
    solution: "They cut through the noise and explained the legitimate options in straightforward terms.",
    result: "We stopped guessing and made a measured plan for later-life decisions.",
    name: "Sarah & Tom",
    town: "Southam",
  },
  {
    theme: "Complexity",
    problem: "A blended family and farming assets made our estate feel too complicated to tackle.",
    solution: "Pathway mapped each risk, explained the choices, and joined the plan together.",
    result: "The farm, the family, and the future now feel properly accounted for.",
    name: "The Whitmore family",
    town: "Warwickshire",
  },
];

const defaultFaqs = [
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

type PathwaysExportHomeProps = {
  page?: CmsPage | null;
};

type HomeTestimonial = (typeof defaultTestimonials)[number];
type HomeFaq = (typeof defaultFaqs)[number];

const serviceMeta = new Map(defaultServices.map((service) => [service.title, service]));

function textOr(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

function singleImageSrc(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const [first] = value.split(",").map((item) => item.trim()).filter(Boolean);
    return first || fallback;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const selected: string = singleImageSrc(item, "");
      if (selected) return selected;
    }
  }
  return fallback;
}

function blockFor(page: CmsPage | null | undefined, key: string) {
  const normalized = key.toLowerCase();
  return page?.blocks.find((block) => {
    const blockKey = block.key?.toLowerCase() ?? "";
    const heading = block.heading?.toLowerCase() ?? "";
    const eyebrow = block.eyebrow?.toLowerCase() ?? "";
    return blockKey === normalized || heading.includes(normalized) || eyebrow.includes(normalized);
  });
}

function cardsOr<T extends { title: string; body: string }>(block: CmsContentBlock | undefined, fallback: T[]) {
  return block?.cards?.length ? block.cards : fallback;
}

function itemsOr(block: CmsContentBlock | undefined, fallback: string[]) {
  return block?.items?.length ? block.items : fallback;
}

function paragraphsOr(block: CmsContentBlock | undefined, fallback: string[]) {
  return block?.paragraphs?.length ? block.paragraphs : fallback;
}

function paragraphAt(block: CmsContentBlock | undefined, index: number, fallback: string[]) {
  return paragraphsOr(block, fallback)[index] ?? fallback[index] ?? "";
}

function semanticId(prefix: string, value: string) {
  return `${prefix}-${value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function Hero({ onBook, page }: { onBook: () => void; page?: CmsPage | null }) {
  const title = textOr(page?.title, "Estate planning that feels calm, clear, and human.");
  const subtitle = textOr(
    page?.subtitle,
    "Wills, trusts, lasting powers of attorney and later-life planning - explained simply and shaped around your family in Royal Leamington Spa and across Warwickshire.",
  );
  const serviceLine = page?.intro?.[0] ?? "Wills | Trusts | LPAs | Inheritance tax planning";
  const assurance = page?.intro?.[1] ?? "No obligation. No jargon. Home visits available across Warwickshire.";
  const heroImage = singleImageSrc(page?.heroImage, "/generated/service-wills.png");
  const heroAlt = page?.heroAlt ?? "Will writing documents on a desk";
  const titleParts = title.match(/^(.*?)(calm, clear, and human\.?)$/i);
  return (
    <section className="hero">
      <div className="container hero__copy">
        <h1>{titleParts ? <>{titleParts[1]}<em>{titleParts[2]}</em></> : title}</h1>
        <p className="hero__sub">{subtitle}</p>
        <p className="hero__services">{serviceLine}</p>
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
          <span>{assurance}</span>
        </div>
      </div>
      <div className="hero__visual">
        <Image src={heroImage} alt={heroAlt} fill sizes="100vw" priority />
      </div>
    </section>
  );
}

function TrustBar({ block }: { block?: CmsContentBlock }) {
  const fallbackItems = [
    { icon: Shield, text: "Over 15 years of experience" },
    { icon: Award, text: "Fully qualified and insured" },
    { icon: MapPin, text: "Local to Royal Leamington Spa" },
    { icon: Home, text: "Home visits available" },
  ];
  const icons = [Shield, Award, MapPin, Home];
  const items = itemsOr(block, fallbackItems.map((item) => item.text)).map((item, index) => ({
    icon: icons[index] ?? Shield,
    text: item,
  }));
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

function ProblemSection({ block }: { block?: CmsContentBlock }) {
  const fallbackProblems = [
    "Long delays before family can access money or property",
    "Decisions made by courts rather than by you",
    "Tax planning opportunities that could have reduced unnecessary exposure",
    "Disputes between relatives about what you would have wanted",
    "Care costs that quietly erode everything you've built",
  ];
  const paragraphs = paragraphsOr(block, [
    "When nothing is in place, the people you love are the ones who deal with the consequences - often at the hardest possible time.",
    "Without clear planning, families can face:",
    "A clear plan, made in advance, protects the people you care about from all of it.",
  ]);
  const problems = itemsOr(block, fallbackProblems);
  return (
    <section className="problem-section" id="cost-of-doing-nothing">
      <div className="container">
        <div className="problem">
          <h4>{block?.eyebrow ?? "The cost of doing nothing"}</h4>
          <h2>{block?.heading ?? "Without a plan, your family is left to guess."}</h2>
          <p className="problem__lede">{paragraphs[0]}</p>
          <p className="problem__intro">{paragraphs[1]}</p>
          <ul className="problem__list">
            {problems.map((problem) => (
              <li id={semanticId("problem", problem)} data-semantic-id={semanticId("problem", problem)} key={problem}><span className="check"><Check width="12" height="12" /></span><span>{problem}</span></li>
            ))}
          </ul>
          <p className="problem__close">{paragraphs[2]}</p>
        </div>
      </div>
    </section>
  );
}

function WhySection({ block }: { block?: CmsContentBlock }) {
  const fallbackItems = [
    { icon: Users, title: "Genuinely personal", body: "You'll deal with the same person from your first chat to the final document. No call centres, no handovers." },
    { icon: Shield, title: "Proficiently experienced", body: "Over 15 years helping families across Warwickshire - from straightforward wills to complex estates." },
    { icon: MessageCircle, title: "Always clear", body: "We won't bury you in legal terms or surprise you with costs. If something isn't right for you, we'll say so." },
  ];
  const icons = [Users, Shield, MessageCircle];
  const items = cardsOr(block, fallbackItems).map((item, index) => ({
    icon: icons[index] ?? Users,
    title: item.title,
    body: item.body,
  }));
  return (
    <section className="why-section section--cream" id="why-families-choose-us">
      <div className="container">
        <div className="why__head">
          <h4>{block?.eyebrow ?? "Why families choose us"}</h4>
          <h2>{block?.heading ?? "The reassurance of one person, start to finish."}</h2>
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

function Process({ block }: { block?: CmsContentBlock }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const fallbackSteps = [
    { icon: MessageCircle, title: "An initial chat", body: "We talk through your situation. No pressure, no commitment, no jargon." },
    {
      icon: FileText,
      title: "Your tailored plan",
      body: "We explain our advice in an invaluable comprehensive estate planning report precisely tailored to you and your circumstances.",
    },
    { icon: Pencil, title: "Drafting and signing", body: "We prepare your documents in plain English and guide you through signing." },
    { icon: Heart, title: "Ongoing support", body: "Life changes. We're here when something needs updating or you just want to talk." },
  ];
  const icons = [MessageCircle, FileText, Pencil, Heart];
  const steps = cardsOr(block, fallbackSteps).map((step, index) => ({
    icon: icons[index] ?? MessageCircle,
    title: step.title,
    body: step.body,
  }));
  const intro = paragraphsOr(block, ["The same calm, unhurried process whether you're writing a first will or planning across generations."])[0];

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
          <h4 style={{ marginBottom: 12 }}>{block?.eyebrow ?? "How it works"}</h4>
          <h2>{block?.heading ?? "Four simple steps."}</h2>
          <p>{intro}</p>
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

function Services({ block }: { block?: CmsContentBlock }) {
  const cmsServices = cardsOr(block, defaultServices);
  const services = cmsServices.map((service) => {
    const meta = serviceMeta.get(service.title);
    return {
      icon: meta?.icon ?? FileText,
      href: meta?.href ?? "#contact",
      title: service.title,
      body: service.body,
    };
  });
  return (
    <section id="services">
      <div className="container">
        <div className="services__head">
          <h4 style={{ marginBottom: 12 }}>{block?.eyebrow ?? "What we help with"}</h4>
          <h2>{block?.heading ?? "Your own estate planning specialist, dedicated to your case."}</h2>
          <p>{paragraphsOr(block, ["Each service is offered on its own or as part of a plan that ties them together."])[0]}</p>
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

function Testimonials({ block }: { block?: CmsContentBlock }) {
  const source = block?.cards?.length
    ? block.cards.map((card): HomeTestimonial => {
        const [problem, solution, result] = card.items ?? [];
        const [name = card.body, town = ""] = card.body.split(",").map((item) => item.trim());
        return {
          theme: card.title,
          problem: problem ?? "",
          solution: solution ?? "",
          result: result ?? "",
          name,
          town,
        };
      })
    : defaultTestimonials;
  const testimonials = source.filter((testimonial) => testimonial.problem && testimonial.solution && testimonial.result);
  const loop = [...testimonials, ...testimonials];
  return (
    <section id="reviews">
      <div className="container">
        <div className="testimonials__head">
          <h4 style={{ marginBottom: 12 }}>{block?.eyebrow ?? "What our clients say"}</h4>
          <h2>{block?.heading ?? "Quiet confidence, in their own words."}</h2>
        </div>
      </div>
      <div className="testimonials__viewport" tabIndex={0} aria-label="Client testimonials carousel - hover to pause">
        <div className="testimonials__track">
          {loop.map((testimonial, index) => (
            <figure className="testimonial" id={index < testimonials.length ? semanticId("review", testimonial.theme) : undefined} data-semantic-id={index < testimonials.length ? semanticId("review", testimonial.theme) : undefined} key={`${testimonial.name}-${index}`} aria-hidden={index >= testimonials.length}>
              <span className="testimonial__theme">On {testimonial.theme.toLowerCase()}</span>
              <blockquote className="testimonial__story">
                <span><strong>Problem</strong>{testimonial.problem}</span>
                <span><strong>Our solution</strong>{testimonial.solution}</span>
                <span><strong>Real result</strong>{testimonial.result}</span>
              </blockquote>
              <figcaption className="testimonial__attr">{testimonial.name}, {testimonial.town}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalTrust({ block }: { block?: CmsContentBlock }) {
  const towns = itemsOr(block, ["Royal Leamington Spa", "Warwick", "Kenilworth", "Stratford-upon-Avon", "Southam", "Rugby"]);
  const paragraphs = paragraphsOr(block, [
    "We meet at our office, in clients' homes, or wherever feels most comfortable. Many families prefer a kitchen-table conversation to a formal meeting room.",
    "If travel or mobility is an issue, we'll come to you.",
  ]);
  return (
    <section id="where-we-work">
      <div className="container">
        <div className="local">
          <div className="local__copy">
            <h4 style={{ marginBottom: 16 }}>{block?.eyebrow ?? "Where we work"}</h4>
            <h2>{block?.heading ?? "Based in Royal Leamington Spa. Visiting families across Warwickshire."}</h2>
            <p style={{ marginTop: 20 }}>{paragraphs[0]}</p>
            <p>{paragraphs[1]}</p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {towns.map((town) => (
                <span key={town} style={{ fontSize: 13, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--hairline)", color: "var(--stone)" }}>{town}</span>
              ))}
            </div>
          </div>
          <div className="local__visual">
            <Image src="/leamington_location.jpg" alt="Jephson Gardens in Royal Leamington Spa" fill sizes="(max-width: 880px) 100vw, 45vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ({ onBook, block }: { onBook: () => void; block?: CmsContentBlock }) {
  const faqs = cardsOr(block, defaultFaqs.map((faq) => ({ title: faq.q, body: faq.a }))).map((faq): HomeFaq => ({
    q: faq.title,
    a: faq.body,
  }));
  return (
    <section id="faq">
      <div className="container">
        <div className="faq__head">
          <h4 style={{ marginBottom: 12 }}>{block?.eyebrow ?? "Common questions"}</h4>
          <h2>{block?.heading ?? "Honest answers to what families ask first."}</h2>
        </div>
        <Accordion type="single" collapsible defaultValue={faqs[0].q} className="faq__list">
          {faqs.map((item) => (
            <AccordionItem
              className="faq__item"
              id={semanticId("faq", item.q)}
              data-semantic-id={semanticId("faq", item.q)}
              key={item.q}
              value={item.q}
            >
              <AccordionTrigger className="faq__btn">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="faq__answer">
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="faq__see-all">
          <a href="#contact" onClick={(event) => { event.preventDefault(); onBook(); }}>
            Ask us directly <ArrowRight width="14" height="14" />
          </a>
        </p>
      </div>
    </section>
  );
}

function Newsletter({ block }: { block?: CmsContentBlock }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const paragraphs = paragraphsOr(block, [
    "Practical notes on wills, trusts, tax planning and care - plus occasional celebrity estate-planning stories and useful lessons.",
    "We never share your details.",
  ]);
  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter__inner">
        <div>
          <h4 style={{ marginBottom: 12 }}>{block?.eyebrow ?? "Stay in touch"}</h4>
          <h2>{block?.heading ?? "Plain-English guides,"} <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--sage)" }}>with a lighter touch.</em></h2>
          <p style={{ marginTop: 12, maxWidth: "42ch" }}>{paragraphs[0]}</p>
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
              <p className="newsletter__note">{paragraphs[1]}</p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function FinalCTA({ onBook, block }: { onBook: () => void; block?: CmsContentBlock }) {
  const fallbackParagraphs = [
    "Most people leave their first conversation feeling lighter - clearer about what they need, and reassured that it's more straightforward than they expected.",
    "Happy to talk things through on the phone first - Mon-Fri, 9-5.",
  ];

  return (
    <section className="finalcta" id="contact">
      <div className="container">
        <h4 style={{ color: "var(--sage)", marginBottom: 18 }}>{block?.eyebrow ?? "Take the first step"}</h4>
        <h2>{block?.heading ?? "Start with an initial, no-obligation chat."}</h2>
        <p>{paragraphAt(block, 0, fallbackParagraphs)}</p>
        <div className="finalcta__ctas">
          <button className="btn btn--primary btn--lg" onClick={onBook}><Calendar className="btn__icon" /> Book your initial chat</button>
          <a className="btn btn--ghost btn--lg" href="tel:07902863999"><Phone className="btn__icon" /> Call 07902 863999</a>
        </div>
        <p className="finalcta__phone">{paragraphAt(block, 1, fallbackParagraphs)}</p>
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

export default function PathwaysExportHome({ page }: PathwaysExportHomeProps) {
  const [bookOpen, setBookOpen] = useState(false);
  const onBook = () => setBookOpen(true);
  const trustBlock = blockFor(page, "trust-badges") ?? blockFor(page, "trust badges");
  const problemBlock = blockFor(page, "cost-of-doing-nothing") ?? blockFor(page, "without a plan") ?? blockFor(page, "cost of doing nothing");
  const whyBlock = blockFor(page, "why-families-choose-us") ?? blockFor(page, "reassurance") ?? blockFor(page, "why families");
  const processBlock = blockFor(page, "how-it-works") ?? blockFor(page, "four simple") ?? blockFor(page, "how it works");
  const servicesBlock = blockFor(page, "services-overview") ?? blockFor(page, "estate planning specialist") ?? blockFor(page, "what we help");
  const softCtaBlock = blockFor(page, "soft-cta") ?? blockFor(page, "not sure what you need");
  const testimonialsBlock = blockFor(page, "testimonials") ?? blockFor(page, "quiet confidence") ?? blockFor(page, "clients say");
  const localBlock = blockFor(page, "where-we-work") ?? blockFor(page, "based in royal") ?? blockFor(page, "where we work");
  const faqBlock = blockFor(page, "faq") ?? blockFor(page, "honest answers") ?? blockFor(page, "common questions");
  const newsletterBlock = blockFor(page, "newsletter") ?? blockFor(page, "plain-english guides") ?? blockFor(page, "stay in touch");
  const finalCtaBlock = blockFor(page, "final-cta") ?? blockFor(page, "initial, no-obligation") ?? blockFor(page, "take the first step");

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <a href="#main" className="sr-only">Skip to content</a>
      <main id="main">
        <Hero onBook={onBook} page={page} />
        <TrustBar block={trustBlock} />
        <ProblemSection block={problemBlock} />
        <WhySection block={whyBlock} />
        <Process block={processBlock} />
        <Services block={servicesBlock} />
        <div className="softcta">
          <div className="container">
            <p>
              {softCtaBlock?.heading ?? "Not sure what you need?"}
              <a href="#contact" onClick={(event) => { event.preventDefault(); onBook(); }}>
                {paragraphAt(softCtaBlock, 0, ["Start with an initial chat."])} <ArrowRight width="14" height="14" />
              </a>
            </p>
          </div>
        </div>
        <Testimonials block={testimonialsBlock} />
        <LocalTrust block={localBlock} />
        <FAQ onBook={onBook} block={faqBlock} />
        <Newsletter block={newsletterBlock} />
        <FinalCTA onBook={onBook} block={finalCtaBlock} />
      </main>
      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} />
    </>
  );
}
