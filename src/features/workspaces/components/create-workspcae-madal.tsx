"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { CreateWorkspaceForm } from "./create-workspaces-form";
import { use } from "react";
import { useCreateWorkspaceModal } from "../hooks/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {

    const {isOpen , setIsOpen ,close} = useCreateWorkspaceModal();

    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <CreateWorkspaceForm onCancel={close} />
        </ResponsiveModal>
    )
}