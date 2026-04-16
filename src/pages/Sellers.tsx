import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';
import { getAllUsers, verifySeller, banUser, unbanUser } from '../api/admin';
import type { AdminUser } from '../types';
import Badge, { userStatusVariant } from '../components/ui/Badge';
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
      .catch(() => toast.error('Failed to load sellers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers(pageNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleAction = async (id: string, action: 'verify' | 'ban' | 'unban') => {
    setActionLoading(id + action);
    try {
      if (action === 'verify') await verifySeller(id);
      else if (action === 'ban') await banUser(id);
      else await unbanUser(id);
      toast.success(`Seller ${action === 'verify' ? 'verified' : action === 'ban' ? 'banned' : 'unbanned'}`);
      fetchSellers();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : sellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p>No sellers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'City', 'Status', 'Listings', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{seller.fullName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{seller.email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{seller.phoneNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{seller.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={userStatusVariant(seller.isVerified, seller.isBanned)}>
                        {seller.isBanned ? 'Banned' : seller.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{seller.totalListings}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(seller.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!seller.isVerified && !seller.isBanned && (
                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={actionLoading === seller.id + 'verify'}
                            onClick={() => handleAction(seller.id, 'verify')}
                          >
                            Verify
                          </Button>
                        )}
                        {!seller.isBanned && (
                          <Button
                            size="sm"
                            variant="danger"
                            isLoading={actionLoading === seller.id + 'ban'}
                            onClick={() => handleAction(seller.id, 'ban')}
                          >
                            Ban
                          </Button>
                        )}
                        {seller.isBanned && (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={actionLoading === seller.id + 'unban'}
                            onClick={() => handleAction(seller.id, 'unban')}
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
