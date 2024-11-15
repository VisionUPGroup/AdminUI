// @ts-nocheck
import dynamic from "next/dynamic";
import { Fragment, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Input,
} from "reactstrap";

// Dynamically import the DataTable component
const DataTable = dynamic(() => import("react-data-table-component"), {
  ssr: false,
});

// Main Datatable component
const Datatable = ({
  myData,
  myClass,
  multiSelectOption,
  pagination,
  onDelete,
  onEdit,
}: any) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(myData);
  const [checkedValues, setCheckedValues] = useState<number[]>([]);

  // Handle deletion of a single item
  const handleDelete = (id: number, index: number) => {
    if (window.confirm("Are you sure you wish to delete this item?")) {
      onDelete(id); // Call the onDelete prop function
      const updatedData = [...data];
      updatedData.splice(index, 1);
      setData(updatedData);
      toast.success("Successfully Deleted!");
    }
  };

  // Handle edit action for an item
  const handleEdit = (id: number) => {
    onEdit(id); // Call the onEdit prop function
  };

  // Open and close modal handlers
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  // Capitalize column headers
  const Capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Define table columns dynamically based on the data
  const columns = [];
  for (const key in myData[0]) {
    columns.push({
      name: <b>{Capitalize(key.toString())}</b>,
      selector: (row) => row[key],
      style: { textAlign: "center" },
      wrap: true, // Enable wrapping of text in the cell
    });
  }

  // Multi-select option for bulk delete
  if (multiSelectOption) {
    columns.push({
      name: (
        <Button
          color="danger"
          size="sm"
          className="btn-delete mb-0 b-r-4"
          onClick={() => {
            if (window.confirm("Are you sure you wish to delete selected items?")) {
              const selectedIds = data.filter(item => checkedValues.includes(item.id)).map(item => item.id);
              selectedIds.forEach(id => onDelete(id)); // Call the API for each selected item
              setData(data.filter(item => !checkedValues.includes(item.id)));
              toast.success("Successfully Deleted!");
            }
          }}
        >
          Delete
        </Button>
      ),
      cell: (row) => (
        <div>
          <Input
            type="checkbox"
            defaultChecked={checkedValues.includes(row.id)}
            onChange={(e) => selectRow(e, row.id)}
          />
        </div>
      ),
      style: { textAlign: "center" },
      sortable: false,
      wrap: true, // Enable wrapping of text in the cell
    });
  } else {
    // Action column for delete and edit buttons
    columns.push({
      name: <b>Action</b>,
      cell: (row, index) => (
        <div>
          <span onClick={() => handleDelete(row.id, index)}>
            <i
              className="fa fa-trash"
              style={{
                width: 35,
                fontSize: 20,
                padding: 11,
                color: "#e4566e",
                cursor: "pointer",
              }}
            ></i>
          </span>
          {/* <span onClick={() => handleEdit(row.id)}>
            <i
              className="fa fa-pencil"
              style={{
                width: 35,
                fontSize: 20,
                padding: 11,
                color: "rgb(40, 167, 69)",
                cursor: "pointer",
              }}
            ></i>
          </span> */}
        </div>
      ),
      style: { textAlign: "center" },
      sortable: false,
      wrap: true, // Enable wrapping of text in the cell
    });
  }

  // Checkbox select row function for multiSelectOption
  const selectRow = (e, id) => {
    if (e.target.checked) {
      setCheckedValues([...checkedValues, id]);
    } else {
      setCheckedValues(checkedValues.filter(value => value !== id));
    }
  };

  return (
    <div>
      <Fragment>
        <DataTable
          data={data}
          columns={columns}
          className={myClass}
          pagination={pagination}
          striped
          center
        />
        <ToastContainer />
      </Fragment>
    </div>
  );
};

export default Datatable;
