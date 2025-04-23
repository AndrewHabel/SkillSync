import {redirect} from 'next/navigation';
import { getCurrent } from '@/features/auth/queries';
import { MemberProfile } from '@/features/members/components/member-profile';

const WorkspaceIDMemberProfilePage = async () => {

    const user = await getCurrent();
    if (!user) redirect('/sign-in');

    return (
        <div className='w-full lg:max-w-xl'>
            <MemberProfile/>
        </div>
    );

}

export default WorkspaceIDMemberProfilePage;