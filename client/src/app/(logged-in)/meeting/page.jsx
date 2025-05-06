'use server'

import MeetingDetail from "@/components/pages/meeting/MeetingDetail";

export default async function MeetingDetailPage({ searchParams }) {
    // Await searchParams để đảm bảo rằng bạn có dữ liệu trước khi sử dụng các thuộc tính của nó
    const { id, scheduleId, indexCycle } = await searchParams;  // Đảm bảo await searchParams

    return (
        <MeetingDetail id={id} scheduleId={scheduleId} indexCycle={indexCycle} />
    )
}