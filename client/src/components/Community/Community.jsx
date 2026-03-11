import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Loader2 } from "lucide-react";
import CommunityHeader from "./CommunityHeader";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

const Community = ({ myField }) => {
  // --- 1. STATES ---
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [fullImg, setFullImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState("Explore"); // 'Explore' | 'Following'
  const [isExpiring, setIsExpiring] = useState(false);

  // --- 2. IDENTITY & CONTEXT ---
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser?.id || storedUser?._id;
  const myName = storedUser?.name || "Commander";
  // BCA student context ke liye field setup
  const currentSector =
    myField || localStorage.getItem("userField") || "General";
  const followingList = storedUser.following || []; // Jin doston ko follow kar rakha hai

  // --- 3. FETCH BROADCASTS ---
  useEffect(() => {
    fetchPosts();
  }, [currentSector]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Backend se saare posts le aao, filter hum UI par karenge
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Link Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. 🔥 LOGIC: SMART FILTERING ---
  const filteredPosts = posts.filter((post) => {
    if (viewMode === "Following") {
      // Logic: Post ka authorId meri following list mein hona chahiye
      return followingList.includes(post.authorId);
    }
    // Explore Mode Logic: Sirf mere sector (BCA/Data Science) ke posts dikhao
    return post.field === currentSector;
  });

  // --- 5. POST SUBMISSION ---
  const handlePostSubmit = async () => {
    if (!newPost.trim() && !image) return;
    setUploading(true);
    let uploadedImageUrl = "";

    try {
      if (image) {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "TODO123");
        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dsitca1zl/image/upload",
          data,
        );
        uploadedImageUrl = cloudRes.data.secure_url;
      }

      const postPayload = {
        author: myName,
        authorId: myId,
        field: currentSector,
        content: newPost.trim() || "Signal Initialized",
        imageUrl: uploadedImageUrl,
        expiresAt: isExpiring
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts/add`,
        postPayload,
      );
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setImage(null);
      setImagePreview(null);
      setIsExpiring(false);
    } catch (err) {
      alert("Broadcast Sync Failed");
    } finally {
      setUploading(false);
    }
  };

  // --- 6. INTERACTIONS ---
  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/like/${postId}`,
        { userId: myId },
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p,
        ),
      );
    } catch (err) {
      console.error("Reaction Failed");
    }
  };

  const handleComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts/${postId}/comment`,
        {
          userId: myId,
          userName: myName,
          text,
        },
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p)),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comm Failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20 md:py-40">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc]">
      <CommunityHeader
        currentSector={currentSector}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main scrolling container - responsive padding */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 md:p-6">
        <CreatePost
          myName={myName}
          newPost={newPost}
          setNewPost={setNewPost}
          imagePreview={imagePreview}
          setImage={setImage}
          setImagePreview={setImagePreview}
          isExpiring={isExpiring}
          setIsExpiring={setIsExpiring}
          uploading={uploading}
          onSubmit={handlePostSubmit}
        />

        {/* Responsive Grid with dynamic gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto pb-24 md:pb-20 mt-2 md:mt-0">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                myId={myId}
                onLike={handleLike}
                onImageClick={setFullImg}
                isCommentOpen={showComments[post._id]}
                onCommentToggle={(id) =>
                  setShowComments((p) => ({ ...p, [id]: !p[id] }))
                }
                commentInput={commentInputs[post._id] || ""}
                setCommentInput={(id, val) =>
                  setCommentInputs((p) => ({ ...p, [id]: val }))
                }
                onCommentSubmit={handleComment}
              />
            ))
          ) : (
            <div className="col-span-full py-10 md:py-20 text-center text-slate-400 italic font-medium text-sm md:text-base px-4">
              {viewMode === "Following"
                ? "No broadcasts from your circle yet. Follow more commanders!"
                : "No signals detected in this sector."}
            </div>
          )}
        </div>
      </div>

      {/* Full Image Modal - stays full screen */}
      {fullImg && (
        <div
          className="fixed inset-0 bg-slate-950/98 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-2xl"
          onClick={() => setFullImg(null)}
        >
          <img
            src={fullImg}
            className="max-w-full max-h-[90vh] rounded-[1.5rem] sm:rounded-[2rem] object-contain"
            alt="Full"
          />
        </div>
      )}
    </div>
  );
};

export default Community;
