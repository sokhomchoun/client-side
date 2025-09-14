interface BlockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BlockModal({ isOpen, onClose }: BlockModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-red-600">Account Blocked</h2>
                <p className="mb-4 text-black">Your account has been blocked. Please contact SellMeApp Team for help.</p>
                <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
}
