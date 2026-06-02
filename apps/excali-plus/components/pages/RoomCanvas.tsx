"use client"
import { JWT_TOKEN, WS_URL } from "@/config"
import { useEffect, useState } from "react"
import Canvas from "../Canvas"


export function RoomCanvas ({roomId}: {
    roomId?: string | null
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${JWT_TOKEN}`)
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join-room",
                roomId: Number(roomId)
            }))
        }
    }, [])

    if (roomId && !socket){
        return <div>
            Connecting to server
        </div>
    }
    
    return (
        <Canvas roomId={roomId} socket={socket}  />
    )
}