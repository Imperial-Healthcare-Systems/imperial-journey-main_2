import LazyVideo from "./LazyVideo";

export default function Identity() {
  return (
    <section className="relative py-[160px] text-center text-white overflow-hidden">
      <div data-parallax="0.3" className="absolute inset-x-0 -inset-y-[25%] z-0">
        <LazyVideo
          src="https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,13,13,0.85), rgba(13,13,13,0.7))",
        }}
      />
      <div className="wrap relative z-[2]">
        <h2
          className="reveal-zoom font-serif text-white font-medium max-w-[880px] mx-auto mb-12"
          style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)" }}
        >
          We craft journeys that{" "}
          <span className="italic text-accent-soft">
            tell people who you are.
          </span>
        </h2>
        <div className="reveal-stagger grid grid-cols-2 gap-20 max-w-[980px] mx-auto text-left max-[720px]:grid-cols-1 max-[720px]:gap-[30px]">
          <p className="text-white/85 font-light text-base leading-[1.85]">
            Imperial Journeys is a travel brand of Imperial Healthcare Systems
            Pvt Ltd, with operations across India and the United States. We
            bring a decade of operational discipline to a craft that usually
            runs on charm.
          </p>
          <p className="text-white/85 font-light text-base leading-[1.85]">
            We design successful, memorable trips from the first conversation
            through the last airport farewell — the kind of travel where every
            detail has been handled before you knew it needed to be.
          </p>
        </div>
      </div>
    </section>
  );
}
