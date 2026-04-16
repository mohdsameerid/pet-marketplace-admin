import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle, Search } from 'lucide-react';
import { getAllUsers, banUser, unbanUser } from '../api/admin';
import type { AdminUser } from '../types';
import Badge from '../components/ui/Badge';
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
  const [search, setSearch] = useState('');
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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleBan = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to ban ${user.fullName}?`
    );
    if (!confirmed) return;

    setActionLoading(user.id + 'ban');
    try {
      await banUser(user.id);
      toast.success(`${user.fullName} has been banned`);
      fetchUsers();
    } catch {
      toast.error('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (user: AdminUser) => {
    setActionLoading(user.id + 'unban');
    try {
      await unbanUser(user.id);
      toast.success(`${user.fullName} has been unbanned`);
      fetchUsers();
    } catch {
      toast.error('Failed to unban user');
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

  const roleBadgeVariant = (role: string) => {
    if (role === 'Admin') return 'info' as const;
    if (role === 'Seller') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <div className="space-y-4">
      {/* Filter + Search bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Role:</span>
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

        <div className="relative ml-auto">
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
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p>{search ? 'No users match your search' : 'No users found'}</p>
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
                    'Role',
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
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      user.isBanned
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span className="block truncate">{user.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {user.phoneNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {user.city ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    {/* Verified — only meaningful for Sellers */}
                    <td className="px-4 py-3">
                      {user.role === 'Seller' ? (
                        <Badge variant={user.isVerified ? 'success' : 'default'}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* Banned */}
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <Badge variant="danger">Banned</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* Listings — only for Sellers */}
                    <td className="px-4 py-3 text-center text-gray-600">
                      {user.role === 'Seller' ? user.totalListings : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!user.isBanned && (
                          <div
                            title={
                              user.role === 'Admin'
                                ? 'Cannot ban Admin users'
                                : undefined
                            }
                          >
                            <Button
                              size="sm"
                              variant="danger"
                              isLoading={actionLoading === user.id + 'ban'}
                              disabled={user.role === 'Admin'}
                              onClick={() => handleBan(user)}
                            >
                              Ban
                            </Button>
                          </div>
                        )}
                        {user.isBanned && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={actionLoading === user.id + 'unban'}
                            onClick={() => handleUnban(user)}
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
