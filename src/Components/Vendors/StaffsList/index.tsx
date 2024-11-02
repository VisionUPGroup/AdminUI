import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useAccountService } from "../../../../Api/accountService"; // Adjust the path as needed

// Define the interface for the role structure
interface Role {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

// Define the interface for the user data structure
interface StaffData {
  id: number;
  username: string;
  password: string; // Consider removing this if you don't need it on the frontend
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role: Role;
}

const UsersList: React.FC = () => {
  const { fetchAccountByRole } = useAccountService();
  const [staffData, setStaffData] = useState<StaffData[]>([]);


  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchAccountByRole(2);
        setStaffData(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to load vendor data:", error);
      }
    };
    getUserData();
  }, [fetchAccountByRole]);
 
  return (
    <Fragment>
      <CommonBreadcrumb title="Account" parent="Vendors" />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>Staff</h5>
          
          </CardHeader>
          <CardBody>
            <div className="clearfix"></div>
            <div
              id="batchDelete"
              className="category-table user-list order-table coupon-list-delete list-vendor-table"
            >
              {staffData.length > 0 ? (
                <Datatable
                  multiSelectOption={false}
                  myData={staffData.map((staff) => ({
                    id: staff.id,
                    username: staff.username,
                    email: staff.email,
                    status: staff.status ? "Active" : "Inactive", // Optional formatting
                    roleName: staff.role.name, // Flattening role name for easier access
                    roleDescription: staff.role.description,
                  }))}
                  pageSize={10}
                  pagination={true}
                  class="-striped -highlight"
                />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </Container>
    </Fragment>
  );
};

export default UsersList;
