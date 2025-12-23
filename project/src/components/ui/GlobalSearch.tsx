import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Users, Package, Receipt, Target, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    type: 'customer' | 'order' | 'quote' | 'invoice' | 'lead' | 'event';
    title: string;
    subtitle?: string;
    url: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    customer: Users,
    order: Package,
    quote: FileText,
    invoice: Receipt,
    lead: Target,
    event: Calendar
};

const typeLabels: Record<string, string> = {
    customer: 'Kund',
    order: 'Order',
    quote: 'Offert',
    invoice: 'Faktura',
    lead: 'Lead',
    event: 'Kalender'
};

const typeColors: Record<string, string> = {
    customer: 'bg-green-100 text-green-600',
    order: 'bg-blue-100 text-blue-600',
    quote: 'bg-purple-100 text-purple-600',
    invoice: 'bg-red-100 text-red-600',
    lead: 'bg-amber-100 text-amber-600',
    event: 'bg-indigo-100 text-indigo-600'
};

// Mock search function - in production, this would query Supabase
const mockSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock results based on query
    const results: SearchResult[] = [
        { id: '1', type: 'customer', title: 'ABC Bygg AB', subtitle: 'Stockholm', url: '/customers' },
        { id: '2', type: 'order', title: 'ORD-2024-001', subtitle: 'Taktvätt', url: '/orders' },
        { id: '3', type: 'quote', title: 'OFF-2024-015', subtitle: '25 000 kr', url: '/quotes' },
        { id: '4', type: 'invoice', title: 'FAK-2024-042', subtitle: 'Betald', url: '/invoices' },
        { id: '5', type: 'lead', title: 'XYZ Fastigheter', subtitle: 'Ny kontakt', url: '/leads' },
    ].filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase())
    );

    return results;
};

function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [onClose]);

    useEffect(() => {
        const searchDebounce = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const searchResults = await mockSearch(query);
                setResults(searchResults);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 150);

        return () => clearTimeout(searchDebounce);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        navigate(result.url);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden modal-animate-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Sök kunder, ordrar, offerter, fakturor..."
                        className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                    />
                    {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                    {!loading && query && (
                        <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="max-h-80 overflow-y-auto py-2">
                        {results.map((result, index) => {
                            const Icon = typeIcons[result.type] || FileText;
                            return (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center px-4 py-3 gap-3 transition-colors ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[result.type]}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900">{result.title}</p>
                                        {result.subtitle && (
                                            <p className="text-xs text-gray-500">{result.subtitle}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                                        {typeLabels[result.type]}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {query.length >= 2 && !loading && results.length === 0 && (
                    <div className="py-8 text-center">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Inga resultat för "{query}"</p>
                    </div>
                )}

                {/* Tips */}
                {query.length < 2 && (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                        <p>Skriv minst 2 tecken för att söka</p>
                        <div className="mt-3 flex justify-center gap-2 flex-wrap">
                            {['kund', 'order', 'offert', 'faktura', 'lead'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setQuery(type)}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">↓</kbd> navigera</span>
                        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">Enter</kbd> öppna</span>
                    </div>
                    <span><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">Esc</kbd> stäng</span>
                </div>
            </div>
        </div>
    );
}

export default GlobalSearch;
