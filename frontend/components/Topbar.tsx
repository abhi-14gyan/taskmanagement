'use client';

import { Plus } from 'lucide-react';
import UserAvatar from './UserAvatar';
import SearchBar from './SearchBar';

interface TopbarProps {
    searchQuery: string;
    onSearchChange: (v: string) => void;
    onNewTask: () => void;
}

export default function Topbar({ searchQuery, onSearchChange, onNewTask }: TopbarProps) {
    return (
        <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6
      bg-navy-950/80 backdrop-blur-sm sticky top-0 z-20">

            {/* Left: Search */}
            <SearchBar value={searchQuery} onChange={onSearchChange} />

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* New Task CTA */}
                <button onClick={onNewTask} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Task</span>
                </button>

                {/* User dropdown */}
                <UserAvatar />
            </div>
        </header>
    );
}
