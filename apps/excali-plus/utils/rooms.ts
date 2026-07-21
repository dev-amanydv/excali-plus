import { api } from "@/utils/api";
import type { ExcalidrawElement } from "@/types/canvas";

export async function createRoom(): Promise<number> {
  const res = await api.post("/rooms/create");
  return res.data.data.roomId as number;
}

export async function saveElementsToRoom(
  roomId: number,
  elements: ExcalidrawElement[],
): Promise<void> {
  const payload = elements.filter((el) => !el.isDeleted);
  await api.post(`/rooms/${roomId}/elements`, { elements: payload });
}

export async function createSeededRoom(
  elements: ExcalidrawElement[],
): Promise<number> {
  const roomId = await createRoom();
  if (elements.length > 0) {
    await saveElementsToRoom(roomId, elements);
  }
  return roomId;
}
