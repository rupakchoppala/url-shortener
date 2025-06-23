import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import type { UrlData } from "../types";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UrlDataWithClicks extends UrlData {
  clickTimestamps: string[]; // array of ISO date strings for each click
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const UrlDetails = () => {
  const { shortCode } = useParams();
  const location = useLocation();
  const [url, setUrl] = useState<UrlDataWithClicks | null>(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUrl, setEditedUrl] = useState("");

  const fetchUrl = useCallback(async () => {
    if (!shortCode) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/url/${shortCode}/stats`, {
        withCredentials: true,
      });
      setUrl(res.data);
      setError("");
    } catch (err) {
      setError("⚠️ Failed to load URL details");
    }
  }, [shortCode]);
  

  useEffect(() => {
    fetchUrl();
  }, [shortCode, location, fetchUrl]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) fetchUrl();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchUrl]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/url/${shortCode}`,
        { longUrl: editedUrl },
        { withCredentials: true }
      );
      toast.success("✅ URL updated successfully");
      setIsEditing(false);
      fetchUrl();
    } catch (err) {
      toast.error("❌ Failed to update URL");
    }
  };

  // Transform clickTimestamps array into daily counts for the chart
  const clickData = url?.clickTimestamps
    ? daysOfWeek.map((day) => ({
        day,
        clicks: url.clickTimestamps.filter((timestamp) => {
          const date = new Date(timestamp);
          return daysOfWeek[date.getDay()] === day;
        }).length,
      }))
      
    : [];
    console.log("Fetched URL data:", url);
    console.log("Processed clickData:", clickData);
    
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!url) return <div className="text-white text-center p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-14 px-6 py-10 bg-white/10 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-black">🔍 URL Insights</h2>

      {/* QR Code */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-4 rounded-xl shadow-inner text-[10px] text-black text-center">
          scan QR code to redirect
          <QRCodeCanvas value={url.shortUrl} size={150} />
        </div>
      </div>

      {/* URL Info */}
      <div className="space-y-4 text-lg px-2">
        <p>
          <span className="text-blue-300 font-semibold">🔗 Short URL:</span>{" "}
          <a
            href={url.shortUrl}
            className="text-blue-400 underline hover:text-blue-300 break-all"
            target="_blank"
            rel="noreferrer"
          >
            {url.shortUrl}
          </a>
        </p>

        <p>
          <span className="text-green-300 font-semibold">🌐 Original URL:</span>{" "}
          {isEditing ? (
            <input
              type="text"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-md bg-white/20 text-black border border-white/30 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Update the original URL"
            />
          ) : (
            <span className="text-gray-200 break-words">{url.longUrl}</span>
          )}
        </p>

        <p>
          <span className="text-yellow-300 font-semibold">🏷️ Alias:</span>{" "}
          <span className="text-gray-500">{url.shortCode}</span>
        </p>

        <p>
          <span className="text-pink-300 font-semibold">📈 Clicks:</span>{" "}
          <span className="text-green-400 font-bold">{url.clicks}</span>
        </p>

        <p>
          <span className="text-purple-300 font-semibold">🕒 Created At:</span>{" "}
          <span className="text-gray-400">{new Date(url.createdAt).toLocaleString()}</span>
        </p>

        <p>
          <span className="text-red-300 font-semibold">⌛ Expires At:</span>{" "}
          <span className="text-gray-400">{new Date(url.expiresAt).toLocaleString()}</span>
        </p>
      </div>

      {/* Edit Buttons */}
      <div className="mt-6 flex gap-4">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold"
            >
              ✅ Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold"
            >
              ❌ Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setEditedUrl(url.longUrl);
              setIsEditing(true);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-xl font-semibold"
          >
            ✏️ Edit URL
          </button>
        )}
      </div>

      {/* Analytics Graph */}
      <div className="mt-14">
        <h3 className="text-2xl font-bold text-white mb-4">📊 Weekly Clicks Overview</h3>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clickData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 2" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UrlDetails;
