type Service = {
  title: string;
  body: string;
  svg: React.ReactNode;
};

const SERVICES: Service[] = [
  {
    title: "Heritage Stays",
    body:
      "Forts, havelis, and royal residences turned boutique hotels — across Rajasthan, Madhya Pradesh, and beyond.",
    svg: <path d="M8 56V32l24-20 24 20v24M22 56V40h20v16M28 30h8" />,
  },
  {
    title: "International Holidays",
    body:
      "Switzerland, Japan, Africa, Iceland — fully-managed itineraries with visa, flight, and on-ground support handled.",
    svg: (
      <>
        <circle cx="32" cy="32" r="24" />
        <path d="M8 32h48M32 8c8 8 8 40 0 48M32 8c-8 8-8 40 0 48" />
      </>
    ),
  },
  {
    title: "Mountain Retreats",
    body:
      "Himalayan lodges, hill-station hideaways, and trekking with luxury basecamps. Slow travel, properly done.",
    svg: <path d="M12 44L32 14l20 30M16 44h32M24 44v-8h16v8M30 36v8" />,
  },
  {
    title: "Backwaters & Beaches",
    body:
      "Kerala houseboats, Andaman privates, Maldives villas — saltwater, silence, and the right kind of sunsets.",
    svg: (
      <path d="M8 38c8 0 8-6 16-6s8 6 16 6 8-6 16-6M8 50c8 0 8-6 16-6s8 6 16 6 8-6 16-6M28 24l8-8 8 8M36 16v16" />
    ),
  },
  {
    title: "Wildlife & Safari",
    body:
      "Ranthambore, Kaziranga, the Serengeti — guided by naturalists who know which jeep to take and when to wait.",
    svg: (
      <>
        <circle cx="24" cy="32" r="14" />
        <circle cx="44" cy="32" r="6" />
        <path d="M10 50h44M22 28l4 4 8-8" />
      </>
    ),
  },
  {
    title: "Corporate & MICE",
    body:
      "Off-sites, leadership retreats, incentive trips, and conferences — managed end-to-end with proper hospitality muscle.",
    svg: <path d="M32 8L8 24v32h48V24L32 8zM24 56V36h16v20M16 30v6M48 30v6" />,
  },
];

export default function Services() {
  return (
    <section
      id="services-section"
      className="py-[130px] bg-paper max-[600px]:py-[90px]"
    >
      <div className="wrap">
        <div className="reveal text-center mb-20">
          <div className="eyebrow">What We Do</div>
          <h2 className="my-4 mx-auto max-w-[780px]">
            Six ways to{" "}
            <span className="font-serif italic font-medium text-accent">
              travel imperially.
            </span>
          </h2>
          <p className="max-w-[620px] mx-auto text-base">
            Whether you&apos;re planning a honeymoon, a family multi-gen trip,
            or a board-level retreat — start with one of these and we&apos;ll
            tailor from there.
          </p>
        </div>

        <div className="reveal grid grid-cols-3 border-t border-l border-line max-[880px]:grid-cols-2 max-[540px]:grid-cols-1">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="relative px-10 py-[60px] text-center bg-paper border-r border-b border-line transition-all duration-500 hover:bg-offwhite hover:-translate-y-1 group"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] bg-accent transition-all duration-500 w-0 group-hover:w-[60%]"
              />
              <div className="w-20 h-20 mx-auto mb-7 text-accent transition-transform duration-500 group-hover:scale-110">
                <svg
                  viewBox="0 0 64 64"
                  className="w-full h-full stroke-current fill-none"
                  strokeWidth={1.2}
                >
                  {s.svg}
                </svg>
              </div>
              <h4 className="font-serif text-[1.4rem] font-medium mb-3.5">
                {s.title}
              </h4>
              <p className="text-sm leading-[1.7]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
