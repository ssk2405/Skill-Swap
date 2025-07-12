// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const register = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      name,
      skills: [],
      lookingFor: [],
      availability: "",
      location: "",
      photoURL: "",
      isPublic: true,
      role: "user",
    });
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  // 🔥 Watch for login/logout changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (docSnap.exists()) {
          // ✅ Merge Firebase Auth + Firestore data
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
