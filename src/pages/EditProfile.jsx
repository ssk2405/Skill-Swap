import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setLocation(data.location || "");
          setAvailability(data.availability || "");
          setSkillsOffered(data.skills?.join(", ") || "");
          setSkillsWanted(data.lookingFor?.join(", ") || "");
          setIsPublic(data.isPublic ?? true);
          setPhotoURL(data.photoURL || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      let downloadURL = photoURL;

      if (photo) {
        const storageRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(storageRef, photo);
        downloadURL = await getDownloadURL(storageRef);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        location,
        availability,
        skills: skillsOffered.split(",").map((s) => s.trim()),
        lookingFor: skillsWanted.split(",").map((s) => s.trim()),
        isPublic,
        photoURL: downloadURL,
      });

      alert("Profile updated!");
      navigate("/");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await deleteObject(storageRef);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: "" });

      setPhotoURL("");
      alert("Photo removed");
    } catch (err) {
      alert("Error removing photo: " + err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 text-white">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div><strong>Name:</strong> {user?.name || "No Name"}</div>

        <input type="text" placeholder="Location" className="w-full p-2 border rounded bg-gray-800" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="text" placeholder="Availability" className="w-full p-2 border rounded bg-gray-800" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        <input type="text" placeholder="Skills Offered (comma-separated)" className="w-full p-2 border rounded bg-gray-800" value={skillsOffered} onChange={(e) => setSkillsOffered(e.target.value)} />
        <input type="text" placeholder="Skills Wanted (comma-separated)" className="w-full p-2 border rounded bg-gray-800" value={skillsWanted} onChange={(e) => setSkillsWanted(e.target.value)} />

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
          <span>Make profile public</span>
        </label>

        <div className="mt-4">
          <div className="w-24 h-24 rounded-full border mb-2 overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm">No Photo</div>
            )}
          </div>

          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="mb-1" />

          {photoURL && (
            <button type="button" onClick={handleRemovePhoto} className="text-red-500 text-sm mt-1">Remove</button>
          )}
        </div>

        <button type="submit" className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-white transition">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
