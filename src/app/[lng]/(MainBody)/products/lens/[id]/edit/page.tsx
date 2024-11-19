// app/products/eyeglass/[id]/edit/page.tsx

"use client";
import { useParams } from 'next/navigation';
import EditLens from "@/Components/Products/Lens/EditLens";

const EditLensContainer = () => {
  const params = useParams();
  const id = params?.id as string;

  return <EditLens id={id} />;
};

export default EditLensContainer;