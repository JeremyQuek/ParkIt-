import { useEffect } from "react";

function Test() {
  useEffect(() => {
    window.location.href = "http://localhost:5173/login";
  }, []);

  return null; // or return some loading state if needed
}

export default Test;
