import { Spinner } from '@/components/ui/spinner';

export default function LoadingPage() {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <Spinner className="size-10 text-primary" />
        </div>
    );
}
