import { loadNodes } from "@/content/load";
import { MapExperience } from "@/components/map/MapExperience";

export default function HomePage() {
  const nodes = loadNodes();
  return <MapExperience nodes={nodes} />;
}
