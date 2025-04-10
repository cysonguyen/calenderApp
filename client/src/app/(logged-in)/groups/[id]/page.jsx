import GroupDetail from "@/components/pages/groups/GroupDetail";

export default async function GroupPage({ params }) {
    const { id } = await params;
    return <GroupDetail groupId={id} />;
}
