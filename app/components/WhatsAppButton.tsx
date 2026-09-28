const PHONE = "917358013585";
const PRESET_MESSAGE =
  "Hi Imperial Journeys! I'd like to plan a trip — could you help?";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(PRESET_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full grid place-items-center transition-all duration-300 hover:scale-110 max-[600px]:bottom-4 max-[600px]:right-4"
      style={{
        background: "#25D366",
        boxShadow: "0 8px 24px -4px rgba(37,211,102,0.55)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: "#25D366", opacity: 0.35 }}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7 relative"
      >
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.01 0C5.41 0 .04 5.37.04 12c0 2.12.55 4.18 1.6 6L0 24l6.16-1.62a11.92 11.92 0 0 0 5.85 1.5h.01c6.6 0 11.97-5.37 11.97-12 0-3.2-1.25-6.21-3.47-8.4zm-8.51 18.4h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.21-3.65.96.97-3.56-.24-.37a9.92 9.92 0 0 1-1.52-5.31c0-5.49 4.47-9.96 9.96-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.96 9.96zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
