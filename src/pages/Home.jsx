import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchSkill, setSearchSkill] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const userData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => 
          u.isPublic !== false && u.id !== user?.uid
        );
      setUsers(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  fetchUsers();
}, [user]);

  const handleSwapRequest = async (targetUser) => {
    if (!user) return alert("Please log in first");

    try {
      await addDoc(collection(db, "swaps"), {
        fromUserId: user.uid,
        toUserId: targetUser.id,
        fromUserName: user.name,
        toUserName: targetUser.name,
        status: "pending",
        timestamp: Date.now(),
      });
      alert("Swap request sent!");
    } catch (err) {
      console.error("Swap request error:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const skillMatch = searchSkill === "" || u.skills?.some(skill =>
      skill.toLowerCase().includes(searchSkill.toLowerCase())
    );
    const availabilityMatch = availability === "" || u.availability === availability;
    return skillMatch && availabilityMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Top Navbar */}
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-700">
        <h1 className="text-2xl font-semibold">Skill Swap Platform</h1>
        {!user && (
          <Link to="/login">
            <button className="border px-4 py-1 rounded hover:bg-white hover:text-black transition">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600"
        >
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
        </select>
        <input
          type="text"
          placeholder="Search skills..."
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
          className="px-4 py-2 rounded border border-gray-600 bg-gray-800 w-full sm:w-1/2"
        />
        <button
          onClick={() => setSearchSkill("")}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Clear
        </button>
      </div>

      {/* User Cards */}
      <div className="space-y-6">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-400">No matching users found.</p>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded border-gray-600 bg-gray-900"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
                  {u.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{u.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Availability: {u.availability || "N/A"}
                  </p>
                  <div className="text-sm mt-2">
  <span className="text-green-400">Skills Offered:</span>
  {Array.isArray(u.skills) && u.skills.length > 0 ? (
    u.skills.map((skill, i) => (
      <span
        key={i}
        className="inline-block border rounded px-2 py-1 mx-1 bg-gray-800 text-white"
      >
        {skill}
      </span>
    ))
  ) : (
    <span className="text-gray-400 ml-2">None listed</span>
  )}
</div>
<div className="text-sm mt-1">
  <span className="text-blue-400">Skills Wanted:</span>
  {Array.isArray(u.lookingFor) && u.lookingFor.length > 0 ? (
    u.lookingFor.map((skill, i) => (
      <span
        key={i}
        className="inline-block border rounded px-2 py-1 mx-1 bg-gray-800 text-white"
      >
        {skill}
      </span>
    ))
  ) : (
    <span className="text-gray-400 ml-2">None listed</span>
  )}
</div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 text-center">
                {user ? (
                  <button
                    onClick={() => handleSwapRequest(u)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
                  >
                    Request
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
                      Login to Request
                    </button>
                  </Link>
                )}
                <div className="mt-2 text-sm">Rating: {u.rating || "3.5"}/5</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (placeholder) */}
      <div className="flex justify-center mt-10 space-x-2 text-lg">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className="px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
