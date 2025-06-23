// src/pages/Register.tsx
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/auth/register", form, { withCredentials: true });
      toast.success("Account created!");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black to-gray-900 text-white px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
        <div className="mb-6 text-center">
          <div className="text-4xl font-bold tracking-wider flex justify-center items-center gap-2">
            🔗 Short<span className="text-blue-500">Link</span>
          </div>
          <p className="text-sm mt-1 text-gray-400">Create an account to begin shortening.</p>
        </div>

        <input
          name="name"
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          type="email"
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white p-3 rounded-md font-semibold"
        >
          Register
        </button>

        <p className="text-center text-sm mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
