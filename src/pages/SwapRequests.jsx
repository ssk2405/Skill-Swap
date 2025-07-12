import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const SwapRequests = () => {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const fetchSwaps = async () => {
    const q1 = query(collection(db, 'swaps'), where('toUserId', '==', user.uid));
    const q2 = query(collection(db, 'swaps'), where('fromUserId', '==', user.uid));

    const [incomingSnap, outgoingSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

    setIncoming(incomingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setOutgoing(outgoingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'swaps', id), { status: newStatus });
    fetchSwaps();
  };

  const deleteRequest = async (id) => {
    await deleteDoc(doc(db, 'swaps', id));
    fetchSwaps();
  };

  useEffect(() => {
  if (user) {
    fetchSwaps();
  }
}, [user]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📥 Incoming Requests</h2>
      {incoming.map(req => (
        <div key={req.id} className="border p-3 mb-2 rounded shadow-sm">
          <p><strong>{req.fromUserName}</strong> wants to swap with you.</p>
          <p>Status: {req.status}</p>
          {req.status === "pending" && (
            <div className="space-x-2 mt-2">
              <button onClick={() => updateStatus(req.id, "accepted")} className="bg-green-500 px-3 py-1 text-white rounded">Accept</button>
              <button onClick={() => updateStatus(req.id, "rejected")} className="bg-red-500 px-3 py-1 text-white rounded">Reject</button>
            </div>
          )}
        </div>
      ))}

      <h2 className="text-2xl font-bold mt-6 mb-4">📤 Sent Requests</h2>
      {outgoing.map(req => (
  <div key={req.id} className="border p-3 mb-2 rounded shadow-sm">
    <p>To: <strong>{req.toUserName}</strong></p>
    <p>Status: {req.status}</p>

    {req.status === "pending" && (
      <button
        onClick={() => deleteRequest(req.id)}
        className="bg-gray-500 px-3 py-1 text-white mt-2 rounded"
      >
        Delete
      </button>
    )}

    {req.status === "accepted" && !req.rating && (
      <div className="mt-2">
        <label className="block text-sm font-medium mb-1">
          Rate this user (1–5):
        </label>
        <input
          type="number"
          min="1"
          max="5"
          value={req._rating || ''}
          onChange={(e) => {
            const newRating = parseInt(e.target.value);
            setOutgoing((prev) =>
              prev.map((r) => r.id === req.id ? { ...r, _rating: newRating } : r)
            );
          }}
          className="border rounded px-2 py-1 mb-1"
        />

        <textarea
          placeholder="Optional feedback..."
          value={req._feedback || ''}
          onChange={(e) => {
            const feedback = e.target.value;
            setOutgoing((prev) =>
              prev.map((r) => r.id === req.id ? { ...r, _feedback: feedback } : r)
            );
          }}
          className="w-full border rounded px-2 py-1"
        />

        <button
          onClick={async () => {
            const swapRef = doc(db, 'swaps', req.id);
            await updateDoc(swapRef, {
              rating: req._rating,
              feedback: req._feedback || '',
            });
            fetchSwaps();
          }}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Submit Feedback
        </button>
      </div>
    )}
  </div>
))}
    </div>
  );
};

export default SwapRequests;
