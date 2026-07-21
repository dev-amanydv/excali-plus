"use client"
import { Suspense } from "react"
import { RoomCanvas } from "@/components/pages/RoomCanvas";
import { useSearchParams } from "next/navigation";

function HomeInner() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')
  const view = searchParams.get('view') === '1'

  return <RoomCanvas roomId={roomId} view={view} />
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  )
}
