import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Use dynamic import to resolve module resolution issues
const MyTasksClient = dynamic(() => import("./client").then(mod => mod.MyTasksClient), {
  loading: () => <div>Loading...</div>
});

const MyTasksPage = async () => {
  const user = await getCurrent();
  if(!user) redirect("http://localhost:3000/landingpage");
  
  return (
    <div className="h-full flex flex-col">
      <MyTasksClient />
    </div>
  );
};

export default MyTasksPage;