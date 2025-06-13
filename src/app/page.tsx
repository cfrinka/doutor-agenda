"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/authentication");
  }, [router]);

  return null; // Optional: or show a loading spinner if you like
};

export default Home;
