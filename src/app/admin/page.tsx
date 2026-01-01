import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Flag,
    Bell,
    BookOpen,
    Users,
    BarChart3,
    AlertTriangle
} from 'lucide-react';
import { getReportStats } from '@/lib/backend/actions/report';

export default async function AdminDashboardPage() {
    const stats = await getReportStats();

    const adminFeatures = [
        {
            title: 'Content Moderation',
            description: 'Review and manage reported cases and comments.',
            icon: Flag,
            href: '/admin/reports',
            count: stats.pending,
            countLabel: 'pending reports',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            title: 'Platform Notifications',
            description: 'Send system-wide announcements to all users.',
            icon: Bell,
            href: '/admin/notifications',
            status: 'Coming Soon',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Resource Management',
            description: 'Manage clinical resources and guidelines.',
            icon: BookOpen,
            href: '/admin/resources',
            status: 'Planned',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'User Management',
            description: 'Manage user accounts and permissions.',
            icon: Users,
            href: '/admin/users',
            status: 'Internal Use',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
                <p className="text-muted-foreground mt-2">
                    Manage platform content, users, and global configurations.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {adminFeatures.map((feature) => (
                    <Card key={feature.title} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {feature.title}
                            </CardTitle>
                            <div className={`rounded-md p-2 ${feature.bgColor} ${feature.color}`}>
                                <feature.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                {feature.description}
                            </p>

                            {feature.count !== undefined ? (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl font-bold">{feature.count}</span>
                                    <span className="text-xs text-muted-foreground">{feature.countLabel}</span>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                        {feature.status}
                                    </span>
                                </div>
                            )}

                            <Link href={feature.href}>
                                <Button variant="outline" className="w-full" size="sm">
                                    Manage
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Stats or Alerts can go here */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                        <CardDescription>Real-time system status and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">System Performance</p>
                                    <p className="text-xs text-muted-foreground">All systems operational</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Flagged Comments</p>
                                    <p className="text-xs text-muted-foreground">3 new comments awaiting review</p>
                                </div>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest administrative actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No recent administrative actions to show.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
