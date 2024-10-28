import { useState } from "react";
import { useRouter } from "next/navigation";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, confirmPassword }),
    });

    if (response.ok) {
      alert("Registration successful!");
      router.push("/login"); // Redirect to login page
    } else {
      const errorData = await response.json();
      alert(`Registration failed: ${errorData.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleRegister}
        className="neu w-[90%] md:w-1/3 text-blue-950 p-8"
      >
        <h1 className="text-2xl mb-8">Register</h1>
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
        <div className="mb-8">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-transparent focus:outline-none border-b-2 border-gray-300 border-opacity-50 py-1 px-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-950 text-white mt-2 px-6 py-2 rounded-3xl"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
