import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Clock, CheckCircle } from 'lucide-react';
import { getPendingListings, approveListing, rejectListing } from '../api/admin';
import type { AdminListing } from '../types';
import { extractApiError } from '../utils/apiError';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

const PAGE_SIZE = 10;

interface RejectModalState {
  isOpen: boolean;
  listingId: string;
  reason: string;
  error: string;
  isSubmitting: boolean;
}

export default function PendingListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    isOpen: false,
    listingId: '',
    reason: '',
    error: '',
    isSubmitting: false,
  });

  const fetchListings = (page = pageNumber) => {
    setLoading(true);
    getPendingListings(page, PAGE_SIZE)
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setListings(d.items);
          setTotalCount(d.totalCount);
          setTotalPages(d.totalPages);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        }
      })
      .catch((err) => toast.error(extractApiError(err, 'Failed to load pending listings')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings(pageNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await approveListing(id);
      toast.success('Listing approved');
      fetchListings();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to approve listing'));
    } finally {
      setApproving(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectModal({ isOpen: true, listingId: id, reason: '', error: '', isSubmitting: false });
  };

  const closeRejectModal = () => {
    setRejectModal({ isOpen: false, listingId: '', reason: '', error: '', isSubmitting: false });
  };

  const handleRejectSubmit = async () => {
    if (rejectModal.reason.trim().length < 10) {
      setRejectModal((s) => ({ ...s, error: 'Reason must be at least 10 characters.' }));
      return;
    }
    setRejectModal((s) => ({ ...s, isSubmitting: true, error: '' }));
    try {
      await rejectListing(rejectModal.listingId, rejectModal.reason.trim());
      toast.success('Listing rejected');
      closeRejectModal();
      fetchListings();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to reject listing'));
      setRejectModal((s) => ({ ...s, isSubmitting: false }));
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Banner */}
      {!loading && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${totalCount > 0 ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-green-50 border-green-300 text-green-800'}`}>
          <Clock className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {totalCount > 0
              ? `${totalCount} listing${totalCount > 1 ? 's' : ''} waiting for your review`
              : 'All caught up! No pending listings.'}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400">Loading pending listings…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <CheckCircle className="w-10 h-10 text-green-200" />
            <p className="text-sm font-medium">No pending listings — all caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title', 'Species', 'Seller', 'Price', 'City', 'Status', 'Images', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                      {listing.breed && <p className="text-xs text-gray-400">{listing.breed}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{listing.species}</td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <p className="font-medium text-gray-900 truncate">{listing.sellerName}</p>
                      <p className="text-xs text-gray-400 truncate">{listing.sellerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{formatPrice(listing.price)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{listing.city}</td>
                    <td className="px-4 py-3">
                      <Badge variant="warning">Pending</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{listing.imageCount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(listing.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(listing.id)}
                          disabled={approving === listing.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {approving === listing.id ? <Spinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(listing.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={setPageNumber}
        />
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={closeRejectModal} title="Reject Listing">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value, error: '' }))}
              rows={4}
              placeholder="Explain why this listing is being rejected..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            {rejectModal.error && (
              <p className="text-xs text-red-600 mt-1">{rejectModal.error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={rejectModal.isSubmitting}
              onClick={handleRejectSubmit}
            >
              Reject Listing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
