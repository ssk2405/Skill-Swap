import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const SwapRequests = () => {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

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
    if (user) fetchSwaps();
  }, [user]);

  const filterByStatus = (arr) =>
    statusFilter === 'all' ? arr : arr.filter(req => req.status === statusFilter);

  return (
    <div className="dark bg-black min-h-screen text-white py-10 px-4 sm:px-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">🛠️ Skill Swap Requests</h1>
        <div className="mt-4 sm:mt-0">
          <label className="text-sm mr-2">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800 text-white border border-gray-600 px-3 py-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Incoming Requests */}
      <h2 className="text-2xl font-bold mb-4">📥 Incoming Requests</h2>
      {filterByStatus(incoming).length === 0 ? (
        <p className="text-gray-400">No incoming requests</p>
      ) : (
        filterByStatus(incoming).map(req => (
          <div key={req.id} className="bg-white dark:bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4 shadow-lg flex flex-col sm:flex-row justify-between items-center transition hover:shadow-2xl">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center">
                Profile Photo
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{req.fromUserName}</h3>
                <p className="text-sm text-cyan-400">Skill Offered ➜ <span className="font-medium text-blue-300">{req.skillOffered}</span></p>
                <p className="text-sm text-pink-400">Skill Wanted ➜ <span className="font-medium text-purple-300">{req.skillWanted}</span></p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                req.status === "pending" ? "text-yellow-500 bg-yellow-100/10 border border-yellow-400"
                : req.status === "accepted" ? "text-green-500 bg-green-100/10 border border-green-500"
                : "text-red-500 bg-red-100/10 border border-red-500"
              }`}>
                {req.status}
              </span>

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, "accepted")}
                    className="bg-green-600 px-4 py-1 text-white rounded hover:bg-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    className="bg-red-600 px-4 py-1 text-white rounded hover:bg-red-500"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Sent Requests */}
      <h2 className="text-2xl font-bold mt-10 mb-4">📤 Sent Requests</h2>
      {filterByStatus(outgoing).length === 0 ? (
        <p className="text-gray-400">No sent requests</p>
      ) : (
        filterByStatus(outgoing).map(req => (
          <div key={req.id} className="bg-white dark:bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4 shadow-lg flex flex-col sm:flex-row justify-between items-center transition hover:shadow-2xl">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center">
                Profile Photo
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{req.toUserName}</h3>
                <p className="text-sm text-cyan-400">Skill Offered ➜ <span className="font-medium text-blue-300">{req.skillOffered}</span></p>
                <p className="text-sm text-pink-400">Skill Wanted ➜ <span className="font-medium text-purple-300">{req.skillWanted}</span></p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                req.status === "pending" ? "text-yellow-500 bg-yellow-100/10 border border-yellow-400"
                : req.status === "accepted" ? "text-green-500 bg-green-100/10 border border-green-500"
                : "text-red-500 bg-red-100/10 border border-red-500"
              }`}>
                {req.status}
              </span>

              {req.status === "pending" && (
                <button
                  onClick={() => deleteRequest(req.id)}
                  className="bg-gray-600 text-white px-4 py-1.5 rounded hover:bg-gray-500"
                >
                  Delete
                </button>
              )}

              {req.status === "accepted" && !req.rating && (
                <div className="mt-2 w-full">
                  <label className="block text-sm text-white mb-1">Rate this user (1–5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={req._rating || ''}
                    onChange={(e) => {
                      const newRating = parseInt(e.target.value);
                      setOutgoing(prev => prev.map(r => r.id === req.id ? { ...r, _rating: newRating } : r));
                    }}
                    className="w-full border border-gray-600 rounded px-2 py-1 bg-zinc-800 text-white"
                  />
                  <textarea
                    placeholder="Optional feedback..."
                    value={req._feedback || ''}
                    onChange={(e) => {
                      const feedback = e.target.value;
                      setOutgoing(prev => prev.map(r => r.id === req.id ? { ...r, _feedback: feedback } : r));
                    }}
                    className="w-full border border-gray-600 mt-2 rounded px-2 py-1 bg-zinc-800 text-white"
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
                    className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SwapRequests;
