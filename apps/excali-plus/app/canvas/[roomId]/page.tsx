import { RoomCanvas } from "@/components/pages/RoomCanvas";

export default async function CanvasPage ({ params }:{
    params: {
        roomId: string
    }
}) { 
    const roomId = (await params).roomId

    return <RoomCanvas roomId={roomId} />
}