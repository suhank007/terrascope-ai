import type { Metadata } from "next";
import { DemoExperience } from "@/features/demo/components/demo-experience";

export const metadata: Metadata = {
  title: "TerraScope AI — Demo Mode",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoExperience />;
}
