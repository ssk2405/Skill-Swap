import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLocation(user.location || "");
      setAvailability(user.availability || "");
      setSkillsOffered(user.skillsOffered?.join(", ") || "");
      setSkillsWanted(user.skillsWanted?.join(", ") || "");
      setIsPublic(user.isPublic ?? true);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        location,
        availability,
        skillsOffered: skillsOffered.split(",").map((s) => s.trim()),
        skillsWanted: skillsWanted.split(",").map((s) => s.trim()),
        isPublic,
      });
      alert("Profile updated!");
      navigate("/");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <div><strong>Name:</strong> {user?.name}</div>

        <input
          type="text"
          placeholder="Location"
          className="w-full p-2 border rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="text"
          placeholder="Availability (e.g., Weekends)"
          className="w-full p-2 border rounded"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />

        <input
          type="text"
          placeholder="Skills Offered (comma-separated)"
          className="w-full p-2 border rounded"
          value={skillsOffered}
          onChange={(e) => setSkillsOffered(e.target.value)}
        />

        <input
          type="text"
          placeholder="Skills Wanted (comma-separated)"
          className="w-full p-2 border rounded"
          value={skillsWanted}
          onChange={(e) => setSkillsWanted(e.target.value)}
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
          />
          <span>Make profile public</span>
        </label>

        <button className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-white transition">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
