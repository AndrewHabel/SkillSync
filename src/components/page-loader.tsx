import {Loader} from "lucide-react";

export const PageLoader = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
    );
}