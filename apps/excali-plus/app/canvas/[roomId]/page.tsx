import { RoomCanvas } from "@/components/pages/RoomCanvas";

export default async function CanvasPage ({ params, searchParams }:{
    params: Promise<{
        roomId: string
    }>,
    searchParams: Promise<{ view?: string }>
}) {
    const roomId = (await params).roomId
    const view = (await searchParams).view === "1"

    return <RoomCanvas roomId={roomId} view={view} />
}