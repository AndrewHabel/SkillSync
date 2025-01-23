import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
   <div className="">
    <Input></Input>
    <Button>primary</Button>
    <Button variant="secondary">secondary</Button>
    <Button variant="destructive">destructive</Button>
    <Button variant="muted">muted</Button>
    <Button variant="ghost">ghost</Button>
    <Button variant="teritary">teritary</Button>
    <Button variant="outline">outline</Button>
   </div>
  );
}
