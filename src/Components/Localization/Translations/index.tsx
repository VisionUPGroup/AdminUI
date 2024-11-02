import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Button } from "reactstrap";
import { useKioskService } from "../../../../Api/kioskService";
import KioskModal from "./KioskModal"; // Modal for creating a kiosk
import KioskUpdateModal from "./UpdateModal"; // Modal for updating a kiosk
import Swal from 'sweetalert2';

interface KioskDataType {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  accountID: number;
  openingHours: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

const Kiosk: React.FC = () => {
  const { fetchAllKiosk, createKiosk, updateKiosk, deleteKiosk } = useKioskService();
  const [kioskData, setKioskData] = useState<KioskDataType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<KioskDataType | null>(null);

  useEffect(() => {
    const getKioskData = async () => {
      try {
        const data = await fetchAllKiosk();
        const formattedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          phoneNumber: item.phoneNumber,
          email: item.email,
          accountID: item.accountID,
          openingHours: item.openingHours,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          status: item.status,
        }));
        setKioskData(formattedData);
      } catch (error) {
        console.error("Error fetching kiosk data:", error);
      }
    };

    getKioskData();
  }, [fetchAllKiosk]);

  const toggleCreateModal = () => {
    setCreateModalOpen(!createModalOpen);
  };

  const toggleUpdateModal = () => {
    setUpdateModalOpen(!updateModalOpen);
  };

  const handleSaveKiosk = async (data: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    status: boolean;
  }) => {
    try {
      // Add missing fields and timestamps
      const kioskPayload = {
        id: selectedKiosk ? selectedKiosk.id : 0, // Use existing ID or 0 for new kiosk
        name: data.name,
        address: data.address,
        phoneNumber: data.phoneNumber,
        email: data.email,
        openingHours: data.openingHours,
        createdAt: selectedKiosk ? selectedKiosk.createdAt : new Date().toISOString(), // Use existing timestamp or set current time
        updatedAt: new Date().toISOString(), // Always set current time on update
        status: data.status,
      };

      if (selectedKiosk) {
        // Update existing kiosk
        const updatedKiosk = await updateKiosk(kioskPayload);
        setKioskData(kioskData.map(kiosk => (kiosk.id === updatedKiosk.id ? updatedKiosk : kiosk)));
        Swal.fire({
          icon: 'success',
          title: 'Kiosk updated successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        toggleUpdateModal(); // Close the update modal
      } else {
        // Create new kiosk
        const newKiosk = await createKiosk(kioskPayload);
        setKioskData([...kioskData, newKiosk]);
        Swal.fire({
          icon: 'success',
          title: 'Kiosk created successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        toggleCreateModal(); // Close the create modal
      }
    } catch (error) {
      console.error("Error saving kiosk:", error);
    }
  };

  const handleEditKiosk = (id: number) => {
    const kioskToEdit = kioskData.find(kiosk => kiosk.id === id);
    if (kioskToEdit) {
      setSelectedKiosk(kioskToEdit);
      toggleUpdateModal(); // Open update modal
    }
  };

  const handleDeleteKiosk = async (id: number) => {
    try {
      await deleteKiosk(id);
      setKioskData(kioskData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting kiosk:", error);
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Kiosk" parent="Localization" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>
                <h5>Kiosk</h5>
                <div className="btn-popup pull-right">
                  <Button color="primary" onClick={toggleCreateModal}>
                    Create Kiosk
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div id="basicScenario" className="product-list translation-list">
                  {kioskData.length > 0 ? (
                    <Datatable
                      multiSelectOption={false}
                      myData={kioskData}
                      pageSize={10}
                      pagination={true}
                      class="-striped -highlight"
                      onDelete={handleDeleteKiosk}
                      onEdit={handleEditKiosk}
                    />
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <KioskModal
        isOpen={createModalOpen}
        toggle={toggleCreateModal}
        onSave={handleSaveKiosk}
      />
      <KioskUpdateModal
        isOpen={updateModalOpen}
        toggle={toggleUpdateModal}
        onSave={handleSaveKiosk}
        kioskData={selectedKiosk}
      />
    </Fragment>
  );
};

export default Kiosk;
