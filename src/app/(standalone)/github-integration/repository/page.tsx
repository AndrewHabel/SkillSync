import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { RepositoryViewer } from "@/components/github/repository-viewer";

const RepositoryPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full w-full">
      <RepositoryViewer />
    </div>
  );
};

export default RepositoryPage;