// EyeReflectiveManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, ButtonGroup } from 'reactstrap';
import { Plus, Edit2, Trash2, X, Power, Search } from 'react-feather';
import Swal from 'sweetalert2';
import styles from './EyeReflactiveManagement.module.scss';
import { useLensService } from '../../../../Api/lensService';
import { toast } from 'react-toastify';

interface EyeReflective {
    id: number;
    reflactiveName: string;
    status: boolean;
}

interface EyeReflectiveManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

const EyeReflectiveManagement: React.FC<EyeReflectiveManagementProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        fetchEyeReflactives,
        createEyeRefractive,
        updateEyeRefractive,
        deleteEyeRefractive
    } = useLensService();

    const [eyeReflectives, setEyeReflectives] = useState<EyeReflective[]>([]);
    const [selectedType, setSelectedType] = useState<EyeReflective | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

    const [formData, setFormData] = useState({
        reflactiveName: '',
        status: true
    });

    useEffect(() => {
        if (isOpen) {
            loadEyeReflectives();
        }
    }, [isOpen]);

    const loadEyeReflectives = async () => {
        try {
            setLoading(true);
            const data = await fetchEyeReflactives();
            if (Array.isArray(data)) {
                setEyeReflectives(data);
            }
        } catch (error) {
            console.error('Error loading eye reflectives:', error);
            toast.error('Failed to load eye reflectives');
        } finally {
            setLoading(false);
        }
    };

    const filteredEyeReflectives = useMemo(() => {
        return eyeReflectives
            .filter(type => {
                const matchesSearch = type.reflactiveName.toLowerCase().includes(searchTerm.toLowerCase());
                
                if (statusFilter === 'all') return matchesSearch;
                return matchesSearch && type.status === (statusFilter === 'active');
            });
    }, [eyeReflectives, searchTerm, statusFilter]);

    // Status counts for badges
    const statusCounts = useMemo(() => ({
        active: eyeReflectives.filter(type => type.status).length,
        inactive: eyeReflectives.filter(type => !type.status).length,
        all: eyeReflectives.length
    }), [eyeReflectives]);

    const handleToggleStatus = async (eyeReflective: EyeReflective) => {
        const action = eyeReflective.status ? 'deactivate' : 'activate';
        
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Eye Reflective?`,
            html: `
                <div class="text-left">
                    <p><strong>Name:</strong> ${eyeReflective.reflactiveName}</p>
                    <p><strong>Current Status:</strong> ${eyeReflective.status ? 'Active' : 'Inactive'}</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: eyeReflective.status ? '#dc2626' : '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: eyeReflective.status ? 'Yes, deactivate' : 'Yes, activate',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await updateEyeRefractive({
                    ...eyeReflective,
                    status: !eyeReflective.status
                });
                await loadEyeReflectives();
                
                await Swal.fire({
                    title: 'Success!',
                    text: `Eye reflective has been ${action}d.`,
                    icon: 'success',
                    timer: 1500
                });
            } catch (error) {
                console.error('Error updating eye reflective status:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: `Failed to ${action} eye reflective.`,
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (eyeReflective: EyeReflective) => {
        setSelectedType(eyeReflective);
        setFormData({
            reflactiveName: eyeReflective.reflactiveName,
            status: eyeReflective.status
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const eyeReflectiveData = {
                id: selectedType?.id,
                ...formData
            };

            if (selectedType?.id) {
                await updateEyeRefractive(eyeReflectiveData);
            } else {
                await createEyeRefractive(formData);
            }

            await loadEyeReflectives();
            resetForm();
            
            await Swal.fire({
                title: 'Success!',
                text: `Eye reflective ${selectedType?.id ? 'updated' : 'created'} successfully`,
                icon: 'success',
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving eye reflective:', error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to save eye reflective.',
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
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await deleteEyeRefractive(id);
                await loadEyeReflectives();
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Eye reflective has been deleted successfully.',
                    icon: 'success',
                    timer: 1500
                });
            } catch (error) {
                console.error('Error deleting eye reflective:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete eye reflective.',
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
            reflactiveName: '',
            status: true
        });
        setIsEditing(false);
    };

    if (loading && !eyeReflectives.length) {
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
                <h4>{isEditing ? 'Edit Eye Reflective' : 'Eye Reflective Management'}</h4>
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
                                value={formData.reflactiveName}
                                onChange={(e) => setFormData({ ...formData, reflactiveName: e.target.value })}
                                required
                                className={styles.input}
                                placeholder="Enter eye reflective name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                    className={styles.checkbox}
                                />
                                <span>Active</span>
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
                                        placeholder="Search eye reflectives..." 
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
                                <Plus size={16} /> Add New Eye Reflective
                            </Button>
                        </div>

                        <div className={styles.tableContainer}>
                            {filteredEyeReflectives.length > 0 ? (
                                filteredEyeReflectives.map((type) => (
                                    <div key={type.id} className={styles.typeContent}>
                                        <div className={styles.typeHeader}>
                                            <h5>{type.reflactiveName}</h5>
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
                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${type.status ? styles.active : styles.inactive}`}>
                                                {type.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <p>No eye reflectives found</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default EyeReflectiveManagement;