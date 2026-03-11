import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ResourceHeader from "./ResourceHeader";
import ResourceVault from "../Syllabus/ResourceVault";

const API_RESOURCES = `${import.meta.env.VITE_API_URL}/api/resources`;

const ResourcesPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  const [resources, setResources] = useState([]);
  const [resourceType, setResourceType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  // 🔥 FIX 1: Fetch saara data (topicId filter hata diya)
  const fetchAllData = async () => {
    if (!myId) return;
    try {
      setLoading(true);
      const res = await axios.get(API_RESOURCES, {
        params: { userId: myId, type: resourceType },
      });
      setResources(res.data || []);
    } catch (err) {
      console.error("Vault Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [myId, resourceType]);

  // 🔥 FIX 2: Global Upload Logic
  const handleAddResource = async (newRes) => {
    setNotice("Injecting Node into Global Vault...");
    try {
      // Note: Global view mein topicId/examId optional ho sakte hain backend par
      const payload = { ...newRes, userId: myId };
      const res = await axios.post(`${API_RESOURCES}/add`, payload);

      setResources((prev) => [res.data, ...prev]);
      setNotice("✅ Signal Synced Successfully!");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      alert("Injection Failed: Link Error");
      setNotice("");
    }
  };

  const handleBookmark = async (res) => {
    try {
      const response = await axios.put(`${API_RESOURCES}/${res._id}/bookmark`, {
        userId: myId,
      });
      setResources(
        resources.map((item) => (item._id === res._id ? response.data : item)),
      );
    } catch (err) {
      console.error("Bookmark Error");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={50} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Syncing Universal Vault...
        </p>
      </div>
    );

  return (
    <div className="h-screen flex flex-col font-sans bg-[#f8fafc] overflow-hidden">
      <ResourceHeader
        onAddResource={handleAddResource} // Seedha function pass kiya
        resourceCount={resources.length}
        notice={notice}
      />

      <div className="flex-1 p-4 md:p-8 overflow-hidden">
        <ResourceVault
          resources={resources}
          resourceType={resourceType}
          setResourceType={setResourceType}
          onBookmark={handleBookmark}
          onAddResource={handleAddResource}
          activeTopicTitle="Universal Knowledge Base" // Global title
        />
      </div>
    </div>
  );
};

export default ResourcesPage;
