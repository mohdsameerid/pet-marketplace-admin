import { useEffect, useMemo, useState } from 'react';
import { toast } from '../utils/toast';
import { Store, Search, ShieldCheck } from 'lucide-react';
import { getAllUsers, verifyUser, banUser, unbanUser } from '../api/admin';
import type { AdminUser } from '../types';
import { extractApiError } from '../utils/apiError';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

const PAGE_SIZE = 10;

export default function Sellers() {
  const [sellers, setSellers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSellers = (page = pageNumber) => {
    setLoading(true);
    getAllUsers(page, PAGE_SIZE, 'Seller')
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setSellers(d.items);
          setTotalPages(d.totalPages);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        }
      })
      .catch((err) => toast.error(extractApiError(err, 'Failed to load sellers')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const filteredSellers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [sellers, search]);

  const handleVerify = async (seller: AdminUser) => {
    setActionLoading(seller.id + 'verify');
    try {
      await verifyUser(seller.id);
      toast.success('Seller verified successfully');
      fetchSellers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to verify seller'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async (seller: AdminUser) => {
    setActionLoading(seller.id + 'ban');
    try {
      await banUser(seller.id);
      toast.success(`${seller.fullName} has been banned`);
      fetchSellers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to ban seller'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (seller: AdminUser) => {
    setActionLoading(seller.id + 'unban');
    try {
      await unbanUser(seller.id);
      toast.success(`${seller.fullName} has been unbanned`);
      fetchSellers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to unban seller'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Showing all sellers — verify, ban, or unban accounts
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400">Loading sellers…</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <Store className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-medium">
              {search ? 'No sellers match your search' : 'No sellers found'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    'Full Name',
                    'Email',
                    'Phone',
                    'City',
                    'Verified',
                    'Banned',
                    'Listings',
                    'Joined',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className={`transition-colors ${
                      seller.isBanned
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {seller.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span className="block truncate">{seller.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {seller.phoneNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {seller.city ?? '—'}
                    </td>
                    {/* Verified */}
                    <td className="px-4 py-3">
                      {seller.isVerified ? (
                        <Badge variant="success">
                          <ShieldCheck className="w-3 h-3 mr-1 inline-block" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="default">Not Verified</Badge>
                      )}
                    </td>
                    {/* Banned */}
                    <td className="px-4 py-3">
                      {seller.isBanned ? (
                        <Badge variant="danger">Banned</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {seller.totalListings}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(seller.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Verify button — shown when not yet verified and not banned */}
                        {!seller.isVerified && !seller.isBanned && (
                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={actionLoading === seller.id + 'verify'}
                            onClick={() => handleVerify(seller)}
                          >
                            Verify Seller
                          </Button>
                        )}
                        {/* Ban / Unban */}
                        {!seller.isBanned ? (
                          <Button
                            size="sm"
                            variant="danger"
                            isLoading={actionLoading === seller.id + 'ban'}
                            onClick={() => handleBan(seller)}
                          >
                            Ban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={actionLoading === seller.id + 'unban'}
                            onClick={() => handleUnban(seller)}
                          >
                            Unban
                          </Button>
                        )}
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
    </div>
  );
}
