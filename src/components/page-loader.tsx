import {Loader} from "lucide-react";

export const PageLoader = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-32 h-32">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full"
                >
                    <source src="/Animation - 1744176254695.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}