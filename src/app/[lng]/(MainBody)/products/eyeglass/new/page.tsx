"use client";
import { useParams } from 'next/navigation';
import AddEyeGlass from "@/Components/Products/EyeGlass/AddEyeGlass";

const AddEyeGlassContainer = () => {
  const params = useParams();

  return <AddEyeGlass />;
};

export default AddEyeGlassContainer;