// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, X, Loader2 } from 'lucide-react';
import { adminService } from '../../services/auth.service'; // <-- Use the updated service file
import { Instructor } from '../../data/mockAdminData';

const AdminDashboard = () => {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInstructors = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getInstructors();
            setInstructors(data);
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    const handleDelete = async (id: string) => {
        setInstructors(prev => prev.filter(inst => inst.id !== id));
        try {
            await adminService.deleteInstructor(id);
        } catch (error) {
            console.error("Failed to delete instructor:", error);
            fetchInstructors();
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text">Instructor Management</h1>
                    <p className="text-textSecondary">Add or remove instructors from the platform.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20">
                    <UserPlus size={18} /> Add Instructor
                </button>
            </div>

            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-background text-xs uppercase text-textSecondary font-semibold">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Joined Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-8 text-textSecondary"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : instructors.map((inst) => (
                            <tr key={inst.id} className="border-t border-border text-text">
                                <td className="p-4 font-medium">{inst.name}</td>
                                <td className="p-4 text-textSecondary">{inst.email}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{inst.role}</span>
                                </td>
                                <td className="p-4 text-textSecondary">{inst.joinedDate}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(inst.id)} className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && <AddInstructorModal onClose={() => setIsModalOpen(false)} onSuccess={fetchInstructors} />}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Add Instructor Modal Sub-component ---
const AddInstructorModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsAdding(true);
        setError('');
        const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
        try {
            await adminService.addInstructor(name, email); // Call API Service
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAdding(false);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface w-full max-w-md rounded-2xl p-6 border border-border shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-textSecondary hover:text-text"><X /></button>
                <h2 className="text-xl font-bold text-text mb-4">Register New Instructor</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" type="text" placeholder="Full Name" required className="w-full p-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
                    <input name="email" type="email" placeholder="Email Address" required className="w-full p-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
                    {error && <p className="text-sm text-center p-3 bg-error/10 text-error rounded-lg">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-textSecondary hover:bg-background rounded-lg">Cancel</button>
                        <button type="submit" disabled={isAdding} className="px-6 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                            {isAdding ? <Loader2 className="animate-spin" /> : <UserPlus size={16} />}
                            {isAdding ? 'Adding...' : 'Add Instructor'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;