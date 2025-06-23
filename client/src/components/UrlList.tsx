import type { UrlData } from "../types";
import axios from "axios";
import { useState } from "react";
import { FaTrashAlt, FaExternalLinkAlt, FaCopy, FaEdit, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  urls: UrlData[];
  refresh: () => void;
}

const UrlList: React.FC<Props> = ({ urls, refresh }) => {
  const [search, setSearch] = useState("");
  const [editCode, setEditCode] = useState<string | null>(null);
  const [editLongUrl, setEditLongUrl] = useState<string>("");
  const navigate = useNavigate();

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/url/${code}`, {
        withCredentials: true,
      });
      toast.success("URL deleted");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete URL");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Short URL copied!");
  };

  const handleEdit = async (code: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/url/${code}`,
        { longUrl: editLongUrl },
        { withCredentials: true }
      );
      toast.success("URL updated");
      setEditCode(null);
      setEditLongUrl("");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const filteredUrls = urls.filter(
    (url) =>
      url.longUrl.toLowerCase().includes(search.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 mt-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">🔗 Your Shortened URLs</h2>
        <input
          type="text"
          placeholder="Search URLs..."
          className="px-4 py-2 rounded-lg border border-white/30 bg-white/5 text-white w-full md:w-80 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUrls.length === 0 ? (
        <p className="text-center text-gray-300 text-lg">No matching URLs found.</p>
      ) : (
        <div className="grid gap-6">
          {filteredUrls.map((url) => (
            <div
            key={url.shortCode}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:scale-[1.015]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
              <div className="space-y-4 w-full">
                {editCode === url.shortCode ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editLongUrl}
                      onChange={(e) => setEditLongUrl(e.target.value)}
                      placeholder="Update original URL"
                      className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleEdit(url.shortCode)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition"
                    >
                      ✅ Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-gray-300 text-sm">🔗 Short URL:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline break-all inline-flex items-center gap-1"
                        >
                          {url.shortUrl}
                          <FaExternalLinkAlt size={12} />
                        </a>
                        <button
                          onClick={() => handleCopy(url.shortUrl)}
                          className="px-2 py-1 bg-gray-500 hover:bg-gray-700 text-white text-xs rounded flex items-center gap-1"
                        >
                          <FaCopy size={12} /> Copy
                        </button>
                      </div>
                    </div>
          
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-gray-300 text-sm">🌐 Original URL:</p>
                        <p className="text-gray-200 break-words">{url.longUrl}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">📊 Clicks:</p>
                        <p className="text-green-400 font-semibold text-lg">{url.clicks}</p>
                      </div>
                    </div>
          
                    <div className="mt-6 text-center bg-white/10 p-4 rounded-lg border border-white/20 shadow-inner">
                      <p className="text-sm font-semibold text-white mb-2">📱 QR Code</p>
                      <QRCodeCanvas value={url.shortUrl} size={128} bgColor="#ffffff" fgColor="#000000" />
                    </div>
                  </>
                )}
              </div>
          
              <div className="flex flex-col gap-3 items-end justify-start">
                <button
                  onClick={() => {
                    setEditCode(url.shortCode);
                    setEditLongUrl(url.longUrl);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaEdit size={14} /> Edit
                </button>
          
                <button
                  onClick={() => navigate(`/url/${url.shortCode}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaEye size={14} /> View
                </button>
          
                <button
                  onClick={() => handleDelete(url.shortCode)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaTrashAlt size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
          
          ))}
        </div>
      )}
    </section>
  );
};

export default UrlList;
