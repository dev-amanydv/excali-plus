"use client"
import { RoomCanvas } from "@/components/pages/RoomCanvas";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')

  return <RoomCanvas roomId={roomId} />
}