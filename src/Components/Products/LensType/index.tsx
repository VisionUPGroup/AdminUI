// LensTypeManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, ButtonGroup  } from 'reactstrap';
import { Plus, Edit2, Trash2, X, Power, Search } from 'react-feather';
import Swal from 'sweetalert2';
import styles from './LensTypeManagement.module.scss';
import { useLensService } from '../../../../Api/lensService';
import { toast } from 'react-toastify';



interface LensType {
    id: number;
    name: string;
    description: string;
    isNoPrescription: boolean;
    status: boolean;
}

interface LensTypeManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

const LensTypeManagement: React.FC<LensTypeManagementProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        fetchLensTypes,
        createLensType,
        updateLensType,
        deleteLensType
    } = useLensService();

    const [lensTypes, setLensTypes] = useState<LensType[]>([]);
    const [selectedType, setSelectedType] = useState<LensType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

    const [formData, setFormData] = useState({
        name: 'Name',
        description: '',
        isNoPrescription: false,
        status: true
    });

    useEffect(() => {
        if (isOpen) {
            loadLensTypes();
        }
    }, [isOpen]);

    const loadLensTypes = async () => {
        try {
            setLoading(true);
            const data = await fetchLensTypes();
            if (Array.isArray(data)) {
                setLensTypes(data);
            }
        } catch (error) {
            console.error('Error loading lens types:', error);
            toast.error('Failed to load lens types');
        } finally {
            setLoading(false);
        }
    };

    const filteredLensTypes = useMemo(() => {
        return lensTypes
            .filter(type => {
                const matchesSearch = type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   type.description.toLowerCase().includes(searchTerm.toLowerCase());
                
                if (statusFilter === 'all') return matchesSearch;
                return matchesSearch && type.status === (statusFilter === 'active');
            });
    }, [lensTypes, searchTerm, statusFilter]);

    // Status counts for badges
    const statusCounts = useMemo(() => ({
        active: lensTypes.filter(type => type.status).length,
        inactive: lensTypes.filter(type => !type.status).length,
        all: lensTypes.length
    }), [lensTypes]);

    useEffect(() => {
        if (isOpen) {
            loadLensTypes();
        }
    }, [isOpen]);

    const handleToggleStatus = async (lensType: LensType) => {
        const action = lensType.status ? 'deactivate' : 'activate';
        
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Lens Type?`,
            html: `
                <div class="text-left">
                    <p><strong>Name:</strong> ${lensType.name}</p>
                    <p><strong>Current Status:</strong> ${lensType.status ? 'Active' : 'Inactive'}</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: lensType.status ? '#dc2626' : '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: lensType.status ? 'Yes, deactivate' : 'Yes, activate',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await updateLensType({
                    ...lensType,
                    status: !lensType.status
                });
                await loadLensTypes();
                
                await Swal.fire({
                    title: 'Success!',
                    text: `Lens type has been ${action}d.`,
                    icon: 'success',
                    timer: 1500
                });
            } catch (error) {
                console.error('Error updating lens type status:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: `Failed to ${action} lens type.`,
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (lensType: LensType) => {
        setSelectedType(lensType);
        setFormData({
            name:"",
            description: lensType.description,
            isNoPrescription: lensType.isNoPrescription,
            status: lensType.status
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const lensTypeData = {
                id: selectedType?.id,
                ...formData
            };

            if (selectedType?.id) {
                await updateLensType(lensTypeData);
            } else {
                await createLensType(formData);
            }

            await loadLensTypes();
            resetForm();
            
            await Swal.fire({
                title: 'Success!',
                text: `Lens type ${selectedType?.id ? 'updated' : 'created'} successfully`,
                icon: 'success',
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving lens type:', error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to save lens type.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await deleteLensType(id);
                await loadLensTypes();
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Lens type has been deleted successfully.',
                    icon: 'success',
                    timer: 1500
                });
            } catch (error) {
                console.error('Error deleting lens type:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete lens type.',
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setSelectedType(null);
        setFormData({
            name: '',
            description: '',
            isNoPrescription: false,
            status: true
        });
        setIsEditing(false);
    };

    if (loading && !lensTypes.length) {
        return (
            <Modal isOpen={isOpen} toggle={onClose} className={styles.modal} size="lg">
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner} />
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} toggle={onClose} className={styles.modal} size="lg">
            <div className={styles.modalHeader}>
                <h4>{isEditing ? 'Edit Lens Type' : 'Lens Types Management'}</h4>
                <Button color="none" className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </Button>
            </div>

            <div className={`${styles.modalContent} ${loading ? styles.loadingOverlay : ''}`}>
                {isEditing ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className={styles.input}
                                placeholder="Enter lens type name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className={styles.textarea}
                                placeholder="Enter lens type description"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.isNoPrescription}
                                    onChange={(e) => setFormData({ ...formData, isNoPrescription: e.target.checked })}
                                    className={styles.checkbox}
                                />
                                <span>No Prescription Required</span>
                            </label>
                        </div>

                        <div className={styles.formActions}>
                            <Button type="button" color="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className={styles.tableHeader}>
                            <div className={styles.filters}>
                                <div className={styles.searchBox}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input 
                                        type="text" 
                                        placeholder="Search lens types..." 
                                        className={styles.searchInput}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ButtonGroup className={styles.statusFilter}>
                                    <Button
                                        color={statusFilter === 'active' ? 'primary' : 'light'}
                                        onClick={() => setStatusFilter('active')}
                                        className={styles.filterButton}
                                    >
                                        Active ({statusCounts.active})
                                    </Button>
                                    <Button
                                        color={statusFilter === 'inactive' ? 'primary' : 'light'}
                                        onClick={() => setStatusFilter('inactive')}
                                        className={styles.filterButton}
                                    >
                                        Inactive ({statusCounts.inactive})
                                    </Button>
                                    <Button
                                        color={statusFilter === 'all' ? 'primary' : 'light'}
                                        onClick={() => setStatusFilter('all')}
                                        className={styles.filterButton}
                                    >
                                        All ({statusCounts.all})
                                    </Button>
                                </ButtonGroup>
                            </div>
                            <Button color="primary" onClick={() => setIsEditing(true)}>
                                <Plus size={16} /> Add New Type
                            </Button>
                        </div>

                        <div className={styles.tableContainer}>
                            {filteredLensTypes.length > 0 ? (
                                filteredLensTypes.map((type) => (
                                    <div className={styles.typeContent}>
                                        <div className={styles.typeHeader}>
                                            <h5>{type.name}</h5>
                                            <div className={styles.actions}>
                                                <Button 
                                                    color="none" 
                                                    className={styles.editButton} 
                                                    onClick={() => handleEdit(type)}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    color="none"
                                                    className={`${styles.toggleButton} ${!type.status ? styles.inactive : ''}`}
                                                    onClick={() => handleToggleStatus(type)}
                                                    disabled={loading}
                                                >
                                                    <Power size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className={styles.description}>{type.description}</p>
                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${type.status ? styles.active : styles.inactive}`}>
                                                {type.status ? 'Active' : 'Inactive'}
                                            </span>
                                            {type.isNoPrescription && (
                                                <span className={styles.noPrescription}>No Prescription</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <p>No lens types found</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default LensTypeManagement;