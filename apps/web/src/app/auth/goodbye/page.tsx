import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Page() {
    return (
        <main className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="items-center">
                    <div className="bg-muted mb-2 flex size-12 items-center justify-center rounded-full">
                        <CircleCheck className="text-muted-foreground size-6 " />
                    </div>
                    <CardTitle className="text-2xl">Your account has been deleted</CardTitle>
                    <CardDescription>
                        Your personal data and sign-in methods have been removed. Thanks for
                        playing, and we hope to see you at the board again.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Games you played remain visible to your opponents, but they no longer show
                        your identity.
                    </p>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/">Back to home</Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="w-full">
                        <Link href="/auth/register">Create a new account</Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
