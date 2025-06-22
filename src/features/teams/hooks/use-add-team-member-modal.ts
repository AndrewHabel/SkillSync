import { useQueryState, parseAsString } from "nuqs"

export const useAddTeamMemberModal = () => {
    const [teamId, setTeamId] = useQueryState('add_team_member', parseAsString.withDefault(''));
    
    // Add debug logs to track state changes
    const open = (id: string) => {
        console.log("useAddTeamMemberModal - Opening modal with team ID:", id);
        setTeamId(id);
    };
    
    const close = () => {
        console.log("useAddTeamMemberModal - Closing modal");
        setTeamId(null);
    };

    return {
        teamId,
        open,
        close,
        setTeamId
    }
}