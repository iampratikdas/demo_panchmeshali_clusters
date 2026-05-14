import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/atoms';
import { motion } from 'framer-motion';
import { Users2, ShieldOff } from 'lucide-react';
import { PublisherTeamsView } from '../components/teams/PublisherTeamsView';
import { WriterTeamsView } from '../components/teams/WriterTeamsView';

export default function Teams() {
    const [user] = useAtom(currentUserAtom);
    const role = user.role;

    const isPublisher = role === 'publisher' || role === 'both';
    const isWriter = role === 'writer';
    const hasAccess = isPublisher || isWriter;

    if (!hasAccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-6 text-center"
            >
                <div className="h-20 w-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <ShieldOff className="h-10 w-10 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        The Teams section is only available for Publishers and Writers.
                        Admin accounts manage users through other sections.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            {/* Page header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/10 flex items-center justify-center">
                        <Users2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Teams</h1>
                        <p className="text-sm text-muted-foreground">
                            {isPublisher
                                ? 'Manage writer requests and your publishing team.'
                                : 'View your publishers and discover new opportunities.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Role-based view */}
            {isPublisher && <PublisherTeamsView />}
            {isWriter && <WriterTeamsView />}
        </motion.div>
    );
}
