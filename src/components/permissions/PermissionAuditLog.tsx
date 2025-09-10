import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Search, Filter, Download, Shield, User, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuditLogEntry {
  id: string
  timestamp: string
  user_id: string
  user_name: string
  action: 'permission_granted' | 'permission_revoked' | 'role_changed' | 'login_attempt' | 'access_denied'
  target_user_id?: string
  target_user_name?: string
  details: string
  ip_address?: string
  user_agent?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export const PermissionAuditLog: React.FC = () => {
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [auditLogs, searchTerm, actionFilter, severityFilter])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual implementation
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user_id: 'user1',
          user_name: 'John Admin',
          action: 'permission_granted',
          target_user_id: 'user2',
          target_user_name: 'Jane Smith',
          details: 'Granted "manage_users" permission',
          ip_address: '192.168.1.100',
          severity: 'medium'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user_id: 'user3',
          user_name: 'Bob Security',
          action: 'role_changed',
          target_user_id: 'user4',
          target_user_name: 'Alice Manager',
          details: 'Changed role from "resident" to "society_president"',
          ip_address: '192.168.1.101',
          severity: 'high'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user_id: 'unknown',
          user_name: 'Unknown User',
          action: 'access_denied',
          details: 'Attempted to access admin panel without permissions',
          ip_address: '203.0.113.1',
          severity: 'critical'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          user_id: 'user1',
          user_name: 'John Admin',
          action: 'permission_revoked',
          target_user_id: 'user5',
          target_user_name: 'Charlie User',
          details: 'Revoked "manage_finances" permission',
          ip_address: '192.168.1.100',
          severity: 'medium'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          user_id: 'user6',
          user_name: 'Diana Resident',
          action: 'login_attempt',
          details: 'Failed login attempt - invalid 2FA code',
          ip_address: '192.168.1.105',
          severity: 'low'
        },
      ]
      
      setAuditLogs(mockLogs)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const filterLogs = () => {
    let filtered = auditLogs

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.target_user_name && log.target_user_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter)
    }

    setFilteredLogs(filtered)
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Target User', 'Details', 'IP Address', 'Severity'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_name,
        log.action,
        log.target_user_name || '',
        log.details,
        log.ip_address || '',
        log.severity
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: 'Audit logs exported successfully',
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'permission_granted':
      case 'permission_revoked':
        return <Shield className="w-4 h-4" />
      case 'role_changed':
        return <User className="w-4 h-4" />
      case 'login_attempt':
        return <Clock className="w-4 h-4" />
      case 'access_denied':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'permission_granted':
        return 'text-green-600'
      case 'permission_revoked':
        return 'text-orange-600'
      case 'role_changed':
        return 'text-blue-600'
      case 'login_attempt':
        return 'text-gray-600'
      case 'access_denied':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Permission Audit Log
        </CardTitle>
        <CardDescription>
          Track all permission changes and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="permission_granted">Permission Granted</SelectItem>
                <SelectItem value="permission_revoked">Permission Revoked</SelectItem>
                <SelectItem value="role_changed">Role Changed</SelectItem>
                <SelectItem value="login_attempt">Login Attempt</SelectItem>
                <SelectItem value="access_denied">Access Denied</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportLogs} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Audit Log Entries */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading audit logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found matching your filters
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{formatAction(log.action)}</span>
                        <Badge variant={getSeverityVariant(log.severity)} className="text-xs">
                          {log.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm mb-2">{log.details}</div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {log.user_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{log.user_name}</span>
                        </div>
                        
                        {log.target_user_name && (
                          <div className="flex items-center gap-2">
                            <span>→</span>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {log.target_user_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{log.target_user_name}</span>
                          </div>
                        )}
                        
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}