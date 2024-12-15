// EyeGlassTypeManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, ButtonGroup } from "reactstrap";
import { Plus, Edit2, Trash2, X, Power, Search } from "react-feather";
import Swal from "sweetalert2";
import styles from "./EyeGlassTypeManagement.module.scss";
import { useEyeGlassService } from "../../../../Api/eyeGlassService";
import { toast } from "react-toastify";

interface EyeGlassType {
    id: number;
    glassType: string;
    status: boolean;
  }

interface EyeGlassTypeManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const EyeGlassTypeManagement: React.FC<EyeGlassTypeManagementProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    fetchEyeGlassTypes,
    createEyeGlassType,
    updateEyeGlassType,
    deleteEyeGlassType,
  } = useEyeGlassService();

  const [eyeGlassTypes, setEyeGlassTypes] = useState<EyeGlassType[]>([]);
  const [selectedType, setSelectedType] = useState<EyeGlassType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");

  const [formData, setFormData] = useState<Omit<EyeGlassType, 'id'>>({
    glassType: "",
    status: true // Thêm giá trị mặc định cho status
});
  useEffect(() => {
    if (isOpen) {
      loadEyeGlassTypes();
    }
  }, [isOpen]);

  const loadEyeGlassTypes = async () => {
    try {
      setLoading(true);
      const data = await fetchEyeGlassTypes();
      if (Array.isArray(data)) {
        setEyeGlassTypes(data);
      }
    } catch (error) {
      console.error("Error loading eyeglass types:", error);
      toast.error("Failed to load eyeglass types");
    } finally {
      setLoading(false);
    }
  };

  const filteredEyeGlassTypes = useMemo(() => {
    return eyeGlassTypes.filter((type) => {
      if (!type) return false;

      const matchesSearch = type.glassType
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && type.status === (statusFilter === "active");
    });
  }, [eyeGlassTypes, searchTerm, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      active: eyeGlassTypes.filter((type) => type.status).length,
      inactive: eyeGlassTypes.filter((type) => !type.status).length,
      all: eyeGlassTypes.length,
    }),
    [eyeGlassTypes]
  );

  const handleToggleStatus = async (eyeGlassType: EyeGlassType) => {
    const action = eyeGlassType.status ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } Eyeglass Type?`,
      html: `
                <div class="text-left">
                    <p><strong>Name:</strong> ${eyeGlassType.glassType}</p>
                    <p><strong>Current Status:</strong> ${
                      eyeGlassType.status ? "Active" : "Inactive"
                    }</p>
                </div>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: eyeGlassType.status ? "#dc2626" : "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: eyeGlassType.status
        ? "Yes, deactivate"
        : "Yes, activate",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await updateEyeGlassType({
          ...eyeGlassType,
          status: !eyeGlassType.status,
        });
        await loadEyeGlassTypes();

        await Swal.fire({
          title: "Success!",
          text: `Eyeglass type has been ${action}d.`,
          icon: "success",
          timer: 1500,
        });
      } catch (error) {
        console.error("Error updating eyeglass type status:", error);
        await Swal.fire({
          title: "Error!",
          text: `Failed to ${action} eyeglass type.`,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (eyeGlassType: EyeGlassType) => {
    setSelectedType(eyeGlassType);
    // Đảm bảo truyền đủ cả hai trường glassType và status
    setFormData({
      glassType: eyeGlassType.glassType,
      status: eyeGlassType.status // Thêm trường status vào
    });
    setIsEditing(true);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedType?.id) {
        // Update case - đảm bảo format theo yêu cầu
        const updateData = {
          id: selectedType.id,
          glassType: formData.glassType,
          status: selectedType.status
        };
        await updateEyeGlassType(updateData);
      } else {
        // Create case
        await createEyeGlassType({
          glassType: formData.glassType,
        });
      }

      await loadEyeGlassTypes();
      resetForm();
      toast.success(
        `Eyeglass type ${selectedType?.id ? "updated" : "created"} successfully`
      );
    } catch (error) {
      console.error("Error saving eyeglass type:", error);
      toast.error(
        `Failed to ${selectedType?.id ? "update" : "create"} eyeglass type`
      );
    } finally {
      setLoading(false);
    }
};

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await deleteEyeGlassType(id);
        await loadEyeGlassTypes();

        await Swal.fire({
          title: "Deleted!",
          text: "Eyeglass type has been deleted successfully.",
          icon: "success",
          timer: 1500,
        });
      } catch (error) {
        console.error("Error deleting eyeglass type:", error);
        await Swal.fire({
          title: "Error!",
          text: "Failed to delete eyeglass type.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      glassType: "",
      status: true  // Thêm giá trị mặc định cho status khi reset
    });
    setIsEditing(false);
};

  if (loading && !eyeGlassTypes.length) {
    return (
      <Modal
        isOpen={isOpen}
        toggle={onClose}
        className={styles.modal}
        size="lg"
      >
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} className={styles.modal} size="lg">
      <div className={styles.modalHeader}>
        <h4>
          {isEditing ? "Edit Eyeglass Type" : "Eyeglass Types Management"}
        </h4>
        <Button color="none" className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div
        className={`${styles.modalContent} ${
          loading ? styles.loadingOverlay : ""
        }`}
      >
        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Glass Type</label>
              <input
                type="text"
                value={formData.glassType}
                onChange={(e) =>
                  setFormData({ ...formData, glassType: e.target.value })
                }
                required
                className={styles.input}
                placeholder="Enter glass type"
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" color="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
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
                    placeholder="Search eyeglass types..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ButtonGroup className={styles.statusFilter}>
                  <Button
                    color={statusFilter === "active" ? "primary" : "light"}
                    onClick={() => setStatusFilter("active")}
                    className={styles.filterButton}
                  >
                    Active ({statusCounts.active})
                  </Button>
                  <Button
                    color={statusFilter === "inactive" ? "primary" : "light"}
                    onClick={() => setStatusFilter("inactive")}
                    className={styles.filterButton}
                  >
                    Inactive ({statusCounts.inactive})
                  </Button>
                  <Button
                    color={statusFilter === "all" ? "primary" : "light"}
                    onClick={() => setStatusFilter("all")}
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
              {filteredEyeGlassTypes.length > 0 ? (
                filteredEyeGlassTypes.map((type) => (
                  <div className={styles.typeContent}>
                    <div className={styles.typeHeader}>
                      <h5>{type.glassType}</h5>
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
                          className={`${styles.toggleButton} ${
                            !type.status ? styles.inactive : ""
                          }`}
                          onClick={() => handleToggleStatus(type)}
                          disabled={loading}
                        >
                          <Power size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className={styles.badges}>
                      <span
                        className={`${styles.badge} ${
                          type.status ? styles.active : styles.inactive
                        }`}
                      >
                        {type.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>No eyeglass types found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EyeGlassTypeManagement;
