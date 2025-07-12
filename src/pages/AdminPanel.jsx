// pages/AdminPanel.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';



const AdminPanel = () => {
    const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);

  const fetchData = async () => {
    const userSnap = await getDocs(collection(db, 'users'));
    const swapSnap = await getDocs(collection(db, 'swaps'));

    setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setSwaps(swapSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧑‍⚖️ Admin Panel</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        {users.map(user => (
          <div key={user.id} className="border p-3 mb-2 rounded">
            <p><strong>{user.name}</strong> ({user.email})</p>
            <p>Skills: {user.skills?.join(', ')}</p>
            <p>Status: {user.banned ? '🚫 Banned' : '✅ Active'}</p>
            <button
              onClick={async () => {
                await updateDoc(doc(db, 'users', user.id), { banned: !user.banned });
                fetchData();
              }}
              className={`mt-2 px-3 py-1 rounded text-white ${user.banned ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {user.banned ? 'Unban User' : 'Ban User'}
            </button>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">All Swaps</h3>
        {swaps.map(swap => (
          <div key={swap.id} className="border p-3 mb-2 rounded">
            <p>From: {swap.fromUserName} ➡️ To: {swap.toUserName}</p>
            <p>Status: {swap.status}</p>
            {swap.feedback && <p className="text-sm italic">Feedback: {swap.feedback}</p>}
            {/* Optional: Add ability to delete/reject bad swaps */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
