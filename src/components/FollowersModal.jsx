import React, { useState, useEffect } from "react";
import { X, Users, UserCheck, Loader } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import FollowButton from "./ui/FollowButton";

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  type = "seguidores",
}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      // console.log("Cargando modal:", type, userId);
      try {
        let usersList = [];
        const collectionName =
          type === "seguidores" ? "followers" : "following";
        const usersRef = collection(db, `users/${userId}/${collectionName}`);
        const snapshot = await getDocs(usersRef);

        const promises = snapshot.docs.map(async (docSnap) => {
          const targetUserId = docSnap.id;
          const userRef = doc(db, "users", targetUserId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            return {
              uid: targetUserId,
              ...userDoc.data(),
              seguidoEn: docSnap.data().seguidoEn,
            };
          }
          return null;
        });

        usersList = (await Promise.all(promises)).filter(Boolean);
        // console.log(`Encontrados ${usersList.length} usuarios (${type})`);
        setUsers(usersList);
      } catch (error) {
        // console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const title = type === "seguidores" ? "Seguidores" : "Siguiendo";

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title} ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" color="blue" variant="dots" />
              <p className="text-gray-700 dark:text-gray-300 text-base font-medium mt-4">
                Cargando...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {type === "seguidores" ? "No hay seguidores" : "No sigue a nadie"}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => {
                      navigate(`/user/${user.uid}`);
                      onClose();
                    }}
                  >
                    <img
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.displayName || "User"
                        )}&size=200&background=2563eb&color=fff&bold=true`
                      }
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full border-2 border-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.displayName || "Usuario"}
                      </h3>
                      {user.storeName && (
                        <p className="text-sm text-blue-600 truncate">
                          {user.storeName}
                        </p>
                      )}
                    </div>
                  </div>
                  <FollowButton targetUserId={user.uid} variant="compact" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
