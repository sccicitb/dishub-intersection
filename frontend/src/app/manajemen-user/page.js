'use client'

import { authApi } from "@/lib/apiService";
import { useState, useEffect } from 'react';
import ModalFormUser from '@/app/components/ui/modalForm';
import { ToastContainer, toast } from 'react-toastify';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formUser, setFormUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [modalTab, setModalTab] = useState('details'); // 'details' or 'password' (modal)
  const [mainTab, setMainTab] = useState('user-management'); // 'user-management' or 'password' (main page)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Current logged-in user
  const [changeUserPasswordForm, setChangeUserPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [changeUserPasswordLoading, setChangeUserPasswordLoading] = useState(false);

  // Helper function untuk ambil cookie value
  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Fetch users dari API
  useEffect(() => {
    fetchUsers();
    // Get current logged-in user dari cookies
    try {
      // Cek dari cookies dengan nama 'user' yang berisi JSON
      const userCookie = getCookieValue('user');
      if (userCookie) {
        try {
          // Cookie value mungkin di-encode, jadi decode dulu
          const decodedUser = decodeURIComponent(userCookie);
          const parsedUser = JSON.parse(decodedUser);
          if (parsedUser?.id) {
            setCurrentUser({ id: parseInt(parsedUser.id) });
            console.log('Current user from cookies:', parsedUser.name);
            return;
          }
        } catch (e) {
          console.warn('Gagal parse user dari cookies:', e);
        }
      }
      
      // Fallback: cek dari localStorage (format JSON)
      let userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser?.id) {
            setCurrentUser({ id: parseInt(parsedUser.id) });
            return;
          }
        } catch (e) {
          console.warn('Gagal parse user dari localStorage:', e);
        }
      }
      
      // Fallback: cek dari berbagai kemungkinan key di localStorage
      const userId = localStorage.getItem('id_user') || localStorage.getItem('userId');
      if (userId) {
        setCurrentUser({ id: parseInt(userId) });
        return;
      }
      
      console.warn('User ID tidak ditemukan di cookies atau localStorage');
    } catch (err) {
      console.warn('Error getting current user:', err);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.getAllUser();
      // if (!response.ok) {
      //   throw new Error('Failed to fetch users');
      // }
      console.log(response)
      const usersData = response?.data?.data?.users || [];
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Operator' },
    { id: 3, name: 'Viewer' }
  ];

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role_id); // atau role_id dari API
    }
  }, [selectedUser]);

  const handleChangeRole = async (newRoleId) => {
    setSelectedRole(newRoleId);
    setUpdatingRole(true);
    try {
      const response = await authApi.addUserRole(selectedUser.id, { role_id: newRoleId });
      toast.success(response.message || 'Berhasil mengubah role');
    } catch (err) {
      toast.error('Gagal mengubah role: ' + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  // const setAPI = async (data) => {
  //   try {
  //     setIsFormModalOpen(false)
  //     setLoading(true);
  //     console.log(data)
  //     const response = await authApi.createNewUser(data);
  //     if (response.status !== 201) return;
  //     toast.success("Sukses membuat data baru " + response.message, { position: 'top-right' });
  //   }
  //   catch (err) {
  //     toast.error("Gagal membuat data baru " + err.message, { position: 'top-right' });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const handleCreateOrUpdateUser = async (data) => {
    try {
      setLoading(true);
      const response = formUser
        ? await authApi.updateUser(formUser.id, data)
        : await authApi.createNewUser(data);

      if (!response.success) return;
      toast.success("Sukses membuat data baru " + response.message, { position: 'top-right' });
      console.log(response.status)

      toast.success(`Sukses ${formUser ? 'mengubah' : 'menambah'} user`, {
        position: 'top-right',
      });
      setIsFormModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(`Gagal menyimpan data user: ${err.message}`, {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users berdasarkan search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (userId) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="mb-2">Yakin ingin menghapus user ini?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => handleDeleteUser(userId)
              }
              className="btn btn-sm btn-error"
            >
              Ya, hapus
            </button>
            <button onClick={closeToast} className="btn btn-sm">
              Batal
            </button>
          </div>
        </div>),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: true,
        closeButton: false,
      }
    );
  };

  const handleToggleRole = async (roleId, hasRole) => {
    setUpdatingRole(true);
    try {
      if (hasRole) {
        await authApi.deleteUserRole(selectedUser.id, roleId);
        toast.info('Role dihapus');
      } else {
        await authApi.addUserRole(selectedUser.id, { role_id: roleId });
        toast.success('Role ditambahkan');
      }

      // Update tampilan selectedUser.roles lokal
      const updatedRoles = hasRole
        ? selectedUser.roles.filter(r => r.id !== roleId)
        : [...(selectedUser.roles || []), roles.find(r => r.id === roleId)];

      setSelectedUser(prev => ({
        ...prev,
        roles: updatedRoles
      }));
    } catch (err) {
      toast.error('Gagal mengubah role: ' + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };



  const handleDeleteUser = async (userId) => {
    try {
      const response = await authApi.deleteByIdUser(userId)
      if (response.status === 200) {
        setUsers(users.filter(user => user.id !== userId));
        toast.info("User berhasil dihapus", { position: 'top-right' });
      } else {
        toast.error("User gagal dihapus", { position: 'top-right' });
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Check if currentUser exists
    if (!currentUser || !currentUser.id) {
      toast.error(`User tidak ditemukan. Silakan refresh halaman dan login ulang. `);
      return;
    }
    
    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    // Konfirmasi sebelum update
    const confirmed = window.confirm('Apakah Anda yakin ingin mengganti password?\n\nPassword lama tidak akan bisa digunakan lagi setelah perubahan ini.');
    if (!confirmed) {
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authApi.changePassword(currentUser.id, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      toast.success(response.data.message || 'Password berhasil diubah');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeUserPassword = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedUser.id) {
      toast.error('User tidak ditemukan');
      return;
    }

    if (!changeUserPasswordForm.newPassword || !changeUserPasswordForm.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (changeUserPasswordForm.newPassword !== changeUserPasswordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (changeUserPasswordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    // Konfirmasi sebelum update
    const confirmed = window.confirm(`Apakah Anda yakin ingin mengganti password untuk user "${selectedUser.name}"?\n\nPassword lama tidak akan bisa digunakan lagi setelah perubahan ini.`);
    if (!confirmed) {
      return;
    }

    setChangeUserPasswordLoading(true);
    try {
      const response = await authApi.changePassword(selectedUser.id, {
        newPassword: changeUserPasswordForm.newPassword,
        confirmPassword: changeUserPasswordForm.confirmPassword
      });

      toast.success(response.data.message || 'Password user berhasil diubah');
      setChangeUserPasswordForm({ newPassword: '', confirmPassword: '' });
      setModalTab('details');
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setChangeUserPasswordLoading(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === 'active').length,
    newUsers: users.filter(user => {
      const userDate = new Date(user.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full items-center flex ">
        <div className="m-auto capitalize">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modals */}
      <ModalFormUser
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        user={formUser}
        onSuccess={fetchUsers}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola pengguna dan sistem aplikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b border-slate-200">
          <button
            onClick={() => setMainTab('user-management')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              mainTab === 'user-management'
                ? 'text-[#232f61]/90 border-[#232f61]/90'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            👥 Manajemen Pengguna
          </button>
          <button
            onClick={() => setMainTab('password')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              mainTab === 'password'
                ? 'text-[#232f61]/90 border-[#232f61]/90'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            🔐 Password
          </button>
        </div>

        {/* User Management Tab */}
        {mainTab === 'user-management' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Pengguna</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pengguna Aktif</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-lg border border-slate-200">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Pengguna</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cari pengguna..."
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232f61]/90"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setFormUser(null);
                      setIsFormModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#232f61]/90 text-white rounded-lg text-sm font-medium hover:bg-[#232f61] transition-colors"
                  >
                    Tambah Pengguna
                  </button>
                  <button
                    onClick={fetchUsers}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Refresh"
                  >
                    ⟳
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
                        <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">{indexOfFirstUser + index + 1}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.email || 'No email'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.status || 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(user.created_at).toLocaleDateString('id-ID') || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setFormUser(user);
                                  setIsFormModalOpen(true);
                                }}
                                className="text-[#232f61]/90 hover:text-[#232f61] text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(user.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          {searchTerm ? 'No users found' : 'No users'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex justify-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-[#232f61]/90 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Tab */}
        {mainTab === 'password' && (
          <div className="bg-white rounded-lg border border-slate-200 max-w-md mx-auto">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Ubah Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232f61]/90 text-sm"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    disabled={passwordLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru (min 6 karakter)"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232f61]/90 text-sm"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    disabled={passwordLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232f61]/90 text-sm"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    disabled={passwordLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full mt-6 px-4 py-2 bg-[#232f61]/90 text-white rounded-lg font-medium hover:bg-[#232f61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {passwordLoading && <span className="loading loading-spinner loading-sm"></span>}
                  {passwordLoading ? 'Processing...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">User Details</h3>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 px-6 pt-4 border-b border-slate-200">
              <button
                onClick={() => setModalTab('details')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  modalTab === 'details'
                    ? 'text-[#232f61]/90 border-[#232f61]/90'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setModalTab('password')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  modalTab === 'password'
                    ? 'text-[#232f61]/90 border-[#232f61]/90'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                🔐 Change Password
              </button>
            </div>
            
            {/* Details Tab */}
            {modalTab === 'details' && (
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="text-base font-medium text-slate-900">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="text-base font-medium text-slate-900">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                    selectedUser.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.status || 'inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Joined</p>
                  <p className="text-base font-medium text-slate-900">
                    {new Date(selectedUser.created_at).toLocaleString('id-ID') || 'N/A'}
                  </p>
                </div>
                {selectedUser.roles && selectedUser.roles.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.map((role) => (
                        <span key={role.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {roles.map((role) => {
                    const hasRole = selectedUser.roles?.some(r => r.id === role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleToggleRole(role.id, hasRole)}
                        disabled={updatingRole}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          hasRole
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        } disabled:opacity-50`}
                      >
                        {role.name}
                      </button>
                    );
                  })}
                  {updatingRole && <span className="loading loading-spinner loading-sm"></span>}
                </div>
              </div>
            )}

            {/* Password Tab */}
            {modalTab === 'password' && (
              <div className="px-6 py-4">
                <form onSubmit={handleChangeUserPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan password baru (min 6 karakter)"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232f61]/90 text-sm"
                      value={changeUserPasswordForm.newPassword}
                      onChange={(e) => setChangeUserPasswordForm({ ...changeUserPasswordForm, newPassword: e.target.value })}
                      disabled={changeUserPasswordLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      placeholder="Konfirmasi password baru"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#232f61]/90 text-sm"
                      value={changeUserPasswordForm.confirmPassword}
                      onChange={(e) => setChangeUserPasswordForm({ ...changeUserPasswordForm, confirmPassword: e.target.value })}
                      disabled={changeUserPasswordLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changeUserPasswordLoading}
                    className="w-full mt-6 px-4 py-2 bg-[#232f61]/90 text-white rounded-lg font-medium hover:bg-[#232f61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {changeUserPasswordLoading && <span className="loading loading-spinner loading-sm"></span>}
                    {changeUserPasswordLoading ? 'Processing...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;