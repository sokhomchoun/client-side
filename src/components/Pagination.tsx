interface PaginationProps {
    currentPage: number;
    totalCount: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalCount, itemsPerPage, onPageChange }: PaginationProps) {
    const generatePagination = (totalPages: number, currentPage: number): (number | string)[] => {

        const pagination: (number | string)[] = [];
        pagination.push(1);

        const siblings = 1;
        const left = Math.max(currentPage - siblings, 2);
        const right = Math.min(currentPage + siblings, totalPages - 1);

        if (right < totalPages - 1) { 
            for (let i = left; i <= right; i++) {
                pagination.push(i);
            }
            pagination.push('...');
            pagination.push(totalPages);
        } else if (left > 2) {

            pagination.push('...');
            for (let i = left; i <= totalPages; i++) {
                pagination.push(i);
            }
        } else {
            for (let i = 2; i <= totalPages; i++) {
                pagination.push(i);
            }
        }

        return pagination;
    };


    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const pages = generatePagination(totalPages, currentPage);

    return (
        <div className="mt-3 flex justify-end">
            <nav aria-label="Page navigation">
                <ul className="flex items-center -space-x-px h-10 text-base">
                    {/* Previous */}
                    <li>
                        <button
                            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 h-10 border rounded-s-lg text-gray-500 hover:bg-[#0a1c47] disabled:opacity-50">
                        ‹
                        </button>
                    </li>
                    {/* Page numbers */}
                    {pages.map((p, i) => (
                        <li key={i}>
                            {p === '...' ? (
                                <span className="px-4 h-10 flex items-center">…</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(Number(p))}
                                    className={`px-4 h-10 border ${
                                        currentPage === p ? 'bg-[#0a1c47] text-white' : 'text-gray-500 hover:bg-[#0a1c47]'
                                    }`}>
                                {p}
                                </button>
                            )}
                        </li>
                    ))}
                    {/* Next */}
                    <li>
                        <button
                            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 h-10 border rounded-e-lg text-gray-500 hover:bg-[#0a1c47] disabled:opacity-50">
                        ›
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};
