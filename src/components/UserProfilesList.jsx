import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { addDoc } from "firebase/firestore";

const UserProfilesList = () => {
  const [users, setUsers] = useState([]);
  const [searchSkill, setSearchSkill] = useState("");
  const { user } = useAuth();

  const fetchUsers = async () => {
    const ref = collection(db, "users");
    const snapshot = await getDocs(ref);
    const publicUsers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.isPublic !== false);
    setUsers(publicUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.skillsOffered?.some(skill =>
      skill.toLowerCase().includes(searchSkill.toLowerCase())
    )
  );

  const sendSwapRequest = async (targetUser) => {
    if (!user || !targetUser.id) return;

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
      console.error("Error sending swap request:", err);
    }
  };

  return (
    <div className="mt-6">
      <input
        type="text"
        placeholder="Search by skill (e.g., Photoshop)"
        className="w-full p-2 border mb-6 rounded"
        value={searchSkill}
        onChange={(e) => setSearchSkill(e.target.value)}
      />

      {filteredUsers.length === 0 ? (
        <p>No matching users found.</p>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 border rounded shadow-sm bg-white text-black">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p><strong>Location:</strong> {user.location || "N/A"}</p>
              <p><strong>Availability:</strong> {user.availability || "N/A"}</p>
              <p><strong>Skills Offered:</strong> {user.skillsOffered?.join(", ")}</p>
              <p><strong>Skills Wanted:</strong> {user.skillsWanted?.join(", ")}</p>
              <button
                className="bg-indigo-500 text-white px-4 py-1 rounded mt-2"
                onClick={() => sendSwapRequest(user)}
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilesList;
