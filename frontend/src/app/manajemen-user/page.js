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

  // Fetch users dari API
  useEffect(() => {
    fetchUsers();
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
    <div className="min-h-screen bg-base-200 p-4">
      {/* <ModalFormUser
        isOpen={isFormModalOpen}
        onClose={() => { setAPI(formUser) }}
        user={formUser}
        onSuccess={fetchUsers}
      /> */}
      <ModalFormUser
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        user={formUser}
        onSuccess={fetchUsers}
      />
      {/* Header */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-base-content/70 text-sm">Kelola pengguna dan sistem aplikasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc">Semua pengguna terdaftar</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="stat-title">Active Users</div>
          <div className="stat-value text-success">{stats.activeUsers}</div>
          <div className="stat-desc">Pengguna aktif</div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">User Management</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                setFormUser(null);     // Create
                setIsFormModalOpen(true);
              }}
            >
              + Add User
            </button>
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Cari user..."
                  className="input input-bordered input-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={fetchUsers}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="table table-sm table-zebra w-full">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Name</th>
                <th className="text-center">Email</th>
                <th className="text-center">Status</th>
                <th className="text-center">Tanggal Dibuat</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.id} className="hover">
                    <td>{indexOfFirstUser + index + 1}</td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-semibold">{user.name || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email || 'No email'}</td>
                    <td className="text-center">
                      <div className={`capitalize badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {user.status || 'Inactive'}
                      </div>
                    </td>
                    <td className="text-center">{new Date(user.created_at).toLocaleDateString('id-ID') || 'N/A'}</td>
                    <td className="text-center items-center flex w-full justify-center">
                      <div className="flex space-x-2">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setFormUser(user);
                            setIsFormModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => handleDeleteConfirm(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-base-content/50">
                      {searchTerm ? 'Tidak ada user yang ditemukan' : 'Tidak ada data user'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="btn-group">
              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-semibold text-xl mb-4">User Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="label font-semibold">Name:</label>
                <p className="font-semibold text-gray-700">{selectedUser.name || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="label font-semibold">Email:</label>
                <p className="font-semibold text-gray-700">{selectedUser.email || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="label font-semibold">Status:</label>
                <div className={`badge capitalize ${selectedUser.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedUser.status || 'inactive'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="label font-semibold">Tanggal dibuat:</label>
                <p className="font-semibold text-gray-700">
                  {new Date(selectedUser.created_at).toLocaleString('id-ID') || 'N/A'}
                </p>
              </div>
              <div className="flex items-start gap-2 flex-col sm:flex-row">
                <label className="label font-semibold">Roles:</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const hasRole = selectedUser.roles?.some(r => r.id === role.id);
                    return (
                      <button
                        key={role.id}
                        className={`badge cursor-pointer px-4 py-2 transition ${hasRole ? 'badge-primary' : 'badge-ghost'
                          }`}
                        disabled={updatingRole}
                        onClick={() =>
                          handleToggleRole(role.id, hasRole)
                        }
                      >
                        {role.name}
                      </button>
                    );
                  })}
                  {updatingRole && <span className="loading loading-spinner loading-sm ml-2"></span>}
                </div>
              </div>


              {selectedUser.phone && (
                <div className="flex items-center gap-2">
                  <label className="label font-semibold">Phone:</label>
                  <p className="font-semibold text-gray-700">{selectedUser.phone}</p>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => setIsModalOpen(false)}>
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