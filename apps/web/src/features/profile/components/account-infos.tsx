import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/features/profile/hooks/use-user';
import { Mail } from 'lucide-react';

export default function AccountInfos() {
    const { user } = useUser();
    return (
        <Card className="shadow-xl w-full">
            {/* <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Account Informations</CardTitle>
                <CardDescription></CardDescription>
            </CardHeader> */}
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input type="email" value={user.email} className="pl-10" disabled />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
