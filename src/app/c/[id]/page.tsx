import { notFound } from "next/navigation";
import { loadNodes, indexById } from "@/content/load";
import { MapExperience } from "@/components/map/MapExperience";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return loadNodes().map((n) => ({ id: n.id }));
}

export default async function ConceptPage({ params }: Props) {
  const { id } = await params;
  const nodes = loadNodes();
  const byId = indexById(nodes);
  if (!byId.has(id)) notFound();
  return <MapExperience nodes={nodes} initialFocusId={id} />;
}
