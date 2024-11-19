// app/products/eyeglass/[id]/edit/page.tsx

"use client";
import { useParams } from 'next/navigation';
import EditEyeGlass from "@/Components/Products/EyeGlass/EditEyeGlass";

const EditEyeGlassContainer = () => {
  const params = useParams();
  const id = params?.id as string;

  return <EditEyeGlass id={id} />;
};

export default EditEyeGlassContainer;