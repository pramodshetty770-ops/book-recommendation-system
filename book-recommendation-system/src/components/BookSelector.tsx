import React, { useState } from "react";
import { Search, BookOpen, ChevronDown, Check } from "lucide-react";
import { Book } from "../types";

interface BookSelectorProps {
  books: Book[];
  selectedBookId: string;
  onSelectBook: (bookId: string) => void;
}

export const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  selectedBookId,
  onSelectBook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.genre.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBook = books.find((b) => b.book_id === selectedBookId);

  return (
    <div className="relative w-full">
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        Select Reference Book
      </label>

      {/* Main Trigger Button */}
      <button
        id="book-selector-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
      >
        {selectedBook ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">{selectedBook.title}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {selectedBook.genre}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedBook.author} • {selectedBook.average_rating}★ ({selectedBook.rating_count} ratings)
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Choose a book...</span>
        )}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="book-selector-dropdown"
          className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, or genre..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-50">
            {filteredBooks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No books found</div>
            ) : (
              filteredBooks.map((b) => {
                const isSelected = b.book_id === selectedBookId;
                return (
                  <button
                    key={b.book_id}
                    type="button"
                    onClick={() => {
                      onSelectBook(b.book_id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition-colors ${
                      isSelected ? "bg-emerald-50 text-emerald-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="font-semibold text-slate-900">{b.title}</div>
                      <span className="text-[11px] text-slate-500">by {b.author}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {b.genre}
                      </span>
                      <span className="text-[11px] text-amber-600 font-medium">
                        {b.average_rating}★
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
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
