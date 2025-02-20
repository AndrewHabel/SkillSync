import Link from "next/link";
import Image from "next/image";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./Navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./Projects";

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <div className="flex items-center gap-2">
                <div className="w-[165px] flex-shrink-0">
                    <Link href="/">
                        <Image src="/logo.svg" alt="logo" width={165} height={48} />
                    </Link>
                </div>
            </div>
            <DottedSeparator className="my-4"/>
            <WorkspaceSwitcher />
            <DottedSeparator className="my-4"/>
            <Navigation />
            <DottedSeparator className="my-4"/>
            <Projects />
        </aside>
    )
};