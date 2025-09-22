import React, { useEffect, useState } from 'react';
import { Filter, Plus, Edit2, Trash2, X } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import Dropdown from '../reusablecontrols/Dropdown';
import DatePicker from '../reusablecontrols/DatePicker';
import InputField from '../reusablecontrols/InputField';
import { getCategories } from '../services/transactionsService';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTransactions as fetchTransactionsThunk,
  createTransaction as createTransactionThunk,
  updateTransaction as updateTransactionThunk,
  deleteTransaction as deleteTransactionThunk,
} from '../store/transactionsSlice';
import { fetchAnalytics } from '../store/analyticsSlice';

const Transactions = () => {
  const [filters, setFilters] = useState({ type: '', category: '', fromDate: '', toDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const dispatch = useDispatch();
  const { items: transactions, loading } = useSelector(state => state.transactions);
  const analyticsFilters = useSelector(state => state.analytics.filters);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    date: '',
    type: '',
    description: '',
    category: '',
    amount: ''
  });

  const [typeOptions, setTypeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [modalCategories, setModalCategories] = useState([]);

  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));

    const filteredCategories = categoryOptions
      .filter(c => c.type.toLowerCase() === value.toLowerCase())
      .map(c => ({ value: c.value, label: c.label }));

    setModalCategories(filteredCategories);

    // Only reset category if we're not editing or if the current category doesn't match the new type
    if (!isEditing) {
      setNewTransaction(prev => ({ ...prev, category: '' }));
    } else {
      // Check if current category is valid for the new type
      const currentCategoryValid = filteredCategories.some(cat => cat.value === newTransaction.category);
      if (!currentCategoryValid) {
        setNewTransaction(prev => ({ ...prev, category: '' }));
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const categories = res.categories;

      // Extract unique types for type dropdown
      const types = [...new Set(categories.map(c => c.type))].map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      }));

      // Map categories for category dropdown
      const categoriesMapped = categories.map(c => ({
        value: c._id,
        label: c.name,
        type: c.type,
      }));

      setTypeOptions(types);
      setCategoryOptions(categoriesMapped);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to fetch categories');
    }
  };

  const fetchTransactions = async () => {
    try {
      const apiFilters = {};
      if (filters.type) apiFilters.type = filters.type;
      if (filters.category) apiFilters.category = filters.category; // <-- new
      if (filters.fromDate && filters.toDate) {
        apiFilters.start = filters.fromDate;
        apiFilters.end = filters.toDate;
      }
      await dispatch(fetchTransactionsThunk(apiFilters)).unwrap();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(error || 'Failed to fetch transactions');
    }
  };


  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // Refetch transactions when filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const modalTypeOptions = typeOptions.filter(option => option.value !== '');

  const handleClearFilters = () => {
    setFilters({ type: '', category: '', fromDate: '', toDate: '' });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setNewTransaction({ date: '', type: '', description: '', category: '', amount: '' });
    setModalCategories([]);
    setIsEditing(false);
    setEditingTransactionId(null);
    setShowModal(false);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.date || !newTransaction.type || !newTransaction.description ||
      !newTransaction.category || !newTransaction.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const transactionData = {
        date: newTransaction.date,
        type: newTransaction.type.toLowerCase(),
        description: newTransaction.description,
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount)
      };

      if (isEditing) {
        await dispatch(updateTransactionThunk({ id: editingTransactionId, data: transactionData })).unwrap();
        toast.success('Transaction updated successfully');
      } else {
        await dispatch(createTransactionThunk(transactionData)).unwrap();
        toast.success('Transaction created successfully');
      }
      resetModal();
      await fetchTransactions();
      await dispatch(fetchAnalytics(analyticsFilters));
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} transaction:`, error);
      toast.error(error || `Failed to ${isEditing ? 'update' : 'create'} transaction`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (transaction) => {
    // Format date for input (YYYY-MM-DD format)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        return '';
      }
    };

    // Get category ID from transaction
    const categoryId = typeof transaction.category === 'object'
      ? transaction.category._id
      : transaction.category;

    // Set form data
    setNewTransaction({
      date: formatDateForInput(transaction.date),
      type: transaction.type,
      description: transaction.description || '',
      category: categoryId || '',
      amount: transaction.amount ? transaction.amount.toString() : ''
    });

    // Set modal categories based on transaction type
    const filteredCategories = categoryOptions
      .filter(c => c.type.toLowerCase() === transaction.type.toLowerCase())
      .map(c => ({ value: c.value, label: c.label }));

    setModalCategories(filteredCategories);
    setIsEditing(true);
    setEditingTransactionId(transaction._id || transaction.id);
    setShowModal(true);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const transactionId = transactionToDelete._id || transactionToDelete.id;
      await dispatch(deleteTransactionThunk(transactionId)).unwrap();
      toast.success('Transaction deleted successfully');
      await fetchTransactions();
      await dispatch(fetchAnalytics(analyticsFilters));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error || 'Failed to delete transaction');
    } finally {
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount !== 'number') {
      return '₹0';
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Get category name from category ID - FIXED
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Unknown';

    // Handle case where categoryId is an object
    if (typeof categoryId === 'object') {
      return categoryId.name || 'Unknown';
    }

    // Handle case where categoryId is a string (ID)
    const category = categoryOptions.find(c => c.value === categoryId);
    return category ? category.label : 'Unknown';
  };

  if (loading) {
    return (
      <div className="px-2 sm:px-4 pb-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col justify-center items-center py-12">
            <ClipLoader
              color="#2563eb"
              loading={loading}
              size={40}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="mt-4 text-gray-600 text-sm font-medium">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 pb-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            {/* Header */}
            <div className="flex items-center xl:shrink-0">
              <Filter size={20} className="text-gray-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 whitespace-nowrap">Apply filters to transactions:</h3>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
              {/* Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Dropdown
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  options={typeOptions}
                  className="w-full"
                  placeholder="Select Type"
                />
                <Dropdown
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  options={categoryOptions}
                  className="w-full"
                  placeholder="Select Category"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">FROM:</label>
                  <DatePicker
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">TO:</label>
                  <DatePicker
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end sm:justify-start xl:ml-auto">
                <button
                  onClick={handleClearFilters}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-300 whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Transactions ({transactions.length})
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center hover:from-blue-700 hover:to-purple-800 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Transaction
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found. Add your first transaction!</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {transactions.map((t, index) => (
                  <div key={t._id || t.id || index} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${(t.type === 'income' || t.type === 'Income') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {String(t.type || 'Unknown').charAt(0).toUpperCase() + String(t.type || 'Unknown').slice(1)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium text-gray-800">{formatDate(t.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Description:</span>
                        <span className="text-sm font-medium text-gray-800 text-right">{String(t.description || 'No description')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm text-gray-600 capitalize">{getCategoryName(t.category)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-sm font-medium text-gray-600">Amount:</span>
                        <span className="text-sm font-bold text-gray-800">{formatAmount(t.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b-2 border-blue-200">
                      {['Sr No', 'Date', 'Type', 'Description', 'Category', 'Amount', 'Actions'].map(header => (
                        <th key={header} className="text-left py-2 px-2 font-semibold text-gray-700 text-sm border-r border-blue-200 last:border-r-0">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, index) => (
                      <tr key={t._id || t.id || index} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-2 px-2 text-sm text-gray-700 border-r border-gray-200 font-medium text-left">{index + 1}</td>
                        <td className="py-2 px-2 text-sm text-gray-800 border-r border-gray-200">{formatDate(t.date)}</td>
                        <td className="py-2 px-2 text-sm border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${(t.type === 'income' || t.type === 'Income') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {String(t.type || 'Unknown').charAt(0).toUpperCase() + String(t.type || 'Unknown').slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-800 border-r border-gray-200 font-medium">{String(t.description || 'No description')}</td>
                        <td className="py-2 px-2 text-sm text-gray-600 capitalize border-r border-gray-200">{getCategoryName(t.category)}</td>
                        <td className="py-2 px-2 text-sm font-bold text-gray-800 border-r border-gray-200">{formatAmount(t.amount)}</td>
                        <td className="py-2 px-2 text-sm">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditClick(t)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-md transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(t)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {isEditing ? 'Update Transaction' : 'Add New Transaction'}
                </h2>
                <button
                  onClick={resetModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={submitting}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <DatePicker
                    name="date"
                    value={newTransaction.date}
                    onChange={handleModalInputChange}
                    className="w-full"
                    required
                  />
                </div>

                {/* Type */}
                <Dropdown
                  name="type"
                  value={newTransaction.type}
                  onChange={handleTypeChange}
                  options={modalTypeOptions}
                  required
                  placeholder="Select Type"
                  label="Type"
                />

                {/* Category */}
                <Dropdown
                  name="category"
                  value={newTransaction.category}
                  onChange={handleModalInputChange}
                  options={modalCategories}
                  required
                  label="Category"
                  placeholder="Select Category"
                  disabled={!newTransaction.type}
                />

                {/* Description */}
                <InputField
                  label="Description"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleModalInputChange}
                  placeholder="Enter transaction description"
                  required
                />

                {/* Amount */}
                <InputField
                  label="Amount (₹)"
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleModalInputChange}
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors order-2 sm:order-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTransaction}
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 rounded-md transition-colors cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting && (
                      <ClipLoader
                        color="#ffffff"
                        loading={submitting}
                        size={16}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        className="mr-2"
                      />
                    )}
                    {submitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Transaction' : 'Add Transaction')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-4 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Delete Transaction
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors order-1 sm:order-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;