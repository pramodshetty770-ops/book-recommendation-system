import React, { useState } from "react";
import { Search, User, ChevronDown, Check } from "lucide-react";
import { UserStats } from "../types";

interface UserSelectorProps {
  users: UserStats[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUserId,
  onSelectUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.user_id.toLowerCase().includes(search.toLowerCase()) ||
      u.favorite_genre.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users.find((u) => u.user_id === selectedUserId);

  return (
    <div className="relative w-full">
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        Select Target Reader / User
      </label>

      {/* Main Trigger Button */}
      <button
        id="user-selector-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
      >
        {selectedUser ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">{selectedUser.user_id}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {selectedUser.favorite_genre}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedUser.rating_count} ratings • {selectedUser.average_rating}★ avg
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Choose a user...</span>
        )}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="user-selector-dropdown"
          className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user or favorite genre..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-50">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No users found</div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = u.user_id === selectedUserId;
                return (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => {
                      onSelectUser(u.user_id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition-colors ${
                      isSelected ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="font-semibold text-slate-900">{u.user_id}</div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {u.favorite_genre}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {u.rating_count} ratings ({u.average_rating}★)
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
