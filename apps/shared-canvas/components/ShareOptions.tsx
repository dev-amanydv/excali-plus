import { useState } from "react";
import { IconCopy, IconLink, IconPlayerPlay, IconPlayerStop, IconPlayerStopFilled } from "@tabler/icons-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { randomUUID } from "crypto";

export default function ShareOption() {
  const [open, setOpen] = useState(false);

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

const DialogBox = ({ setOpen }: { setOpen: (str: boolean) => void }) => {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    setOpen(false);
    setStep(1)
  }

  const renderBox = () => {
    switch (step) {
      case 1:
        return <OptionBox setStep={setStep} handleClose={handleClose} />;
      case 2:
        return <CollabBox handleClose={handleClose} />;
      case 3:
        return <ShareBox />;
    }
  };
  return (
    <div
      onClick={() => setOpen(false)}
      className="absolute inset-0 z-20 bg-black/20 flex justify-center items-center "
    >
      {renderBox()}
    </div>
  );
};

const OptionBox = ({
  setStep,
  handleClose
}: {
  setStep: (num: number) => void;
  handleClose: () => void;
}) => {
  const handleSession = async () => {
    const res = await axios.post(`${HTTP_BACKEND}/rooms/create`, {
      id: randomUUID()
    })
    
    console.log("ROOM: ", res)
    setStep(2)
  }
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className=" flex gap-5 flex-col items-center fixed max-w-[548px] w-full max-h-[506px] h-full rounded-2xl p-[40px] z-20 bg-white border-neutral-400 "
    >
      <div className="w-full flex flex-col items-center gap-6 max-w-md">
        <h1 className="text-center text-lg font-extrabold text-[#6866D4]">
          Live Collaboration
        </h1>
        <div className="text-xs tracking-wider font-thin flex flex-col gap-4 text-center">
          <p className="">Invite people to collaborate on your drawing.</p>
          <p>
            Don't worry, the session is end to end encrypted, and fully private.
            Not even our server can see what you draw.
          </p>
        </div>
        <button
          className="rounded-xl gap-2 items-center font-semibold flex w-fit bg-[#6866D4] cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] text-sm"
          onClick={handleSession}
        >
          <span>
            <IconPlayerPlay size={18} stroke={2} />
          </span>
          Start session
        </button>
      </div>
      <div className="flex items-center gap-3 w-full">
        <div className="h-px bg-neutral-300 w-full" />
        Or
        <div className="h-px bg-neutral-300 w-full" />
      </div>
      <div className="w-full flex flex-col items-center gap-6 max-w-sm">
        <h1 className="text-center text-lg font-extrabold text-[#6866D4]">
          Sharable Link
        </h1>
        <div className="text-xs tracking-wider font-thin flex flex-col gap-4 text-center">
          <p className="">Export as read-only link.</p>
        </div>
        <button
          className="rounded-xl gap-2 items-center font-semibold flex w-fit bg-[#6866D4] cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] text-sm"
          onClick={() => setStep(3)}
        >
          <span>
            <IconLink size={18} stroke={2} />
          </span>
          Export to Link
        </button>
      </div>
    </div>
  );
};

const CollabBox = (
  {
    handleClose
  }: {
    handleClose: () => void;
  }
) => {
  function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000)
  }

  const handleCopy = () => {
    window.navigator.clipboard
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className=" flex gap-5 flex-col items-start fixed max-w-[548px] w-full max-h-[736px] h-full rounded-2xl p-[40px] z-20 bg-white border-neutral-400 ">
      <h1 className="font-extrabold text-xl">Live Collaboration</h1>
      <div className=" flex flex-col w-full gap-5">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-semibold text-sm">Your Name</h1>
          <div className="flex gap-3">
            <input readOnly
              className="w-full flex-1 rounded-xl bg-[#F1F0FE] border border-transparent  text-sm py-[14px] box-border hover:border hover:border-[#6866D4] px-3"
              value={
                "https://excalidraw.com/#json=ZawhCAaCXGi-oiFEs558u,RcAE1viPrqqf_gXCjWtJpg"
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-semibold text-sm">Link</h1>
          <div className="flex gap-3">
            <input readOnly
              className="w-full flex-1 rounded-xl bg-[#F1F0FE] border-[#C5C5CF] text-sm border px-3"
              value={
                "https://excalidraw.com/#json=ZawhCAaCXGi-oiFEs558u,RcAE1viPrqqf_gXCjWtJpg"
              }
            />
            <button className="rounded-xl w-fit gap-2 flex font-semibold items-center bg-[#6866D4] text-sm cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] ">
              <span>
                <IconCopy size={18} stroke={2} />
              </span>{" "}
              Copy link
            </button>
          </div>
        </div>
        <div className="w-full h-full flex justify-center">
          <div className="p-6 border size-44 border-neutral-200 rounded-xl">
            <div className=" bg-neutral-200 h-full w-full"></div>
          </div>
        </div>
        <div className="bg-neutral-200 h-px w-full" />
        <p className="text-xs tracking-wide font-thin">
          🔒 Don't worry, the session is end-to-end encrypted, and fully
          private. Not even our server can see what you draw.
          <br />
          <br />
          Stopping the session will disconnect you from the room, but you'll be
          able to continue working with the scene, locally. Note that this won't
          affect other people, and they'll still be able to collaborate on their
          version.
        </p>
        <button onClick={() => handleClose()} className="rounded-xl self-center  w-fit gap-2 border border-[#CD6F69] flex font-semibold items-center text-sm text-[#CD6F69] cursor-pointer hover:border-[#CD6F69] px-5 py-[12px] ">
          <span>
            <IconPlayerStopFilled stroke={2} />
          </span>{" "}
          Stop Session
        </button>
      </div>
    </div>
  );
};

const ShareBox = () => {
  return (
    <div onClick={(e) => e.stopPropagation()} className=" flex gap-5 flex-col items-start fixed max-w-[548px] w-full max-h-[286px] h-full rounded-2xl p-[40px] z-20 bg-white border-neutral-400 ">
      <h1 className="font-extrabold text-xl">Shareable Link</h1>
      <div className=" flex flex-col w-full gap-5">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-semibold text-sm">Link</h1>
          <div className="flex gap-3">
            <input readOnly
              className="w-full flex-1 rounded-xl bg-[#F1F0FE] border-[#C5C5CF] text-sm border px-3"
              value={
                "https://excalidraw.com/#json=ZawhCAaCXGi-oiFEs558u,RcAE1viPrqqf_gXCjWtJpg"
              }
            />
            <button className="rounded-xl w-fit gap-2 flex font-semibold items-center bg-[#6866D4] text-sm cursor-pointer text-white hover:bg-[#5B57CA] px-5 py-[14px] ">
              <span>
                <IconCopy size={18} stroke={2} />
              </span>{" "}
              Copy link
            </button>
          </div>
        </div>
        <div className="bg-neutral-200 h-px w-full" />
        <p className="text-xs font-thin">
          🔒 The upload has been secured with end-to-end encryption, which means
          that Excalidraw server and third parties can't read the content.
        </p>
      </div>
    </div>
  );
};
