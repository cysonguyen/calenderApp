'use server';

import StudentDetail from "@/components/pages/students/StudentDetail";

export default async function StudentPage({ params }) {
    const { id } = await params;
    return <StudentDetail studentId={id} />;
}

