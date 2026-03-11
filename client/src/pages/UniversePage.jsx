import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Sparkles, Trophy, Activity } from "lucide-react";
import UniverseMap, {
  COLOR_PALETTE,
  POSITION_PRESETS,
} from "../components/UniverseMap";

const buildUniverseData = (allPosts = []) => {
  const fieldMap = {};

  allPosts.forEach((post) => {
    const field = String(post?.field || "General").trim() || "General";
    const author = String(post?.author || "Unknown").trim() || "Unknown";

    if (!fieldMap[field]) {
      fieldMap[field] = { count: 0, authors: {} };
    }

    fieldMap[field].count += 1;
    fieldMap[field].authors[author] =
      (fieldMap[field].authors[author] || 0) + 1;
  });

  const sortedEntries = Object.entries(fieldMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  const maxCount = sortedEntries[0]?.[1]?.count || 1;

  return sortedEntries.map(([field, data], index) => {
    const topWarriorEntry = Object.entries(data.authors).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      name: field,
      energy: Math.min(1, Math.max(0.1, data.count / maxCount)),
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      pos: POSITION_PRESETS[index % POSITION_PRESETS.length],
      topWarrior: topWarriorEntry?.[0] || "N/A",
      activity: data.count,
    };
  });
};

const UniversePage = ({ myField }) => {
  const [communityData, setCommunityData] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniverseData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/posts`,
        );
        const allPosts = res.data || [];
        setTotalPosts(allPosts.length);
        setCommunityData(buildUniverseData(allPosts));
      } catch (err) {
        console.error("Universe data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniverseData();
  }, []);

  const focusedField = useMemo(
    () =>
      communityData.find(
        (item) =>
          item.name.toLowerCase() ===
          String(myField || "")
            .trim()
            .toLowerCase(),
      ),
    [communityData, myField],
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-2 md:p-3">
      <div className="bg-white border rounded-xl px-4 py-3 mb-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-bold">
          Universe Intelligence
        </p>
        <h3 className="text-lg md:text-xl font-black text-slate-900 mt-1">
          Global Universe Heatmap
        </h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="rounded-lg border bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold inline-flex items-center gap-1">
              <Activity size={12} /> Total Posts
            </p>
            <p className="text-sm font-black text-slate-900">{totalPosts}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold inline-flex items-center gap-1">
              <Sparkles size={12} /> Active Fields
            </p>
            <p className="text-sm font-black text-slate-900">
              {communityData.length}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold inline-flex items-center gap-1">
              <Trophy size={12} /> {myField} Rank
            </p>
            <p className="text-sm font-black text-slate-900">
              {focusedField
                ? `#${communityData.findIndex((item) => item.name === focusedField.name) + 1}`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-2.5 shadow-sm">
        {loading ? (
          <div className="h-[430px] flex items-center justify-center">
            <Loader2 size={26} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <UniverseMap communityData={communityData} />
        )}
      </div>
    </div>
  );
};

export default UniversePage;
