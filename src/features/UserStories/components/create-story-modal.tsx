"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateStoryModal } from "../hooks/use-create-story-modal";
import { CreateStoryFormWrapper } from "./create-story-form-wrapper";


export const CreateStoryModal = () => {
    const { isOpen, setIsOpen, close } = useCreateStoryModal();

    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <div>
                <CreateStoryFormWrapper onCancel={close} />
            </div>
        </ResponsiveModal>
    )
}

