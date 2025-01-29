import {redirect} from 'next/navigation';
import { getCurrent } from '@/features/auth/queries';
import { MembersList } from '@/features/workspaces/components/members-list';

const WorkspaceIDMembersPage = async () => {

    const user = await getCurrent();
    if (!user) redirect('/sign-in');

    return (
        <div className='w-full lg:max-w-xl'>
            <MembersList />
        </div>
    );

}

export default WorkspaceIDMembersPage;