import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Select } from '../../ui/select';
import { PUBLISHERS } from '../../constants/submission';

interface PublicationDestinationCardProps {
    selectedPublisher: string;
    setSelectedPublisher: (value: string) => void;
    selectedFolder: string;
    setSelectedFolder: (value: string) => void;
}

export function PublicationDestinationCard({
    selectedPublisher,
    setSelectedPublisher,
    selectedFolder,
    setSelectedFolder
}: PublicationDestinationCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Publisher</CardTitle>
                <CardDescription>Select where to publish your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-2">
                        <label htmlFor="publisherSelect" className="text-sm font-medium">
                            Select Publisher
                        </label>
                        <Select
                            id="publisherSelect"
                            options={[
                                { value: '', label: 'Choose a publisher...' },
                                ...PUBLISHERS,
                            ]}
                            value={selectedPublisher}
                            onChange={(e) => setSelectedPublisher(e.target.value)}
                        />
                    </div>
                </motion.div>

                {selectedPublisher && (
                    <div className="space-y-2">
                        <label htmlFor="folderSelect" className="text-sm font-medium">
                            Select Folder
                        </label>
                        <Select
                            id="folderSelect"
                            options={[
                                { value: '', label: 'Choose a folder...' },
                                { value: 'root', label: 'Root' },
                                { value: 'folder1', label: 'Folder 1' },
                                { value: 'folder2', label: 'Folder 2' },
                                { value: 'folder3', label: 'Folder 3' },
                            ]}
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
