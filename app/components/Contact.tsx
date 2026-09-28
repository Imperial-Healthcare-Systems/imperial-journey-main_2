import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <section
      id="contact-section"
      className="py-[130px] bg-offwhite max-[600px]:py-[90px]"
    >
      <div className="wrap">
        <div className="grid gap-20 max-[880px]:grid-cols-1 max-[880px]:gap-[50px]" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
          <div className="reveal">
            <div className="eyebrow">Get In Touch</div>
            <h2 className="font-serif font-medium mb-6 mt-4">
              Ready for your{" "}
              <span className="italic text-accent">next journey?</span>
            </h2>
            <p className="mb-12 leading-[1.8]">
              Tell us where you&apos;d like to go — or just what kind of trip
              you&apos;ve been craving. A real travel planner replies within
              one working day.
            </p>

            <div className="mb-9">
              <h5 className="text-[11px] uppercase text-accent mb-3 font-semibold" style={{ letterSpacing: "0.3em" }}>
                Office — India
              </h5>
              <p className="font-serif text-[1.15rem] text-ink leading-[1.6]">
                M15, Ground Floor, Regus,
                <br />
                Welldone Tech Park, Sohna Road,
                <br />
                Sector 48, Gurugram – 122018
                <br />
                Haryana, India
              </p>
            </div>

            <div className="mb-9">
              <h5 className="text-[11px] uppercase text-accent mb-3 font-semibold" style={{ letterSpacing: "0.3em" }}>
                Office — USA
              </h5>
              <p className="font-serif text-[1.15rem] text-ink leading-[1.6]">
                212 N. 2nd St. STE 100
                <br />
                Richmond, KY 40475
                <br />
                United States
              </p>
            </div>

            <div className="mb-9">
              <h5 className="text-[11px] uppercase text-accent mb-3 font-semibold" style={{ letterSpacing: "0.3em" }}>
                Reach Us
              </h5>
              <p className="font-serif text-[1.15rem] text-ink leading-[1.6]">
                <span className="font-sans font-semibold uppercase text-muted text-[11px] inline-block w-[50px]" style={{ letterSpacing: "0.15em" }}>
                  India
                </span>
                <a href="tel:+917358013585" className="hover:text-accent">+91 73580 13585</a>
                <br />
                <span className="font-sans font-semibold uppercase text-muted text-[11px] inline-block w-[50px]" style={{ letterSpacing: "0.15em" }}>
                  USA
                </span>
                <a href="tel:+18599788780" className="hover:text-accent">+1 (859) 978-8780</a>
                <br />
                <span className="font-sans font-semibold uppercase text-muted text-[11px] inline-block w-[50px]" style={{ letterSpacing: "0.15em" }}>
                  Email
                </span>
                <a href="mailto:info@imperialtechinnovations.com" className="hover:text-accent">
                  info@imperialtechinnovations.com
                </a>
              </p>
            </div>
          </div>

          <div className="reveal bg-paper border border-line p-[50px] rounded-md max-[880px]:p-[32px_26px]">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
