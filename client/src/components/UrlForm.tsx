import { useState } from "react";
import axios from "axios";

interface Props {
  onSuccess: () => void;
}

const UrlForm: React.FC<Props> = ({ onSuccess }) => {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/url/shorten",
        { longUrl, customAlias },
        { withCredentials: true } // ✅ Important
      );      
      setLongUrl("");
      setCustomAlias("");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen rounded-md bg-gradient-to-tr from-[#111827] via-[#1f2937] to-[#111827] flex items-center justify-center px-4">
      <div className="w-full max-w-lg backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">🔗 Shorten Your URL</h1>
          <p className="text-sm text-gray-300">Modern, Fast & Secure URL shortener</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Long URL</label>
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://your-very-long-url.com"
              required
              className="mt-1 w-full px-4 py-3 bg-white/20 text-white placeholder:text-gray-400 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Custom Alias (optional)</label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="your-alias"
              className="mt-1 w-full px-4 py-3 bg-white/20 text-white placeholder:text-gray-400 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UrlForm;
