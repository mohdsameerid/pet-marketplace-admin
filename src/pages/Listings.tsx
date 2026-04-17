import { useEffect, useState } from 'react';
import { toast } from '../utils/toast';
import { Check, X, List } from 'lucide-react';
import { getAllListings, approveListing, rejectListing } from '../api/admin';
import type { AdminListing, ListingStatus } from '../types';
import { extractApiError } from '../utils/apiError';
import Badge, { listingStatusVariant } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending Approval', value: 'PendingApproval' },
  { label: 'Active', value: 'Active' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Sold', value: 'Sold' },
];

const PAGE_SIZE = 10;

interface RejectModalState {
  isOpen: boolean;
  listingId: string;
  reason: string;
  error: string;
  isSubmitting: boolean;
}

export default function Listings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    isOpen: false,
    listingId: '',
    reason: '',
    error: '',
    isSubmitting: false,
  });

  const fetchListings = (page = pageNumber, status = statusFilter) => {
    setLoading(true);
    getAllListings(page, PAGE_SIZE, status || undefined)
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setListings(d.items);
          setTotalPages(d.totalPages);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        }
      })
      .catch((err) => toast.error(extractApiError(err, 'Failed to load listings')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings(pageNumber, statusFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, statusFilter]);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPageNumber(1);
  };

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
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400">Loading listings…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <List className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-medium">No listings found</p>
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
                      <div className="flex flex-col gap-1">
                        <Badge variant={listingStatusVariant(listing.status as ListingStatus)}>
                          {listing.status === 'PendingApproval' ? 'Pending' : listing.status}
                        </Badge>
                        {listing.status === 'Rejected' && listing.rejectionReason && (
                          <span className="text-xs text-red-500 max-w-[120px] truncate" title={listing.rejectionReason}>
                            {listing.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{listing.imageCount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(listing.createdAt)}</td>
                    <td className="px-4 py-3">
                      {listing.status === 'PendingApproval' && (
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
                      )}
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
