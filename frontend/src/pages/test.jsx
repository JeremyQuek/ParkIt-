import { useEffect } from "react";

function Test() {
  useEffect(() => {
    window.location.replace("http://localhost:5173/login");
  }, []);

  return <div>Redirecting...</div>;
}

export default Test;
