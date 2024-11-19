"use client";
import { useParams } from 'next/navigation';
import EyeGlassDetail from "@/Components/Products/Digital/EyeGlassDetail";

const EyeGlassDetailContainer = () => {
  const params = useParams();
  const id = params?.id as string;

  return <EyeGlassDetail id={id} />;
};

export default EyeGlassDetailContainer;