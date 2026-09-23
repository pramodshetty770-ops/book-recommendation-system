import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, Filter } from "lucide-react";
import { Book } from "../types";

interface BookTableProps {
  books: Book[];
  genres: string[];
  onSelectBook: (bookId: string) => void;
}

export const BookTable: React.FC<BookTableProps> = ({ books, genres, onSelectBook }) => {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [minRating, setMinRating] = useState(0);
  const [sortField, setSortField] = useState<keyof Book>("rating_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filtered and sorted books
  const processedBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.book_id.toLowerCase().includes(search.toLowerCase());

        const matchesGenre = selectedGenre === "ALL" || b.genre === selectedGenre;
        const matchesRating = b.average_rating >= minRating;

        return matchesSearch && matchesGenre && matchesRating;
      })
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
  }, [books, search, selectedGenre, minRating, sortField, sortOrder]);

  const totalPages = Math.ceil(processedBooks.length / pageSize) || 1;
  const paginatedBooks = processedBooks.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: keyof Book) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200/90 bg-white shadow-xs">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[240px]">
          {/* Search box */}
          <div className="relative flex flex-1 items-center min-w-[180px]">
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              id="book-search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, author, or ID..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pr-3 pl-8.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Genre select */}
          <select
            id="book-genre-filter"
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Genres ({genres.length})</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Min rating select */}
          <select
            id="book-min-rating-filter"
            value={minRating}
            onChange={(e) => {
              setMinRating(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value={0}>Any Rating</option>
            <option value={4.0}>★ 4.0 & above</option>
            <option value={4.5}>★ 4.5 & above</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {processedBooks.length} book{processedBooks.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Internal scrollable table container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("book_id")}
              >
                <div className="flex items-center gap-1">
                  ID
                  {sortField === "book_id" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Title
                  {sortField === "title" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("author")}
              >
                <div className="flex items-center gap-1">
                  Author
                  {sortField === "author" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("genre")}
              >
                <div className="flex items-center gap-1">
                  Genre
                  {sortField === "genre" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900"
                onClick={() => toggleSort("publication_year")}
              >
                <div className="flex items-center gap-1">
                  Year
                  {sortField === "publication_year" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900 text-right"
                onClick={() => toggleSort("average_rating")}
              >
                <div className="flex items-center justify-end gap-1">
                  Avg Rating
                  {sortField === "average_rating" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-900 text-right"
                onClick={() => toggleSort("rating_count")}
              >
                <div className="flex items-center justify-end gap-1">
                  Ratings
                  {sortField === "rating_count" &&
                    (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedBooks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs text-slate-400">
                  No books match the specified filters.
                </td>
              </tr>
            ) : (
              paginatedBooks.map((b) => (
                <tr key={b.book_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{b.book_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                    {b.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.author}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {b.genre}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{b.publication_year || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {b.average_rating.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {b.rating_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      id={`view-book-btn-${b.book_id}`}
                      onClick={() => onSelectBook(b.book_id)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
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
