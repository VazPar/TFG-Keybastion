import api from './api';

export interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    details?: string;
    resourceName?: string;
}

export interface RecentActivity {
    action: string;
    timestamp: string;
    details: string;
    icon: string; // CSS class or icon name
    timeAgo: string;
}

class ActivityService {
    public async getRecentActivities(limit: number = 3): Promise<RecentActivity[]> {
        try {
            // Call the API endpoint to retrieve recent activity logs
            const activityLogs = await api.get<RecentActivity[]>(`/api/activity-logs/recent?limit=${limit}`);
            console.log("THE ACTIVITY LOG IS:", activityLogs)
            return activityLogs;

        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    }
}

export const activityService = new ActivityService();
export default activityService;
