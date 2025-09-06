import { useSelector } from "react-redux";
import { useState ,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {IoArrowBack} from "react-icons/io5"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getcolor } from "@/lib/utils";
import {FaTrash , FaPlus} from "react-icons/fa"
import { Input } from "@/components/ui/input";
import { colors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, HOST, UPDATE_PROFILE_ROUTE , REMOVE_PROFILE_IMAGE_ROUTE } from "@/config/constants";
import { useDispatch } from "react-redux";
import { login } from "@/features/authSlice";
import { useRef } from "react";



const Profile = () => {
     const navigate = useNavigate();
     const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image , setImage] = useState(null);
  const [hovered , setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
      
    }
    if(userInfo.image){
     setImage(`${HOST}/${userInfo.image}`);
    }
    if(userInfo.image===null){
      setImage(null);
    }
  }, [userInfo]);

  const validateProfile =()=>{
     if(!firstName){
          toast.error("First name is required");
          return false;
     }
     if(!lastName){
          toast.error("Last name is required");
          return false;
     }
     return true;
  }

  const saveChanges = async ()=>{

     if(validateProfile()){
          alert('success');
     }

     try{
          const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
               firstName,
               lastName,
               color: selectedColor,
          });
          if(response.status == 200 && response.data.user){
               dispatch(login(response.data.user));
               toast.success("Profile updated successfully");
               navigate("/chat");
          }
     }catch(error){
          console.error("Error updating profile:", error);
          toast.error("Failed to update profile");
     }

}


const handleNavigate =()=>{
     if(userInfo.profileSetup){
          navigate("/chat");
     }else{
          toast.error("Please complete your profile first");
     }
}

const handleFileInputClick=()=>{
     fileInputRef.current.click();
}

const handleImageChange = async (event)=>{
     const file = event.target.files[0];
     if(file){
          const formData = new FormData();
          formData.append("profile-image", file);
          const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE,formData);
          if(response.status == 200 && response.data.image){
               dispatch(login({...userInfo , image: response.data.image}));
               setImage(null);
               toast.success("Profile image updated successfully");
          }
          
     }
};

const handleDeleteImage = async ()=>{
     const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE);
     if(response.status == 200 && response.data.image === null){
          dispatch(login({...userInfo , image: null}));
          toast.success("Profile image removed successfully");
     }
}

  return (
     <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
          <div className="flex flex-col gap-20 w-[80vw] md:w-max">
               <div onClick={handleNavigate}>
                    <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer"></IoArrowBack>
               </div>
               <div className="grid grid-cols-2">
                    <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)} >
                        
                         {hovered ? (
                              <div className={`absolute inset-0 bg-transparent/50  flex items-center justify-center ring-fuchsia-50 rounded-full ${hovered ? "border-1 border-slate-400" : null}`}
                              onClick={image ? handleDeleteImage : handleFileInputClick}>
                                   {
                                        image 
                                         ?<FaTrash className="text-white text-3xl cursor-pointer"/>
                                         :<FaPlus className="text-white text-3xl cursor-pointer"/>
                                   }
                              </div>
                         ):(
                               <Avatar className="h-32 w-32 md:h-48 md:w-48  rounded-full overflow-hidden">
                              {image ? <AvatarImage 
                              src={image} 
                              alt="profile" 
                              className="object-cover w-full h-full bg-black"
                              >

                              </AvatarImage>
                                   :<div className={`uppercase h-32 w-32 md:h-48 md:w-48  flex items-center justify-center text-5xl border-[1px] rounded-full ${getcolor(selectedColor)}`}>
                                        {firstName ? firstName.slice(0,1) : userInfo.email.slice(0,1)}
                                   </div>}
                         </Avatar>
                         )}
                         <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" name="profile-image" accept=".png, .jpg, .jpeg, .svg, .webp" />

                    </div>
                    <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">

                         <div className="w-full">
                                <Input placeholder="Email"
                                 type="email" 
                                 disabled 
                                 value ={userInfo.email}
                                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"></Input>
                            </div>

                             <div className="w-full">
                                <Input placeholder="First Name"
                                 type="text" 
                                 onChange={(e)=>setFirstName(e.target.value)}
                                 value ={firstName}
                                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"></Input>
                            </div>

                             <div className="w-full">
                                <Input placeholder="Last Name"
                                 type="text" 
                                 onChange={(e)=>setLastName(e.target.value)}
                                 value ={lastName}
                                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"></Input>
                            </div>

                            <div className="w-full flex gap-5">
                                {
                                    colors.map((color,index) => <div className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                                ${selectedColor == index 
                                    ? "outline-white/70 outline-2"
                                    :""}`}
                                    key={index}
                                    onClick={()=>setSelectedColor(index)}
                                    ></div>)
                                
                                }
                            </div>
                    </div>
               </div>
               <div className="w-full">
                        <Button className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                        onClick={saveChanges}>
                            Save Changes
                        </Button>
                    </div>
          </div>
          

     </div>
         )
}

export default Profile;