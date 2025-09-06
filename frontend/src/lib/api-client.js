import axios from "axios";
import { HOST } from "@/config/constants";

const apiClient = axios.create({
  baseURL: HOST,
    withCredentials: true,
});

export default apiClient;
