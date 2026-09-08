import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminUsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page
      });
      setUsers(res.users || []);
      setPagination(res.pagination || { total: 0, pages: 1 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    try {
      setTogglingId(user._id);
      const res = await adminService.toggleUserStatus(user._id);
      toast.success(res.message || 'User status updated');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: res.user?.status || (u.status === 'active' ? 'suspended' : 'active') } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'driver':
        return 'info';
      case 'provider':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect, manage permissions, and toggle access for all customers, providers, and drivers
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or Sri Lankan phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="provider">Service Providers</option>
              <option value="driver">Drivers (Drive My Vehicle)</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      {loading && users.length === 0 ? (
        <Loader text="Fetching users registry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users match the search criteria"
          description="Try clearing search filters or changing the role."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setRoleFilter('');
            setStatusFilter('');
            setPage(1);
          }}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-slate-400 text-[11px]">{user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{user.phone || 'N/A'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'} size="sm" className="capitalize">
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {user.role === 'admin' ? (
                        <span className="text-slate-400 text-[11px] italic">Superuser</span>
                      ) : (
                        <Button
                          size="xs"
                          variant={user.status === 'active' ? 'outline' : 'success'}
                          loading={togglingId === user._id}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="w-3 h-3 mr-1 text-rose-600" />
                              <span className="text-rose-600">Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Total: <strong className="text-slate-800">{pagination.total}</strong> accounts
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-800">
                  {page} / {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
