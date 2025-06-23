import { useEffect, useState } from "react";
import UrlForm from "../components/UrlForm";
import UrlList from "../components/UrlList";
import type { UrlData } from "../types";
import axios from "axios";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
const Home = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const location = useLocation();


const fetchUrls = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/url", { withCredentials: true });
    setUrls(res.data);
  } catch (error:any) {
    console.error(error);
    if (error.response?.status === 429) {
      toast.error(error.response.data.message || "Too many requests! Please try later.");
    } else {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  }
};

useEffect(() => {
  // Whenever the route changes to this component, fetch URLs fresh
  fetchUrls();
}, [location]);
useEffect(() => {
  const onVisibilityChange = () => {
    if (!document.hidden) {
      fetchUrls();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => document.removeEventListener("visibilitychange", onVisibilityChange);
}, []);




  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">URL Shortener</h1>
      <UrlForm onSuccess={fetchUrls} />
      <UrlList urls={urls} refresh={fetchUrls} />
    </div>
  );
};

export default Home;
