import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { token } = await response.json();
      Cookies.set("token", token, { expires: 30 });
      router.push("/");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="w-[350px]"
      >
        <h1 className="text-2xl mb-8">Login</h1>
        <div className="mb-8">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent focus:outline-none border-b-2 border-gray-300 border-opacity-50 py-1 px-2 w-full"
            required
          />
        </div>
        <div className="mb-8">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent focus:outline-none border-b-2 border-gray-300 border-opacity-50 py-1 px-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white mt-2 p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
