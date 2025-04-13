import {cn} from "@/lib/utils";

interface DottedSeparatorProps {
  className? : string;
  color?: string;
  hight?: string;
  dotSize?: string;
  gapSize?: string;
  direction?: "horizontal" | "vertical";
}

export const DottedSeparator = ({
  className,
  color,
  hight = "2px",
  dotSize = "2px",
  gapSize = "6px",
  direction = "horizontal"

}: DottedSeparatorProps) => {
  const isHorizontal = direction === "horizontal";
  
  return(
    <div className={cn(
      isHorizontal ? "w-full flex items-center" : "h-full flex flex-col items-center",
      className
    )}>
      <div
        className={cn(
          isHorizontal ? "flex-grow" : "flex-grow-0",
          !color && "text-muted-foreground"
        )}
        style={{
          width: isHorizontal ? "100%" : hight,
          height: isHorizontal ? hight : "100%",
          backgroundImage: `radial-gradient(circle, ${color || "currentColor"} 25%, transparent 25%)`,
          backgroundSize: isHorizontal
            ? `${parseInt(dotSize) + parseInt(gapSize)}px ${hight}`:
            `${hight} ${parseInt(dotSize) + parseInt(gapSize)}px`,
          backgroundRepeat: isHorizontal ? "repeat-x" : "repeat-y",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};