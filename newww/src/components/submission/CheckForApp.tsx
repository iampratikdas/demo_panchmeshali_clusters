import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface CheckForAppProps {
    selectedDestination: 'app' | 'social' | 'both' | '';
    setSelectedDestination: (value: 'app' | 'social' | 'both' | '') => void;
}

export function CheckForApp({
    selectedDestination,
    setSelectedDestination
}: CheckForAppProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Publication Destination</CardTitle>
                <CardDescription>Where should this content be published?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                    <input
                        type="radio"
                        id="destination-app"
                        name="destination"
                        value="app"
                        checked={selectedDestination === 'app'}
                        onChange={(e) => setSelectedDestination(e.target.value as 'app')}
                        className="h-5 w-5 border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="destination-app" className="text-sm font-medium cursor-pointer">
                        App Only
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="radio"
                        id="destination-social"
                        name="destination"
                        value="social"
                        checked={selectedDestination === 'social'}
                        onChange={(e) => setSelectedDestination(e.target.value as 'social')}
                        className="h-5 w-5 border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="destination-social" className="text-sm font-medium cursor-pointer">
                        Social Media Page Only
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="radio"
                        id="destination-both"
                        name="destination"
                        value="both"
                        checked={selectedDestination === 'both'}
                        onChange={(e) => setSelectedDestination(e.target.value as 'both')}
                        className="h-5 w-5 border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="destination-both" className="text-sm font-medium cursor-pointer">
                        Both App and Social Media
                    </label>
                </div>
            </CardContent>
        </Card>
    );
}
