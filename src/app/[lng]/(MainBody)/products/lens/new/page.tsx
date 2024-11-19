"use client";
import { useParams } from 'next/navigation';
import AddLens from "@/Components/Products/Lens/AddLens";

const AddLensContainer = () => {
  const params = useParams();

  return <AddLens />;
};

export default AddLensContainer;