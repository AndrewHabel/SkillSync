"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTeamModal } from "../hooks/use-create-team-modal";
import { CreateTeamFormWrapper } from "./create-team-form-wrapper";

export const CreateTeamModal = () => {
  const { isOpen, setIsOpen, close } = useCreateTeamModal();

  return (
    <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
      <div>
        <CreateTeamFormWrapper onCancel={close} />
      </div>
    </ResponsiveModal>
  );
};