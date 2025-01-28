import {useState} from 'react';
import {Button , type ButtonProps} from "@/components/ui/button";
import { ResponsiveModal } from '@/components/responsive-modal';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { set } from 'date-fns';

export const useConfirm = (title:string , message:string , variant:ButtonProps["variant"] = "primary"): [()=> JSX.Element , ()=> Promise<unknown> ] => {
    const [promise, setpromise] = useState<{resolve:(value:boolean) => void} | null>(null);

    const confirm = () => {
       return new Promise((resolve) => {
            setpromise({resolve});
        });
    };

    const handelClose = () =>{
        setpromise(null);
    };

    const handelConfirm = () => {
        promise?.resolve(true);
        handelClose();
    };

    const handelCancel = () => {
        promise?.resolve(false);
        handelClose();
    };

    const ConfirmationDialog = () => (
        <ResponsiveModal open={promise !== null} onopenchange={handelClose}>
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="pt-8">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button onClick={handelCancel} variant="outline" className="w-full lg:w-auto">Cancel</Button>
                        <Button onClick={handelConfirm} variant={variant} className="w-full lg:w-auto">Confirm</Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    );

    return [ConfirmationDialog , confirm ];
};
