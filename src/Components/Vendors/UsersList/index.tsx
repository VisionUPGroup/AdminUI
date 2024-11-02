// UsersList.tsx
import React, { Fragment, useEffect, useState } from "react";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Card, CardBody, CardHeader, Container, Button } from "reactstrap";
import { useAccountService } from "../../../../Api/accountService";
import { useAuthService } from "../../../../Api/authService"; // Import the authentication service
import UserModal from "./UserModal";
import Swal from "sweetalert2"; // Import SweetAlert2

// Define the interface for the role structure
interface Role {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

// Define the interface for the user data structure
interface UserData {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role: Role;
}

const UsersList: React.FC = () => {
  const { fetchAccountByRole } = useAccountService();
  const { register } = useAuthService(); // Get the register function
  const [userData, setUserData] = useState<UserData[]>([]);
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchAccountByRole(1);
        setUserData(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    getUserData();
  }, [fetchAccountByRole]);

  const handleCreateUser = () => {
    setModalOpen(true);
  };

  // Function to close modal
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  // Function to handle saving the new user
  const handleSaveUser = async (userData: { username: string; email: string; phoneNumber: string; password: string }) => {
    try {
      // Call the register function with the necessary user data
      const response = await register(userData.username, userData.password, userData.email, userData.phoneNumber);
      if (response) {
        console.log("User registered successfully:", response);
        
        // Display a success alert using SweetAlert
        await Swal.fire({
          icon: 'success',
          title: 'User Registered',
          text: 'The user has been registered successfully!',
          confirmButtonText: 'Okay'
        });
        
        // Optionally fetch updated user data after saving
        const updatedData = await fetchAccountByRole(1); // Re-fetch user data
        setUserData(updatedData); // Update user data state
      } else {
        console.error("Failed to register user.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
    toggleModal(); // Close the modal after saving
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Account" parent="Vendors" />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>User</h5>
            <div className="btn-popup pull-right">
              <Button color="primary" onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="clearfix"></div>
            <div id="batchDelete" className="category-table user-list order-table coupon-list-delete list-vendor-table">
              {userData.length > 0 ? (
                <Datatable
                  multiSelectOption={false}
                  myData={userData.map((user) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    status: user.status ? "Active" : "Inactive",
                    roleName: user.role.name,
                    roleDescription: user.role.description,
                  }))}
                  pageSize={30}
                  pagination={true}
                  className="-striped -highlight"
                />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </Container>
      
      {/* User Modal for creating new users */}
      <UserModal isOpen={modalOpen} toggle={toggleModal} onSave={handleSaveUser} />
    </Fragment>
  );
};

export default UsersList;
