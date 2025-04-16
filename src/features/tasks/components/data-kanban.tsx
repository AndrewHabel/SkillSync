import { Task , TaskStatus} from "../types";

import React , { use, useCallback , useEffect , useState } from "react";

import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import { object } from "zod";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

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
    onChange: (tasks:{ $id: string, status: TaskStatus, position: number }[]) => void;
};

export const DataKanban = ({ data , onChange }: DataKanbanProps) => {

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

    useEffect(() => {
        
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            newTasks[task.status].push(task);
        });

        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a,b) => a.order - b.order);
        });

        setTasks(newTasks);

    },[data]);

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) {
            return;
        }
        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        let updatePayload: {$id: string, status: TaskStatus, position: number }[] = [];

        setTasks((prevTasks) => {

            const newTasks = { ...prevTasks };

            const sourceCoulmn =[...newTasks[sourceStatus]];
            const [movedTask] = sourceCoulmn.splice(source.index, 1);

            if(!movedTask){
                console.error("No moved task found");
                return prevTasks;
            }

            const updatedMovedTask = sourceStatus === destinationStatus ? {...movedTask, status : destinationStatus} : movedTask;
            newTasks[sourceStatus] = sourceCoulmn;
            const desCoulmn = [...newTasks[destinationStatus]];
            desCoulmn.splice(destination.index, 0, updatedMovedTask);
            newTasks[destinationStatus] = desCoulmn;

            updatePayload = [];

            updatePayload.push({
                $id : updatedMovedTask.$id,
                status : destinationStatus,
                position : Math.min((destination.index + 1)*1000,1_000_000)
            })

            //Update the position of the moved task in the destination column

            newTasks[destinationStatus].forEach((task, index) => {
                if(task && task.$id === updatedMovedTask.$id){
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                    if(task.Position !== newPosition){
                        updatePayload.push({
                            $id : task.$id,
                            status : destinationStatus,
                            position : newPosition
                        });
                    }
                }

            });

            //if the task moved between columns, update the position in the source column
            if (sourceStatus !== destinationStatus) {
                newTasks[destinationStatus].forEach((task, index) => {
                    if(task){
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if(task.Position !== newPosition){
                            updatePayload.push({
                                $id : task.$id,
                                status : destinationStatus,
                                position : newPosition
                            });
                        }
                    }
                })
            }

            return newTasks;
        });
        onChange(updatePayload);
    },[onChange]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
           <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    const columnTasks = tasks[board];
                    const shouldScroll = columnTasks.length > 5;
                    
                    return(
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px] flex flex-col">
                            <KanbanColumnHeader board={board} taskCount={columnTasks.length}/>
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div 
                                        className="flex-1 flex flex-col min-h-[200px]"
                                    >
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                "py-1.5 flex-1", 
                                                shouldScroll && "max-h-[735px] overflow-y-auto pr-1 custom-scrollbar"
                                            )}
                                        >
                                            {columnTasks.map((task, index) => {
                                                return (
                                                    <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-card p-1 rounded-md mb-1 hover:bg-blue-200/80 hover:border-blue-400 transition-colors"
                                                            >
                                                                <KanbanCard task={task}/>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
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