import { cn } from "@/lib/utils";

export function SectionShell({
  id,
  heading,
  intro,
  eyebrow,
  children,
  className,
  tone = "plain",
  headingLevel = 2,
  center = false,
}: {
  id?: string;
  heading?: string;
  intro?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
  tone?: "plain" | "paper" | "stone";
  headingLevel?: 1 | 2;
  center?: boolean;
}) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      id={id}
      className={cn(
        "py-14 sm:py-20",
        tone === "paper" && "bg-paper",
        tone === "stone" && "bg-birch-deep/70",
        className,
      )}
    >
      <div className="container-site">
        {(heading || intro) && (
          <div className={cn("mb-8 max-w-3xl sm:mb-10", center && "mx-auto text-center")}>
            {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
            {heading && <H className="text-3xl sm:text-[2.6rem]">{heading}</H>}
            {intro && <p className="mt-3 text-lg text-slate">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
