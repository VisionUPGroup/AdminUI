"use client";
import { useParams } from 'next/navigation';
import LensDetail from "@/Components/Products/Lens/LensDetail";

const LensDetailContainer = () => {
  const params = useParams();
  const id = params?.id as string;

  return <LensDetail id={id} />;
};

export default LensDetailContainer;