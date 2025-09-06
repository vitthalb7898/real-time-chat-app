import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { HOST, LOGOUT_ROUTE } from "@/config/constants";
import { getcolor } from "@/lib/utils";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip"
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { login } from "@/features/authSlice"

const ProfileInfo = () => {
    const userInfo = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logOut = async () => {
        try {
            const response = await apiClient.post(LOGOUT_ROUTE);
            if (response.status === 200) {
                navigate("/auth");
                toast.success("Logged out successfully");
                dispatch(login(null));
            }

        } catch (error) {
            console.error("Error logging out:", error);
        }

    }

    return (
        <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
            <div className="flex gap-3 items-center justify-center">
                <div className="w-12 h-12 relative">
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {userInfo.image ? <AvatarImage
                            src={`${HOST}/${userInfo.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black"
                        >

                        </AvatarImage>
                            : <div className={`uppercase h-12 w-12 flex items-center justify-center text-lg border-[1px] rounded-full ${getcolor(userInfo.color)}`}>
                                {userInfo.firstName ? userInfo.firstName.slice(0, 1) : userInfo.email.slice(0, 1)}
                            </div>}
                    </Avatar>
                </div>
                <div>
                    {
                        userInfo.firstName && userInfo.lastName ? (
                            `${userInfo.firstName} ${userInfo.lastName}`
                        ) : (
                            null
                        )
                    }
                </div>
            </div>
            <div className="flex gap-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <FiEdit2
                                className="text-purple-500 text-xl font-medium "
                                onClick={() => navigate("/profile")}
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>

                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp
                                className="text-red-400 text-xl font-medium"
                                onClick={logOut}
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Logout
                        </TooltipContent>
                    </Tooltip>

                </TooltipProvider>
            </div>

        </div>
    )
}
export default ProfileInfo;