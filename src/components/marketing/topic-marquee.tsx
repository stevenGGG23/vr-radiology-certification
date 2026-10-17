const topics = [
  "eFAST", "RUSH protocol", "Lung sliding", "B-lines", "Pericardial effusion", "IVC assessment", "AAA screening",
  "Two-point DVT", "Gallbladder", "Hydronephrosis", "Ultrasound-guided IVs", "Central lines", "Chest radiographs",
  "Fracture patterns", "CT head", "Knobology", "Artifacts",
];

/** Slow-scrolling band of topics covered across the catalog. Pauses on hover. */
export function TopicMarquee() {
  const row = [...topics, ...topics];
  return (
    <section aria-label="Topics covered" className="on-dark border-t border-white/10 bg-[#071528] py-4">
      <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex shrink-0 animate-[marquee_60s_linear_infinite] items-center gap-8 pr-8 group-hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <li key={i} className="flex items-center gap-8 whitespace-nowrap text-[14.5px] font-semibold text-bone-dim">
              {t}
              <span className="h-1.5 w-1.5 rounded-full bg-[#35a3de]" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
