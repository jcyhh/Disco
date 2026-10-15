export const mockTeamStats = {
    teamCount: '1,682',
    directCount: '864',
    effectiveDirectCount: '712',
    teamPerformance: '10,000',
    personalPerformance: '10,000',
} as const

export interface MockTeamMember {
    id: string
    address: string
    joinedAt: string
    teamPerformance: string
    personalPerformance: string
}

export const mockTeamMembers: readonly MockTeamMember[] = [
    {
        id: 'team-member-1',
        address: 'sbds****dse1',
        joinedAt: '2025.08.26 12:24',
        teamPerformance: '12,800.00',
        personalPerformance: '1,200.00',
    },
    {
        id: 'team-member-2',
        address: 'sbds****dse1',
        joinedAt: '2025.08.26 12:24',
        teamPerformance: '12,800.00',
        personalPerformance: '1,200.00',
    },
    {
        id: 'team-member-3',
        address: 'sbds****dse1',
        joinedAt: '2025.08.26 12:24',
        teamPerformance: '12,800.00',
        personalPerformance: '1,200.00',
    },
]
