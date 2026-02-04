import React, { useState, useEffect, useRef } from 'react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Upload, FileText, File, Loader2, CreditCard } from 'lucide-react';

interface PrintJob {
    _id: string;
    fileName: string;
    fileSize: number;
    numPages: number;
    price: number;
    status: string;
}

export const PrintModal: React.FC = () => {
    const { closeModal, triggerError } = useUI();
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState<PrintJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const data = await api.get<PrintJob[]>('/print');
                setJobs(data);
            } catch (err: any) {
                triggerError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [isAuthenticated, triggerError]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const simulatedPages = Math.floor(Math.random() * 20) + 1;
        const simulatedPrice = simulatedPages * 100;

        try {
            const newJob = await api.post<PrintJob>('/print/submit', {
                fileName: file.name,
                fileSize: file.size,
                numPages: simulatedPages,
                price: simulatedPrice,
                printOptions: {
                    color: false,
                    duplex: false,
                    binding: 'none'
                }
            });
            setJobs(prev => [newJob, ...prev]);
        } catch (err: any) {
            triggerError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                <p className="font-bold text-lg">Connecting to printer...</p>
            </div>
        );
    }

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header"
                style={{ 
                    background: 'linear-gradient(135deg, var(--card-print) 0%, #e67e22 100%)'
                }}
            >
                <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Printer size={28} />
                    </div>
                    <div>
                        <h2 className="modal-title m-0 uppercase tracking-tight">SMART PRINT</h2>
                        <p className="modal-subtitle">Cloud printing made simple</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                <div className="print-body px-1">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf,.docx,.jpg"
                    />
                    
                    <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ 
                            background: '#f8f9fa', 
                            border: '2px dashed var(--color-gray-300)', 
                            borderRadius: '20px', 
                            padding: '32px', 
                            textAlign: 'center', 
                            marginBottom: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={handleUploadClick}
                    >
                        <AnimatePresence mode="wait">
                            {uploading ? (
                                <motion.div 
                                    key="uploading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
                                    <h4 className="font-black">Processing file...</h4>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                                    <h4 className="font-black text-lg mb-1">Tap to upload files</h4>
                                    <p className="font-bold text-gray-500 text-sm">PDF, DOCX, JPG (Max 50MB)</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <div className="print-file-list space-y-4 mb-8">
                        <AnimatePresence mode="popLayout">
                            {jobs.map(job => (
                                <motion.div 
                                    layout
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    style={{ 
                                        background: '#fff', 
                                        border: '2px solid var(--color-gray-200)', 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s ease'
                                    }}
                                    key={job._id}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                        <div style={{ background: 'var(--card-print)', opacity: 0.1, padding: '10px', borderRadius: '12px', border: '2px solid var(--color-gray-200)' }}>
                                            {job.fileName.endsWith('.pdf') ? <FileText className="text-orange-600" size={24} /> : <File className="text-orange-600" size={24} />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="font-black text-sm truncate uppercase tracking-tight">{job.fileName}</div>
                                            <div className="font-bold text-[10px] text-gray-500 uppercase">
                                                {formatSize(job.fileSize)} • {job.numPages} Pages • <span className="text-orange-600 font-black">{job.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-black text-lg">₦{job.price.toLocaleString()}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {jobs.length === 0 && !loading && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center font-bold text-gray-400 py-4"
                            >
                                No recent print jobs.
                            </motion.p>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeModal}
                        className="hub-btn w-full bg-orange-500 text-white border-3 border-black p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_6px_0_0_rgba(0,0,0,1)]"
                    >
                        {jobs.length > 0 ? (
                            <>
                                <CreditCard size={24} strokeWidth={3} />
                                <span>PROCEED TO PAYMENT</span>
                            </>
                        ) : (
                            <span>BACK TO HUB</span>
                        )}
                    </motion.button>
                </div>
            </div>
        </>
    );
};
