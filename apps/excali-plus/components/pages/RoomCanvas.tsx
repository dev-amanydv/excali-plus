"use client"
import { WS_URL } from "@/config"
import { useEffect, useRef, useState } from "react"
import Canvas from "../Canvas"
import { useAppDispatch } from "@/store/store"
import { loadElements } from "@/store/slices/canvasSlice"
import { getStoredToken } from "@/store/slices/userSlice"
import { api } from "@/utils/api"
import { useRouter } from "next/navigation"
import type { ExcalidrawElement } from "@/types/canvas"

export function RoomCanvas({
    roomId,
    view = false,
}: {
    roomId?: string | null
    view?: boolean
}) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const needsSocket = !!roomId && !view
    const [status, setStatus] = useState<"connecting" | "ready" | "error">(
        needsSocket ? "connecting" : "ready",
    )
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
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
            setIsAuthed(false)
            return
        }
        setIsAuthed(true)

        let cancelled = false
        let retryCount = 0
        const maxRetries = 10
        let retryTimer: ReturnType<typeof setTimeout> | null = null

        function connect() {
            const ws = new WebSocket(WS_URL)
            socketRef.current = ws

            ws.onopen = () => {
                retryCount = 0
                ws.send(JSON.stringify({ type: "auth", token }))
                ws.send(
                    JSON.stringify({
                        type: "join-room",
                        roomId: Number(roomId),
                    }),
                )
            }

            ws.onmessage = (event) => {
                if (cancelled) return
                try {
                    const msg = JSON.parse(event.data)
                    if (msg.msg?.startsWith("Room:")) {
                        setSocket(ws)
                        setStatus("ready")
                    }
                } catch {}
            }

            ws.onerror = () => {
                if (!cancelled) setStatus("error")
            }

            ws.onclose = (e) => {
                if (cancelled) return
                setSocket(null)
                if (e.code === 4001) {
                    setIsAuthed(false)
                    return
                }
                if (retryCount < maxRetries) {
                    retryCount++
                    const delay = Math.min(1000 * 2 ** retryCount, 30000)
                    retryTimer = setTimeout(connect, delay)
                } else {
                    setStatus("error")
                }
            }
        }

        connect()

        return () => {
            cancelled = true
            if (retryTimer) clearTimeout(retryTimer)
            const ws = socketRef.current
            if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                ws.close()
            }
        }
    }, [needsSocket, roomId])

    useEffect(() => {
        if (isAuthed === false) {
            const currentPath = roomId
                ? `/canvas/${roomId}${view ? "?view=1" : ""}`
                : "/"
            router.replace(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`)
        }
    }, [isAuthed, roomId, view, router])

    if (isAuthed === null && needsSocket) {
        return (
            <div className="w-screen h-screen flex items-center justify-center text-neutral-500">
                Checking authentication…
            </div>
        )
    }

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
                <p className="text-sm">Please try again later.</p>
            </div>
        )
    }

    return <Canvas roomId={roomId} socket={socket} view={view} />
}
