import { Mrs_Saint_Delafield } from "next/font/google";
import { useId } from "react";
import { LogoMark } from "@/components/ui/brand";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

const signature = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400" });

export interface CertificateData {
  id: string;
  recipientName: string;
  courseTitle: string;
  courseCode: string;
  ceHours: number;
  /** Kept on the record for the academy; never printed. Certificates are pass/fail. */
  score?: number;
  issuedAt: string;
}

function Guilloche() {
  const paths = Array.from({ length: 9 }, (_, i) => {
    const amp = 6 + i * 1.4;
    const pts: string[] = [];
    for (let x = 0; x <= 1000; x += 10) {
      const y = 30 + amp * Math.sin((x / 1000) * Math.PI * 14 + i * 0.6) * Math.cos((x / 1000) * Math.PI * 3);
      pts.push(`${x},${y.toFixed(2)}`);
    }
    return `M${pts.join(" L")}`;
  });
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
      ))}
    </svg>
  );
}

/** Holographic seal. Both animations stop in print so the PDF shows a still frame. */
function Seal() {
  const ringId = useId();
  return (
    <div className="relative grid aspect-square w-[15cqw] place-items-center">
      <div className="holo absolute inset-0 rounded-full opacity-90 print:animate-none" />
      <div className="absolute inset-[6%] rounded-full bg-paper" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_40s_linear_infinite] print:animate-none">
        <defs>
          <path id={ringId} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <text fontSize="7.4" letterSpacing="2.4" fill="#16171b" fontFamily="var(--font-plex-mono)">
          <textPath href={`#${ringId}`}>VERIFIED · SONOSUS VR EDUCATION ·</textPath>
        </text>
      </svg>
      <LogoMark className="relative h-[38%] w-[38%] text-paper-ink" />
    </div>
  );
}

export function Certificate({
  data,
  accreditation,
  className,
  shadow = true,
}: {
  data: CertificateData;
  accreditation?: string;
  className?: string;
  /** Built-in drop shadow; turn off when the parent supplies its own. */
  shadow?: boolean;
}) {
  return (
    <div className={cn("@container [-webkit-print-color-adjust:exact] [print-color-adjust:exact]", className)}>
      <div className={cn("relative aspect-[1.414/1] w-full overflow-hidden rounded-[0.6cqw] bg-paper text-paper-ink print:shadow-none", shadow && "shadow-[0_40px_120px_-30px_rgba(0,0,0,.7)]")}>
        <div className="absolute inset-[2.2cqw] border border-paper-ink/25" />
        <div className="absolute inset-[2.8cqw] border-[0.25cqw] border-double border-paper-ink/35" />
        <div className="absolute inset-x-[2.8cqw] top-[2.8cqw] h-[5cqw] text-[#b38b2e]/70">
          <Guilloche />
        </div>
        <div className="absolute inset-x-[2.8cqw] bottom-[2.8cqw] h-[5cqw] rotate-180 text-[#b38b2e]/70">
          <Guilloche />
        </div>

        <div className="relative flex h-full flex-col items-center px-[9cqw] pb-[7.5cqw] pt-[8.5cqw] text-center">
          <div className="flex items-center gap-[1.2cqw]">
            <LogoMark className="h-[3.4cqw] w-[3.4cqw]" />
            <span className="font-mono text-[1.35cqw] uppercase tracking-[0.35em]">{site.name}</span>
          </div>
          <h3 className="mt-[2.6cqw] font-serif font-normal text-[5.4cqw] leading-none tracking-[-0.01em]">Certificate of Completion</h3>
          <p className="mt-[2.2cqw] text-[1.45cqw] uppercase tracking-[0.25em] text-paper-ink/60">This certifies that</p>
          <p className="mt-[1.3cqw] font-serif text-[5cqw] italic leading-none">{data.recipientName}</p>
          <div className="mt-[1.2cqw] h-px w-[46cqw] bg-paper-ink/25" />
          <p className="mt-[1.8cqw] max-w-[66cqw] text-[1.6cqw] leading-[1.5] text-paper-ink/80">
            has completed <span className="font-semibold text-paper-ink">{data.courseTitle}</span> ({data.courseCode}) and
            successfully passed the final examination.
          </p>

          <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end gap-[3cqw]">
            <div className="text-left">
              <div className={cn(signature.className, "text-[4.6cqw] leading-[0.8] text-[#1d2a55]")}>Susanna Rudy</div>
              <div className="mt-[0.6cqw] h-px w-full bg-paper-ink/40" />
              <div className="mt-[0.7cqw] text-[1.2cqw] leading-snug">
                {site.instructor.display}, {site.instructor.credentials.split(",")[0]}
                <br />
                <span className="text-paper-ink/60">Course Director</span>
              </div>
            </div>
            <Seal />
            <dl className="grid grid-cols-2 gap-x-[2cqw] gap-y-[1cqw] text-left text-[1.15cqw]">
              <div>
                <dt className="uppercase tracking-[0.16em] text-paper-ink/55">Issued</dt>
                <dd className="mt-[0.2cqw] font-mono">{formatDate(data.issuedAt, "short")}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.16em] text-paper-ink/55">Contact hrs</dt>
                <dd className="mt-[0.2cqw] font-mono">{data.ceHours.toFixed(1)}*</dd>
              </div>
              <div className="col-span-2">
                <dt className="uppercase tracking-[0.16em] text-paper-ink/55">Certificate ID</dt>
                <dd className="mt-[0.2cqw] font-mono">{data.id}</dd>
              </div>
            </dl>
          </div>
          <p className="absolute inset-x-[9cqw] bottom-[4.4cqw] text-[0.95cqw] leading-snug text-paper-ink/55">
            Verify at {site.domain}/verify · {accreditation ?? "*Credit designation pending accreditation."}
          </p>
        </div>
      </div>
    </div>
  );
}
