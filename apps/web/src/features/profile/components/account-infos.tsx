import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccounts } from '@/features/auth/use-accounts';
import { useUser } from '@/features/profile/hooks/use-user';
import { Mail } from 'lucide-react';
import React from 'react';

export default function AccountInfos() {
    const { user } = useUser();
    const { data: accounts } = useAccounts();

    function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const providers = accounts?.data
        ?.filter((acc) => acc.providerId !== 'credential')
        .map((acc) => capitalize(acc.providerId));

    const isLinked = !!providers && providers.length > 0;

    return (
        <Card className="shadow-xl w-full">
            {/* <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Account Informations</CardTitle>
                <CardDescription></CardDescription>
            </CardHeader> */}
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input type="email" value={user.email} className="pl-10" disabled />
                    </div>
                </div>
                {isLinked && (
                    <div className="text-muted-foreground">
                        Linked with{' '}
                        {providers.map((provider, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && ' and '}
                                <span className="text-primary">{provider}</span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
