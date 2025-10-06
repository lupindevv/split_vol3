import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { billAPI } from '../../services/api';

const BillDetailsModal = ({ billId, onClose, onUpdate }) => {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForceCloseConfirm, setShowForceCloseConfirm] = useState(false);
    const [closingBill, setClosingBill] = useState(false);

    useEffect(() => {
        loadBillDetails();
    }, [billId]);

    const loadBillDetails = async () => {
        try {
            const response = await billAPI.getById(billId);
            setBill(response.data.data);
        } catch (error) {
            console.error('Load bill error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseBill = async () => {
        setClosingBill(true);
        try {
            await billAPI.close(billId);
            onUpdate();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to close bill');
        } finally {
            setClosingBill(false);
        }
    };

    const handleForceClose = async () => {
        setClosingBill(true);
        try {
            await billAPI.forceClose(billId);
            onUpdate();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to force close bill');
        } finally {
            setClosingBill(false);
            setShowForceCloseConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6">
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        );
    }

    if (!bill) return null;

    const unpaidItems = bill.items?.filter(item => !item.is_paid) || [];
    const unpaidAmount = unpaidItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const isFullyPaid = unpaidItems.length === 0;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Table #{bill.table_number}
                            </h2>
                            <p className="text-slate-400 text-sm">{bill.bill_number}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Bill Info */}
                        <div className="bg-slate-900 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Guests</p>
                                    <p className="text-white font-semibold">{bill.number_of_guests}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Waiter</p>
                                    <p className="text-white font-semibold">{bill.waiter_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Total Amount</p>
                                    <p className="text-white font-semibold">€{parseFloat(bill.total_amount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Paid Amount</p>
                                    <p className="text-green-500 font-semibold">€{parseFloat(bill.paid_amount).toFixed(2)}</p>
                                </div>
                            </div>
                            {!isFullyPaid && (
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <p className="text-red-400 text-sm font-semibold">Unpaid Amount</p>
                                        <p className="text-red-400 font-bold text-lg">€{unpaidAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                        <div className="space-y-2 mb-6">
                            {bill.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-slate-900 rounded-lg p-4 ${
                                        item.is_paid ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{item.item_name}</p>
                                            <p className="text-slate-400 text-sm">
                                                {item.quantity}x €{parseFloat(item.unit_price).toFixed(2)}
                                            </p>
                                            {item.is_paid && item.paid_by && (
                                                <p className="text-green-500 text-sm mt-1">
                                                    Paid by {item.paid_by}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">
                                                €{parseFloat(item.total_price).toFixed(2)}
                                            </p>
                                            {item.is_paid && (
                                                <span className="text-green-500 text-xs">✓ Paid</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payments */}
                        {bill.payments && bill.payments.length > 0 && (
                            <>
                                <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
                                <div className="space-y-2 mb-6">
                                    {bill.payments.map((payment) => (
                                        <div key={payment.id} className="bg-slate-900 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-semibold">
                                                        {payment.customer_name || 'Anonymous'}
                                                    </p>
                                                    <p className="text-slate-400 text-sm">
                                                        {payment.payment_method} • {payment.transaction_id}
                                                    </p>
                                                </div>
                                                <p className="text-green-500 font-semibold">
                                                    €{parseFloat(payment.amount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3 mb-6">
                            {isFullyPaid ? (
                                <button
                                    onClick={handleCloseBill}
                                    disabled={closingBill}
                                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 font-semibold"
                                >
                                    {closingBill ? 'Closing...' : 'Close Bill'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowForceCloseConfirm(true)}
                                    className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    Force Close Bill
                                </button>
                            )}
                            
                            {/* Delete Button - Always visible */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Delete Bill
                            </button>
                        </div>

                        {/* QR Code */}
                        {bill.qr_code && (
                            <div className="mt-6 text-center">
                                <h3 className="text-lg font-bold text-white mb-4">Payment QR Code</h3>
                                <img
                                    src={bill.qr_code}
                                    alt="Bill QR Code"
                                    className="mx-auto w-48 h-48 bg-white p-2 rounded-lg"
                                />
                                <p className="text-slate-400 text-sm mt-2">
                                    Customers can scan this to pay
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Force Close Confirmation Modal */}
            {showForceCloseConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border-2 border-orange-500">
                        <div className="text-center mb-6">
                            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Force Close Bill?</h3>
                            <p className="text-slate-300">
                                This bill has <span className="text-orange-500 font-bold">€{unpaidAmount.toFixed(2)}</span> unpaid!
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 mb-6">
                            <p className="text-sm text-slate-400 mb-2">Unpaid items:</p>
                            <ul className="space-y-1">
                                {unpaidItems.slice(0, 5).map((item) => (
                                    <li key={item.id} className="text-white text-sm flex justify-between">
                                        <span>{item.item_name} x{item.quantity}</span>
                                        <span>€{parseFloat(item.total_price).toFixed(2)}</span>
                                    </li>
                                ))}
                                {unpaidItems.length > 5 && (
                                    <li className="text-slate-400 text-sm">
                                        ...and {unpaidItems.length - 5} more items
                                    </li>
                                )}
                            </ul>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 text-center">
                            Are you sure you want to close this bill? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowForceCloseConfirm(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForceClose}
                                disabled={closingBill}
                                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition disabled:opacity-50 font-semibold"
                            >
                                {closingBill ? 'Closing...' : 'Yes, Force Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillDetailsModal;