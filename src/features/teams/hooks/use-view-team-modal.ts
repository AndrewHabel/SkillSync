import { useQueryState, parseAsString } from "nuqs";

export const useViewTeamModal = () => {
  const [teamId, setTeamId] = useQueryState("view_team", parseAsString);
  
  const open = (id: string) => setTeamId(id);
  const close = () => setTeamId(null);

  return {
    teamId,
    open,
    close,
    setTeamId
  };
};