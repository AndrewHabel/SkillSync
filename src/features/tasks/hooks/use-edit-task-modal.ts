import { set } from "date-fns";
import {useQueryState, parseAsString} from "nuqs"

export const useEditTaskModal = () => {
    const [taskId , setTaskId] = useQueryState('edit_task',parseAsString);

    const open = (id: string) => setTaskId(id);
    const close = () => setTaskId(null);

    return {
        taskId,
        open,
        close,
        setTaskId
    }

}