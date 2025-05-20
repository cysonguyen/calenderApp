'use server';

import StaffDetail from "@/components/pages/staffs/StaffDetail";

export default async function StaffPage({ params }) {
    const { id } = await params;
    return <StaffDetail staffId={id} />;
}

