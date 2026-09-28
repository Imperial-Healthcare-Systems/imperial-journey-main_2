type Feature = {
  title: string;
  body: string;
  svg: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Hand-Picked Stays",
    body:
      "From palace suites to mountain lodges — every property personally vetted. We never recommend a hotel we wouldn't book ourselves.",
    svg: (
      <path d="M24 4l5.5 11.5L42 17l-9 8.5L35 38l-11-6-11 6 2-12.5L6 17l12.5-1.5z" />
    ),
  },
  {
    title: "24×7 On-Trip Concierge",
    body:
      "One WhatsApp number. One real person on the other end. Whether it's a flight delay or a dinner reservation, we're on call.",
    svg: (
      <>
        <circle cx="24" cy="24" r="18" />
        <path d="M24 6v18l12 6" />
      </>
    ),
  },
  {
    title: "Truly Custom Itineraries",
    body:
      "No two trips alike. We build from a blank page each time, around your pace, taste, and the kind of memories you actually want.",
    svg: (
      <>
        <path d="M24 4C15 4 8 11 8 20c0 11 16 24 16 24s16-13 16-24c0-9-7-16-16-16z" />
        <circle cx="24" cy="20" r="5" />
      </>
    ),
  },
];

export default function Features() {
  return (
    <section
      id="features-section"
      className="py-[130px] bg-paper max-[600px]:py-[90px]"
    >
      <div className="wrap">
        <div className="reveal text-center mb-20">
          <div className="eyebrow">Why Imperial</div>
          <h2 className="my-4 mx-auto max-w-[780px]">
            Travel planning that{" "}
            <span className="font-serif italic font-medium text-accent">
              respects your time.
            </span>
          </h2>
          <p className="max-w-[620px] mx-auto text-base">
            Three things we believe in. Three reasons our travellers come back,
            and bring their friends with them next time.
          </p>
        </div>

        <div className="reveal grid grid-cols-3 gap-[50px] max-[880px]:grid-cols-1 max-[880px]:gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center p-5 group">
              <div className="relative w-[100px] h-[100px] mx-auto mb-7 grid place-items-center border border-line rounded-full text-accent transition-all duration-[400ms] group-hover:bg-accent group-hover:text-white group-hover:-translate-y-1.5">
                <span className="absolute -inset-2 border border-dashed border-accent-soft rounded-full opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100" />
                <svg
                  viewBox="0 0 48 48"
                  className="w-10 h-10 stroke-current fill-none"
                  strokeWidth={1.4}
                >
                  {f.svg}
                </svg>
              </div>
              <h4 className="font-serif text-[1.5rem] font-medium mb-3.5">
                {f.title}
              </h4>
              <p className="text-sm leading-[1.7]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
