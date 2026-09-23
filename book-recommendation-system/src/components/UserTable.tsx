import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, User, Star } from "lucide-react";
import { UserStats } from "../types";

interface UserTableProps {
  users: UserStats[];
  onSelectUser: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onSelectUser }) => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof UserStats>("rating_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const processedUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.user_id.toLowerCase().includes(search.toLowerCase()) ||
          u.favorite_genre.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [users, search, sortField, sortOrder]);

  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;
  const paginatedUsers = processedUsers.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: keyof UserStats) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="relative flex flex-1 items-center min-w-[200px]">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
          <input
            id="user-search-input"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by User ID or favorite genre..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pr-3 pl-8.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {processedUsers.length} active reader{processedUsers.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("user_id")}
              >
                <div className="flex items-center gap-1">
                  User ID
                  {sortField === "user_id" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900 text-right"
                onClick={() => toggleSort("rating_count")}
              >
                <div className="flex items-center justify-end gap-1">
                  Ratings Given
                  {sortField === "rating_count" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900 text-right"
                onClick={() => toggleSort("average_rating")}
              >
                <div className="flex items-center justify-end gap-1">
                  Average Rating
                  {sortField === "average_rating" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th className="px-4 py-3 text-right">Rating Range</th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("favorite_genre")}
              >
                <div className="flex items-center gap-1">
                  Favorite Genre
                  {sortField === "favorite_genre" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                  No users match the search criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                        {u.user_id.slice(1, 4)}
                      </div>
                      <span>{u.user_id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">
                    {u.rating_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {u.average_rating.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500 text-[11px]">
                    {u.lowest_rating}★ – {u.highest_rating}★
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {u.favorite_genre}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      id={`view-user-btn-${u.user_id}`}
                      onClick={() => onSelectUser(u.user_id)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Profile & Recs
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
