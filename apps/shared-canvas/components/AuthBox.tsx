import { IconCopy, IconPlayerStopFilled } from "@tabler/icons-react"
import GoogleLoginBtn from "./GoogleLoginBtn"

export default function AuthBox({
    handleClose
}: {
    handleClose: () => void
}) {
    return (
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-5 fixed max-w-137 w-full max-h-134 h-full rounded-2xl p-10 z-20 bg-white border-neutral-400 ">
            <h1 className="font-semibold tracking-tight text-3xl w-xs ">Your first session is just a signup away.</h1>
            <GoogleLoginBtn />
            
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-sm font-medium">Email</h1>
                        <input type="text" className="w-full bg-neutral-50 py-1 text-md rounded-md border border-neutral-200 px-4 focus:outline-3 focus:outline-neutral-100 focus:border-neutral-300 focus:border" placeholder="ay.work07@gmail.com" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-sm font-medium">Password</h1>
                        <input type="text" className="w-full bg-neutral-50 py-1 text-md rounded-md border border-neutral-200 px-4 focus:outline-3 focus:outline-neutral-100 focus:border-neutral-300 focus:border" placeholder="******" />
                    </div>
                </div>
                <button className="w-full bg-neutral-800 h-10 rounded-lg text-white hover:bg-black cursor-pointer">
                    Register
                </button>
            </div>

        </div>
    )
}