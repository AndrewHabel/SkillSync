import { useParams } from "next/navigation";

export const useStoryId = () => {
    const params = useParams();
    return params.userStoryId as string;
}
