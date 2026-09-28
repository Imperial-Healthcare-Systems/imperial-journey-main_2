import { SOCIAL_LINKS } from "../data/social";

export default function TopBar() {
  return (
    <div className="bg-ink text-white/70 text-[12px] py-3 font-light relative z-[50]">
      <div className="wrap flex justify-between items-center gap-6 flex-wrap">
        <div className="flex gap-7 flex-wrap max-[600px]:gap-3.5 max-[600px]:text-[11px]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true">📍</span>
            Gurugram, India · Richmond, KY
          </span>
          <span className="inline-flex items-center gap-2 max-[980px]:hidden">
            <span aria-hidden="true">📞</span>
            <a href="tel:+917358013585" className="hover:text-accent-soft transition-colors">
              +91 73580 13585
            </a>
          </span>
          <span className="inline-flex items-center gap-2 max-[980px]:hidden">
            <span aria-hidden="true">✉️</span>
            <a
              href="mailto:info@imperialtechinnovations.com"
              className="hover:text-accent-soft transition-colors"
            >
              info@imperialtechinnovations.com
            </a>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="inline-flex items-center justify-center w-7 h-7 border border-white/15 rounded-full text-white/70 ml-0.5 transition-all duration-300 hover:bg-accent hover:border-accent hover:text-white [&>svg]:w-3.5 [&>svg]:h-3.5"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
