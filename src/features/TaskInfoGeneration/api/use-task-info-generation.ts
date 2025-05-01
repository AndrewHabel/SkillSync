import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

// Define the API types based on the taskgeneration API which is similar
type ResponseType = {
  data: { 
    response: string 
  }
};

type RequestType = { 
  json: { 
    userInput: string 
  } 
};

export interface GeneratedTaskInfo {
  preferredRole?: string;
  expertiseLevel?: string;
  estimatedHours?: number;
}

export const useTaskInfoGeneration = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await fetch('/api/taskInfoGeneration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate task information");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Task information generated successfully!");
      return data;
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to generate task information!");
    }
  });

  return mutation;
};