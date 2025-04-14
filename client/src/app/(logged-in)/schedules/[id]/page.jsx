import ScheduleDetail from "@/components/pages/schedules/ScheduleDetail";

export default async function ScheduleDetailPage({ params }) {
    const { id } = params;
    return (
        <ScheduleDetail scheduleId={id} />
    )
}