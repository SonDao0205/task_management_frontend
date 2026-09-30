import WorkspacePage from "@/src/features/dashboard/pages/WorkspacePage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkspacePage workspaceId={Number(id)}/>;
}
