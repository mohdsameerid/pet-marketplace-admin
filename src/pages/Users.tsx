import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';
import { getAllUsers, verifySeller, banUser, unbanUser } from '../api/admin';
import type { AdminUser } from '../types';
import Badge, { userStatusVariant } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

const ROLE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Buyer', value: 'Buyer' },
  { label: 'Seller', value: 'Seller' },
  { label: 'Admin', value: 'Admin' },
];

const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = (page = pageNumber, role = roleFilter) => {
    setLoading(true);
    getAllUsers(page, PAGE_SIZE, role || undefined)
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setUsers(d.items);
          setTotalPages(d.totalPages);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        }
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(pageNumber, roleFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, roleFilter]);

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPageNumber(1);
  };

  const handleAction = async (id: string, action: 'verify' | 'ban' | 'unban') => {
    setActionLoading(id + action);
    try {
      if (action === 'verify') await verifySeller(id);
      else if (action === 'ban') await banUser(id);
      else await unbanUser(id);
      toast.success(`User ${action === 'verify' ? 'verified' : action === 'ban' ? 'banned' : 'unbanned'}`);
      fetchUsers();
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
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filter by role:</span>
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleRoleFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              roleFilter === opt.value
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
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'City', 'Role', 'Status', 'Listings', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.phoneNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'Admin' ? 'info' : user.role === 'Seller' ? 'warning' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={userStatusVariant(user.isVerified, user.isBanned)}>
                        {user.isBanned ? 'Banned' : user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{user.totalListings}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.role === 'Seller' && !user.isVerified && !user.isBanned && (
                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={actionLoading === user.id + 'verify'}
                            onClick={() => handleAction(user.id, 'verify')}
                          >
                            Verify
                          </Button>
                        )}
                        {!user.isBanned && user.role !== 'Admin' && (
                          <Button
                            size="sm"
                            variant="danger"
                            isLoading={actionLoading === user.id + 'ban'}
                            onClick={() => handleAction(user.id, 'ban')}
                          >
                            Ban
                          </Button>
                        )}
                        {user.isBanned && (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={actionLoading === user.id + 'unban'}
                            onClick={() => handleAction(user.id, 'unban')}
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
