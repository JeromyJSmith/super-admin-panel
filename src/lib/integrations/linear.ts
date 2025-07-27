import { LinearClient } from '@linear/sdk';
import type { LinearIssue, LinearProject, ApiResponse, PaginatedResponse } from '../../types';

const linearApiKey = import.meta.env.LINEAR_API_KEY;

export class LinearService {
  private client: LinearClient;

  constructor() {
    if (!linearApiKey) {
      throw new Error('Linear API key is required');
    }
    this.client = new LinearClient({ apiKey: linearApiKey });
  }

  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      const me = await this.client.viewer;
      return { success: true, data: !!me };
    } catch (error) {
      return { success: false, error: 'Failed to connect to Linear' };
    }
  }

  async getIssues(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<LinearIssue>>> {
    try {
      const issues = await this.client.issues({
        first: limit,
        after: page > 1 ? btoa(`arrayconnection:${(page - 1) * limit - 1}`) : undefined,
        includeArchived: false,
        orderBy: { updatedAt: 'desc' }
      });

      const formattedIssues: LinearIssue[] = issues.nodes.map(issue => ({
        id: issue.id,
        title: issue.title,
        state: {
          name: issue.state?.name || 'Unknown',
          type: issue.state?.type || 'unknown'
        },
        assignee: issue.assignee ? {
          name: issue.assignee.name,
          email: issue.assignee.email || ''
        } : undefined,
        priority: issue.priority || 0,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        url: issue.url
      }));

      return {
        success: true,
        data: {
          data: formattedIssues,
          total: issues.nodes.length,
          page,
          limit,
          hasNext: issues.pageInfo.hasNextPage,
          hasPrev: issues.pageInfo.hasPreviousPage
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch Linear issues' };
    }
  }

  async getProjects(): Promise<ApiResponse<LinearProject[]>> {
    try {
      const projects = await this.client.projects({
        includeArchived: false,
        orderBy: { updatedAt: 'desc' }
      });

      const formattedProjects: LinearProject[] = await Promise.all(
        projects.nodes.map(async project => {
          // Get issue count for this project
          const projectIssues = await this.client.issues({
            filter: { project: { id: { eq: project.id } } },
            first: 1
          });

          return {
            id: project.id,
            name: project.name,
            description: project.description || undefined,
            state: project.state,
            progress: project.progress,
            startDate: project.startDate?.toISOString(),
            targetDate: project.targetDate?.toISOString(),
            lead: project.lead ? {
              name: project.lead.name,
              email: project.lead.email || ''
            } : undefined,
            issueCount: projectIssues.nodes.length
          };
        })
      );

      return { success: true, data: formattedProjects };
    } catch (error) {
      return { success: false, error: 'Failed to fetch Linear projects' };
    }
  }

  async getMyIssues(): Promise<ApiResponse<LinearIssue[]>> {
    try {
      const me = await this.client.viewer;
      const issues = await this.client.issues({
        filter: { assignee: { id: { eq: me.id } } },
        first: 50,
        orderBy: { updatedAt: 'desc' }
      });

      const formattedIssues: LinearIssue[] = issues.nodes.map(issue => ({
        id: issue.id,
        title: issue.title,
        state: {
          name: issue.state?.name || 'Unknown',
          type: issue.state?.type || 'unknown'
        },
        assignee: {
          name: me.name,
          email: me.email || ''
        },
        priority: issue.priority || 0,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        url: issue.url
      }));

      return { success: true, data: formattedIssues };
    } catch (error) {
      return { success: false, error: 'Failed to fetch your Linear issues' };
    }
  }

  async getTeams(): Promise<ApiResponse<any[]>> {
    try {
      const teams = await this.client.teams();
      return { success: true, data: teams.nodes };
    } catch (error) {
      return { success: false, error: 'Failed to fetch Linear teams' };
    }
  }

  async createIssue(title: string, description?: string, teamId?: string): Promise<ApiResponse<LinearIssue>> {
    try {
      const teams = await this.client.teams();
      const defaultTeam = teamId ? teams.nodes.find(t => t.id === teamId) : teams.nodes[0];

      if (!defaultTeam) {
        return { success: false, error: 'No team found' };
      }

      const issue = await this.client.createIssue({
        title,
        description,
        teamId: defaultTeam.id
      });

      const createdIssue = await issue.issue;
      if (!createdIssue) {
        return { success: false, error: 'Failed to create issue' };
      }

      const formattedIssue: LinearIssue = {
        id: createdIssue.id,
        title: createdIssue.title,
        state: {
          name: createdIssue.state?.name || 'Unknown',
          type: createdIssue.state?.type || 'unknown'
        },
        assignee: createdIssue.assignee ? {
          name: createdIssue.assignee.name,
          email: createdIssue.assignee.email || ''
        } : undefined,
        priority: createdIssue.priority || 0,
        createdAt: createdIssue.createdAt.toISOString(),
        updatedAt: createdIssue.updatedAt.toISOString(),
        url: createdIssue.url
      };

      return { success: true, data: formattedIssue };
    } catch (error) {
      return { success: false, error: 'Failed to create Linear issue' };
    }
  }

  async getMetrics(): Promise<ApiResponse<any>> {
    try {
      const [issuesResponse, projectsResponse, teamsResponse] = await Promise.all([
        this.getIssues(1, 100),
        this.getProjects(),
        this.getTeams()
      ]);

      if (!issuesResponse.success || !projectsResponse.success || !teamsResponse.success) {
        return { success: false, error: 'Failed to fetch metrics data' };
      }

      const issues = issuesResponse.data?.data || [];
      const projects = projectsResponse.data || [];
      const teams = teamsResponse.data || [];

      const openIssues = issues.filter(issue => 
        issue.state.type === 'started' || issue.state.type === 'unstarted'
      ).length;

      const completedIssues = issues.filter(issue => 
        issue.state.type === 'completed'
      ).length;

      const activeProjects = projects.filter(project => 
        project.state === 'started'
      ).length;

      return {
        success: true,
        data: {
          totalIssues: issues.length,
          openIssues,
          completedIssues,
          totalProjects: projects.length,
          activeProjects,
          totalTeams: teams.length
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch Linear metrics' };
    }
  }
}
