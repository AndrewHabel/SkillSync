import {redirect} from 'next/navigation';
import { getCurrent } from '@/features/auth/queries';
import { MemberProfile } from '@/features/members/components/member-profile';
import { StarryBackground } from '@/components/starry-background';

const WorkspaceIDMemberProfilePage = async () => {

    const user = await getCurrent();
    if (!user) redirect('/sign-in');

    return (
        <>
            <StarryBackground starCount={180} minSize={0.5} maxSize={2.5} />
            <div className='w-full lg:max-w-xl'>
                <MemberProfile/>
            </div>
        </>
    );

}

export default WorkspaceIDMemberProfilePage;