import { useQueryState, parseAsString } from "nuqs"

export const useAddTeamMemberModal = () => {
    const [teamId, setTeamId] = useQueryState('add_team_member', parseAsString);
    
    const open = (id: string) => setTeamId(id);
    const close = () => setTeamId(null);

    return {
        teamId,
        open,
        close,
        setTeamId
    }
}