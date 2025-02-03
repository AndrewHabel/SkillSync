import { Task , TaskStatus} from "../types";

import React , { useCallback , useEffect , useState } from "react";

import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import { object } from "zod";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

type TaskState ={
    [key in TaskStatus]: Task[];
}

interface DataKanbanProps {
    data: Task[];
};

export const DataKanban = ({ data }: DataKanbanProps) => {

    const [tasks, setTasks] = useState<TaskState>(() => {

        const initialTasks : TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            initialTasks[task.status].push(task);
        })

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a,b) => a.order - b.order);
        });

        return initialTasks;

    });

    return (
        <DragDropContext onDragEnd={() => {}}>
           <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return(
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader board={board} taskCount={tasks[board].length}/>
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => {
                                            return (
                                                <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white p-1 rounded-md mb-1  hover:opacity-75 hover:bg-blue-800 transition "
                                                        >
                                                            <KanbanCard task={task}/>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
           </div>
        </DragDropContext>
    );
};