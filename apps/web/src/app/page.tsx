import { redirect } from 'next/navigation';

export default function Page() {
    redirect('/bot'); // for now
    return 'Hello';
}
