'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { consentCookies } from '@/features/profile/requests';

const LOCAL_FLAG = 'cookie-consent-decided';

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(LOCAL_FLAG)) setVisible(true);
    }, []);

    async function decide(accepted: boolean) {
        try {
            await consentCookies(accepted);
        } finally {
            localStorage.setItem(LOCAL_FLAG, accepted ? 'accepted' : 'rejected');
            setVisible(false);
        }
    }

    if (!visible) return null;

    return (
        <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl sm:w-sm shadow-lg sm:left-auto sm:right-4">
            <CardHeader>
                <CardTitle>We use cookies</CardTitle>
                <CardDescription>
                    Non-essential cookies help us remember things like your last login method. You
                    can accept or reject them.
                </CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => decide(false)}>
                    Reject
                </Button>
                <Button onClick={() => decide(true)}>Accept</Button>
            </CardFooter>
        </Card>
    );
}
