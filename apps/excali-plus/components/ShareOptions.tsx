import { useEffect, useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconLink,
  IconPlayerPlay,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LucideLogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { store } from "@/store/store";
import { setShareDialogOpen } from "@/store/slices/uiSlice";
import { createSeededRoom } from "@/utils/rooms";
import AuthBox from "./AuthBox";

function useCurrentRoomId(): string | null {
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPath = (params?.roomId as string) || null;
  const fromQuery = searchParams.get("roomId");
  return fromPath || fromQuery;
}

export default function ShareOption() {
  const dispatch = useAppDispatch();
  const [localOpen, setLocalOpen] = useState(false);
  const reduxOpen = useAppSelector((s) => s.ui.isShareDialogOpen);
  const open = localOpen || reduxOpen;

  const setOpen = (value: boolean) => {
    setLocalOpen(value);
    if (!value) dispatch(setShareDialogOpen(false));
  };

  return (
    <div className="relative w-full h-full">
      <button
        className="rounded-xl absolute right-3 top-11 z-30 bg-[#6866D4] font-normal cursor-pointer text-white hover:bg-[#5B57CA] px-3 py-[10px] text-sm"
        onClick={() => setOpen(true)}
      >
        Share
      </button>
      {open && <DialogBox setOpen={setOpen} />}
    </div>
  );
}

type Step = "options" | "auth" | "collab" | "share";

const DialogBox = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const router = useRouter();
  const user = useAppSelector((s) => s.user);
  const currentRoomId = useCurrentRoomId();

  // If we're already inside a room, open straight into the collaboration panel.
  const [step, setStep] = useState<Step>(currentRoomId ? "collab" : "options");
  const [busy, setBusy] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  // What to do after a successful login inside the dialog.
  const [pendingAction, setPendingAction] = useState<"session" | "export" | null>(
    null,
  );

  const handleClose = () => setOpen(false);

  const startSession = async () => {
    if (!user.userId) {
      setPendingAction("session");
      setStep("auth");
      return;
    }
    setBusy(true);
    try {
      const elements = store.getState().canvas.elements;
      const roomId = await createSeededRoom(elements);
      store.dispatch(setShareDialogOpen(true));
      router.push(`/canvas/${roomId}`);
    } catch (err) {
      console.error("Failed to start session", err);
      setBusy(false);
    }
  };

  const exportToLink = async () => {
    if (!user.userId) {
      setPendingAction("export");
      setStep("auth");
      return;
    }
    setBusy(true);
    try {
      const elements = store.getState().canvas.elements;
      const roomId = await createSeededRoom(elements);
      setShareLink(`${window.location.origin}/canvas/${roomId}?view=1`);
      setStep("share");
    } catch (err) {
      console.error("Failed to export link", err);
    } finally {
      setBusy(false);
    }
  };

  const onAuthed = () => {
    if (pendingAction === "export") exportToLink();
    else startSession();
  };

  const renderBox = () => {
    switch (step) {
      case "options":
        return (
          <OptionBox
            loggedIn={!!user.userId}
            busy={busy}
            onStartSession={startSession}
            onExport={exportToLink}
          />
        );
      case "auth":
        return <AuthBox handleClose={handleClose} onSuccess={onAuthed} />;
      case "collab":
        return (
          <CollabBox
            roomId={currentRoomId}
            onStop={() => {
              store.dispatch(setShareDialogOpen(false));
              router.push("/");
            }}
          />
        );
      case "share":
        return <ShareBox link={shareLink} />;
    }
  };

  return (
    <div
      onClick={() => setOpen(false)}
      className="absolute inset-0 z-20 bg-black/20 flex justify-center items-center"
    >
      {renderBox()}
    </div>
  );
};

const OptionBox = ({
  loggedIn,
  busy,
  onStartSession,
  onExport,
}: {
  loggedIn: boolean;
  busy: boolean;
  onStartSession: () => void;
  onExport: () => void;
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex gap-5 flex-col items-center w-[calc(100vw-24px)] max-w-[548px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-10 z-20 bg-white border-neutral-400"
    >
      <div className="w-full flex flex-col items-center gap-6 max-w-md">
        <h1 className="text-center text-lg font-extrabold text-[#6866D4]">
          Live Collaboration
        </h1>
        <div className="text-xs font-medium flex flex-col gap-4 text-center">
          <p>Invite people to collaborate on your drawing.</p>
          <p>Changes sync in real time for everyone in the session.</p>
        </div>
        <button
          disabled={busy}
          className="rounded-xl gap-2 items-center font-semibold flex w-fit bg-[#6866D4] cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] text-sm disabled:opacity-60"
          onClick={onStartSession}
        >
          <span>
            {loggedIn ? (
              <IconPlayerPlay size={18} stroke={2} />
            ) : (
              <LucideLogIn stroke="white" size={20} />
            )}
          </span>
          {busy ? "Starting…" : loggedIn ? "Start session" : "Sign in to continue"}
        </button>
      </div>
      <div className="flex items-center gap-3 w-full">
        <div className="h-px bg-neutral-300 w-full" />
        Or
        <div className="h-px bg-neutral-300 w-full" />
      </div>
      <div className="w-full flex flex-col items-center gap-6 max-w-sm">
        <h1 className="text-center text-lg font-extrabold text-[#6866D4]">
          Shareable Link
        </h1>
        <div className="text-xs font-medium flex flex-col gap-4 text-center">
          <p>Export as a read-only link.</p>
        </div>
        <button
          disabled={busy}
          className="rounded-xl gap-2 items-center font-semibold flex w-fit bg-[#6866D4] cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] text-sm disabled:opacity-60"
          onClick={onExport}
        >
          <span>
            <IconLink size={18} stroke={2} />
          </span>
          {busy ? "Preparing…" : "Export to Link"}
        </button>
      </div>
    </div>
  );
};

function CopyLinkRow({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  return (
    <div className="flex gap-3">
      <input
        readOnly
        className="w-full flex-1 rounded-xl bg-[#F1F0FE] border-[#C5C5CF] text-sm border px-3"
        value={link}
      />
      <button
        onClick={copy}
        className="rounded-xl w-fit gap-2 flex font-semibold items-center bg-[#6866D4] text-sm cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px]"
      >
        <span>
          {copied ? <IconCheck size={18} stroke={2} /> : <IconCopy size={18} stroke={2} />}
        </span>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

const CollabBox = ({
  roomId,
  onStop,
}: {
  roomId: string | null;
  onStop: () => void;
}) => {
  const [link, setLink] = useState("");
  useEffect(() => {
    if (roomId) setLink(`${window.location.origin}/canvas/${roomId}`);
  }, [roomId]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex gap-5 flex-col items-start w-[calc(100vw-24px)] max-w-[548px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-10 z-20 bg-white border-neutral-400"
    >
      <h1 className="font-extrabold text-xl">Live Collaboration</h1>
      <div className="flex flex-col w-full gap-5">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-semibold text-sm">Link</h1>
          <CopyLinkRow link={link} />
        </div>
        <div className="bg-neutral-200 h-px w-full" />
        <p className="text-xs tracking-wide font-thin">
          Anyone with this link can join and edit the scene together with you.
          <br />
          <br />
          Stopping the session will disconnect you from the room, but you&apos;ll be
          able to continue working with the scene locally.
        </p>
        <button
          onClick={onStop}
          className="rounded-xl self-center w-fit gap-2 border border-[#CD6F69] flex font-semibold items-center text-sm text-[#CD6F69] cursor-pointer hover:bg-[#fdf1f0] px-5 py-[12px]"
        >
          <span>
            <IconPlayerStopFilled stroke={2} />
          </span>
          Stop Session
        </button>
      </div>
    </div>
  );
};

const ShareBox = ({ link }: { link: string }) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex gap-5 flex-col items-start w-[calc(100vw-24px)] max-w-[548px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-10 z-20 bg-white border-neutral-400"
    >
      <h1 className="font-extrabold text-xl">Shareable Link</h1>
      <div className="flex flex-col w-full gap-5">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-semibold text-sm">Read-only link</h1>
          <CopyLinkRow link={link} />
        </div>
        <div className="bg-neutral-200 h-px w-full" />
        <p className="text-xs font-thin">
          Anyone with this link can view a read-only snapshot of your scene.
        </p>
      </div>
    </div>
  );
};
