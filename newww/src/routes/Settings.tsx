import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-4xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>
                        Settings page coming soon
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Check back later for account settings and preferences.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
