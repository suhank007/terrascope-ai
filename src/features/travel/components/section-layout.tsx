import { SectionNav, type NavSection } from "./section-nav";

/** Reading column plus a sticky "On this page" rail. One layout for every long travel page. */
export function SectionLayout({ sections, children }: { sections: NavSection[]; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="order-2 min-w-0 lg:order-none">{children}</div>
      <div className="order-1 lg:order-none">
        <SectionNav sections={sections} />
      </div>
    </div>
  );
}
