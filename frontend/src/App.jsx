import { BrowserRouter, Routes , Route, Navigate } from 'react-router-dom'
import Auth from "@/pages/auth/index"
import Chat from "@/pages/chat/index"
import Profile from "@/pages/profile/index"
import apiClient from './lib/api-client'
import { GET_USER_INFO } from './config/constants'
import { useSelector , useDispatch } from 'react-redux'
import { useState, useEffect,} from 'react'
import { login } from './features/authSlice'


const PrivateRoute = ({children})=> {
  const userInfo = useSelector((state) => state.auth.user);
  const isAuthenticated = !!userInfo;

  return isAuthenticated ? children : <Navigate to="/auth" />;
}

const AuthRoute = ({children})=> {
  const userInfo = useSelector((state) => state.auth.user);
  const isAuthenticated = !!userInfo;

  return isAuthenticated ? <Navigate to="/chat" /> : children;
}



function App() {

  const userInfo = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const getUserData = async () => {
    try{
      const response = await apiClient.get(GET_USER_INFO);
      if(response.status === 200){
        
        dispatch(login(response.data.user));
        setLoading(false);
      }
      else{
        dispatch(login(null));
      }
    }
    catch(error){
        dispatch(login(null));
        console.error("Error fetching user data:", error);
      }
    finally{
      setLoading(false);
    }
  }
   if(!userInfo){
    getUserData();
   }
   else{
    setLoading(false);
   }


  }, [userInfo]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/auth" />}></Route>

          <Route path="/auth" element={<AuthRoute> <Auth/> </AuthRoute>}></Route>
          <Route path="/chat" element={<PrivateRoute> <Chat/> </PrivateRoute>}></Route>
          <Route path="/profile" element={<PrivateRoute> <Profile/> </PrivateRoute>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
