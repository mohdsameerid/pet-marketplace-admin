import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Users as UsersIcon, Pencil } from 'lucide-react';
import { getAllUsers, banUser, unbanUser, updateUser } from '../api/admin';
import type { UpdateUserPayload } from '../api/admin';
import type { AdminUser } from '../types';
import { extractApiError } from '../utils/apiError';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ROLE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Buyer', value: 'Buyer' },
  { label: 'Seller', value: 'Seller' },
  { label: 'Admin', value: 'Admin' },
];

const PAGE_SIZE = 10;

interface EditForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
}

interface EditModalState {
  isOpen: boolean;
  user: AdminUser | null;
  form: EditForm;
  errors: Partial<EditForm>;
  isSubmitting: boolean;
}

const emptyForm: EditForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  city: '',
};

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit modal
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    user: null,
    form: emptyForm,
    errors: {},
    isSubmitting: false,
  });

  // Ban confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    isLoading: boolean;
  }>({ isOpen: false, user: null, isLoading: false });

  const fetchUsers = (page = pageNumber, role = roleFilter) => {
    setLoading(true);
    getAllUsers(page, PAGE_SIZE, role || undefined)
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setUsers(d.items);
          setTotalCount(d.totalCount);
          setTotalPages(d.totalPages);
          setHasNextPage(d.hasNextPage);
          setHasPreviousPage(d.hasPreviousPage);
        }
      })
      .catch((err) => toast.error(extractApiError(err, 'Failed to load users')))
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

  // ── Edit modal ────────────────────────────────────────────
  const openEdit = (user: AdminUser) => {
    setEditModal({
      isOpen: true,
      user,
      form: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? '',
        city: user.city ?? '',
      },
      errors: {},
      isSubmitting: false,
    });
  };

  const closeEdit = () => {
    if (editModal.isSubmitting) return;
    setEditModal((s) => ({ ...s, isOpen: false }));
  };

  const setField = (field: keyof EditForm, value: string) => {
    setEditModal((s) => ({
      ...s,
      form: { ...s.form, [field]: value },
      errors: { ...s.errors, [field]: undefined },
    }));
  };

  const validateForm = (form: EditForm): Partial<EditForm> => {
    const errs: Partial<EditForm> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    return errs;
  };

  const handleEditSubmit = async () => {
    const errs = validateForm(editModal.form);
    if (Object.keys(errs).length > 0) {
      setEditModal((s) => ({ ...s, errors: errs }));
      return;
    }

    setEditModal((s) => ({ ...s, isSubmitting: true }));

    const payload: UpdateUserPayload = {
      fullName: editModal.form.fullName.trim(),
      email: editModal.form.email.trim(),
      phoneNumber: editModal.form.phoneNumber.trim() || undefined,
      city: editModal.form.city.trim() || undefined,
      role: editModal.user!.role,
    };

    try {
      await updateUser(editModal.user!.id, payload);
      toast.success('User updated successfully');
      setEditModal((s) => ({ ...s, isOpen: false }));
      fetchUsers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to update user'));
      setEditModal((s) => ({ ...s, isSubmitting: false }));
    }
  };

  // ── Ban / Unban ───────────────────────────────────────────
  const openBanConfirm = (user: AdminUser) =>
    setConfirmDialog({ isOpen: true, user, isLoading: false });

  const handleBanConfirmed = async () => {
    const user = confirmDialog.user;
    if (!user) return;
    setConfirmDialog((s) => ({ ...s, isLoading: true }));
    try {
      await banUser(user.id);
      toast.success(`${user.fullName} has been banned`);
      setConfirmDialog({ isOpen: false, user: null, isLoading: false });
      fetchUsers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to ban user'));
      setConfirmDialog((s) => ({ ...s, isLoading: false }));
    }
  };

  const handleUnban = async (user: AdminUser) => {
    setActionLoading(user.id + 'unban');
    try {
      await unbanUser(user.id);
      toast.success(`${user.fullName} has been unbanned`);
      fetchUsers();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to unban user'));
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

  const { form, errors } = editModal;

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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${roleFilter === opt.value
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
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400">Loading users…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <UsersIcon className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-medium">
              {search ? 'No users match your search' : 'No users found'}
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
          <>
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              {search
                ? `${filteredUsers.length} result${filteredUsers.length !== 1 ? 's' : ''} for "${search}" (this page)`
                : `${totalCount} user${totalCount !== 1 ? 's' : ''} total`}
            </div>
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
                      className={`transition-colors ${user.isBanned
                        ? 'bg-red-50 hover:bg-red-100/70'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {user.fullName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                        <span className="block truncate" title={user.email}>
                          {user.email}
                        </span>
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
                      <td className="px-4 py-3">
                        {user.role === 'Seller' ? (
                          <Badge variant={user.isVerified ? 'success' : 'default'}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.isBanned ? (
                          <Badge variant="danger">Banned</Badge>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {user.role === 'Seller' ? user.totalListings : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>

                          {/* Ban / Unban */}
                          {!user.isBanned && (
                            <span
                              title={
                                user.role === 'Admin'
                                  ? 'Cannot ban Admin users'
                                  : undefined
                              }
                            >
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={user.role === 'Admin'}
                                onClick={() => openBanConfirm(user)}
                              >
                                Ban
                              </Button>
                            </span>
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
          </>
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={setPageNumber}
        />
      </div>

      {/* ── Edit User Modal ── */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEdit}
        title={`Edit User — ${editModal.user?.fullName ?? ''}`}
      >
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-400' : 'border-gray-300'
                }`}
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
              placeholder="user@example.com"
              disabled={true}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-yellow-600 mt-1">{"You can not change the email address"}</p>
          </div>

          {/* Phone + City side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setField('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mumbai"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={closeEdit} disabled={editModal.isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={editModal.isSubmitting}
              onClick={handleEditSubmit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban confirm dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Ban User"
        message={
          confirmDialog.user
            ? `Are you sure you want to ban ${confirmDialog.user.fullName}? They will no longer be able to access the platform.`
            : ''
        }
        confirmLabel="Ban User"
        isLoading={confirmDialog.isLoading}
        onConfirm={handleBanConfirmed}
        onCancel={() =>
          !confirmDialog.isLoading &&
          setConfirmDialog({ isOpen: false, user: null, isLoading: false })
        }
      />
    </div>
  );
}
