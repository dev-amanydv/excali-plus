"use client"
import { WS_URL } from "@/config"
import { useEffect, useRef, useState } from "react"
import Canvas from "../Canvas"
import { useAppDispatch } from "@/store/store"
import { loadElements } from "@/store/slices/canvasSlice"
import { getStoredToken } from "@/store/slices/userSlice"
import { api } from "@/utils/api"
import type { ExcalidrawElement } from "@/types/canvas"

export function RoomCanvas({
    roomId,
    view = false,
}: {
    roomId?: string | null
    view?: boolean
}) {
    const dispatch = useAppDispatch()
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const needsSocket = !!roomId && !view
    const [status, setStatus] = useState<"connecting" | "ready" | "error">(
        needsSocket ? "connecting" : "ready",
    )
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!roomId) return
        let cancelled = false
        api
            .get(`/chats/${roomId}`)
            .then((res) => {
                if (cancelled) return
                const elements: ExcalidrawElement[] = res.data?.data?.chats ?? []
                dispatch(loadElements({ elements, files: {} }))
            })
            .catch((err) => console.error("Failed to load room elements", err))
        return () => {
            cancelled = true
        }
    }, [roomId, dispatch])

    useEffect(() => {
        if (!needsSocket) return
        const token = getStoredToken()
        if (!token) {
            setStatus("error")
            return
        }
        const ws = new WebSocket(`${WS_URL}?token=${token}`)
        socketRef.current = ws
        ws.onopen = () => {
            setSocket(ws)
            setStatus("ready")
            ws.send(
                JSON.stringify({
                    type: "join-room",
                    roomId: Number(roomId),
                }),
            )
        }
        ws.onerror = () => setStatus("error")
        return () => {
            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {
                ws.close()
            }
        }
    }, [needsSocket, roomId])

    if (needsSocket && status === "connecting") {
        return (
            <div className="w-screen h-screen flex items-center justify-center text-neutral-500">
                Connecting to server…
            </div>
        )
    }

    if (needsSocket && status === "error") {
        return (
            <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center text-neutral-600">
                <p className="font-medium">Couldn&apos;t connect to the session.</p>
                <p className="text-sm">Please sign in and try again.</p>
            </div>
        )
    }

    return <Canvas roomId={roomId} socket={socket} view={view} />
}
