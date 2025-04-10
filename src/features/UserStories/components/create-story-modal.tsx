"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateStoryModal } from "../hooks/use-create-story-modal";
import { CreateStoryForm } from "./create-story-form";

export const CreateStoryModal = () => {

    const { isOpen, setIsOpen, close } = useCreateStoryModal();


    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <CreateStoryForm onCancel={close} />
        </ResponsiveModal>
    )
}

