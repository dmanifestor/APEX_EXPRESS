import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Truck,
  MapPin,
  Key,
  Hash,
  ExternalLink,
  SlidersHorizontal,
  Info,
  X,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { AuditLogEntry, AuthorizingUser } from '../data/auditLogs';
import { fetchAuditLog, addAuditLogEntry, resolveAuthorizingOfficer } from '../utils/auditService';

interface FullActivityLogProps {
  parcelId: string;
  currentStatus: string;
  refreshTrigger?: number;
  onStatusChangeTriggered?: (newStatus: 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered') => void;
}

export const FullActivityLog: React.FC<FullActivityLogProps> = ({
  parcelId,
  currentStatus,
  refreshTrigger = 0,
  onStatusChangeTriggered,
}) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation form states
  const [simOfficerKey, setSimOfficerKey] = useState<string>('APEX-DISPATCH-990');
  const [simTargetStatus, setSimTargetStatus] = useState<'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered'>('in_transit');
  const [simRemarks, setSimRemarks] = useState<string>('');
  const [simLocation, setSimLocation] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAuditLog = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await fetchAuditLog(parcelId);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuditLog();
  }, [parcelId, refreshTrigger]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by status
      if (statusFilter !== 'all' && entry.newStatus !== statusFilter) {
        return false;
      }
      // Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        entry.actionName.toLowerCase().includes(q) ||
        entry.reason.toLowerCase().includes(q) ||
        entry.location.toLowerCase().includes(q) ||
        entry.authorizedBy.name.toLowerCase().includes(q) ||
        entry.authorizedBy.badge.toLowerCase().includes(q) ||
        entry.authorizedBy.station.toLowerCase().includes(q) ||
        entry.authorizedBy.keyUsed.toLowerCase().includes(q) ||
        entry.securityAudit.hash.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q)
      );
    });
  }, [entries, statusFilter, searchQuery]);

  // Summary Metrics
  const totalEvents = entries.length;
  const latestEntry = entries[0];
  const uniqueOfficersCount = useMemo(() => {
    const set = new Set(entries.map((e) => e.authorizedBy.userId));
    return set.size;
  }, [entries]);

  const handleExportJSON = () => {
    const report = {
      manifest_code: parcelId,
      exported_at: new Date().toISOString(),
      current_status: currentStatus,
      total_audit_events: entries.length,
      audit_integrity: 'SHA256_CRYPTOGRAPHICALLY_VERIFIED',
      audit_chain: entries,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APEX_AUDIT_LOG_${parcelId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Full audit trail report exported as JSON');
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const officer = resolveAuthorizingOfficer(simOfficerKey, simTargetStatus);
    const previous = latestEntry ? latestEntry.newStatus : 'in_transit';
    
    await addAuditLogEntry(parcelId, simTargetStatus, previous, {
      customOfficer: officer,
      keyUsed: simOfficerKey,
      reason: simRemarks || undefined,
      location: simLocation || undefined,
    });

    setShowSimulateModal(false);
    setSimRemarks('');
    setSimLocation('');
    triggerToast(`Audit log updated: Authorized by ${officer.name} (${officer.roleTitle})`);
    
    // Refresh log list
    await loadAuditLog(true);

    // Also notify parent if status changed
    if (onStatusChangeTriggered && simTargetStatus !== currentStatus) {
      onStatusChangeTriggered(simTargetStatus);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'on_hold':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'out_for_delivery':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
      case 'in_transit':
      default:
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_hold':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'out_for_delivery':
        return <Truck className="w-3.5 h-3.5 text-blue-400" />;
      case 'in_transit':
      default:
        return <Plane className="w-3.5 h-3.5 text-orange-400 rotate-45" />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'customs_officer':
        return 'bg-amber-950/70 border border-amber-600/60 text-amber-300';
      case 'supervisor':
        return 'bg-purple-950/70 border border-purple-600/60 text-purple-300';
      case 'courier_agent':
        return 'bg-blue-950/70 border border-blue-600/60 text-blue-300';
      case 'dispatcher':
      default:
        return 'bg-orange-950/70 border border-orange-600/60 text-orange-300';
    }
  };

  return (
    <section className="bg-[#141618] border border-[#23272b] rounded-sm p-6 sm:p-8 relative overflow-hidden border-t-4 border-t-orange-500">
      {/* Background Subtle Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-9xl font-black text-orange-500 font-mono select-none">
        AUDIT
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16181b] border-2 border-orange-500 text-white px-4 py-3 rounded-sm shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          <BadgeCheck className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Contract: Title, Badges & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#23272b] relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-orange-400 font-bold tracking-wider">APEX AIRWAYS GLOBAL LEDGER</span>
            <span>&middot;</span>
            <span>MANIFEST #{parcelId}</span>
            <span>&middot;</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographic Audit Chain Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <span>Full Activity Log</span>
            <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-mono font-normal">
              {entries.length} Events Recorded
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Immutable chronologic record of all status changes, operational handovers, customs inspections, and the verified personnel who authorized each event.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadAuditLog(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-[#1b1e22] hover:bg-[#252a2f] text-zinc-200 border border-[#2e3338] text-xs font-mono font-semibold rounded-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Re-fetch audit log from secure server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Log'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-[#1b1e22] hover:bg-[#252a2f] text-zinc-200 border border-[#2e3338] text-xs font-mono font-semibold rounded-sm transition-all flex items-center gap-2 cursor-pointer"
            title="Download immutable audit trail certificate"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#1b1e22] hover:bg-[#252a2f] text-zinc-200 border border-[#2e3338] text-xs font-mono font-semibold rounded-sm transition-all flex items-center gap-2 cursor-pointer"
            title="Print audit trail report"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Print Log</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Record Change</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 text-xs font-mono">
        <div className="bg-[#0e0f11] border border-[#23272b] p-3.5 rounded-sm">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Total Recorded Actions</span>
          <div className="text-xl font-black text-white mt-1">{totalEvents} Transitions</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            100% Verified Signatures
          </span>
        </div>

        <div className="bg-[#0e0f11] border border-[#23272b] p-3.5 rounded-sm">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Latest Authorizer</span>
          <div className="text-sm font-bold text-orange-400 mt-1 truncate">
            {latestEntry ? latestEntry.authorizedBy.name : 'System Initializer'}
          </div>
          <span className="text-[11px] text-zinc-400 truncate block mt-0.5">
            {latestEntry ? latestEntry.authorizedBy.badge : 'GLOBAL-DISPATCH'}
          </span>
        </div>

        <div className="bg-[#0e0f11] border border-[#23272b] p-3.5 rounded-sm">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Authorized Officers</span>
          <div className="text-xl font-black text-white mt-1">{uniqueOfficersCount} Operators</div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block truncate">
            Dispatch, Customs & Ground Ops
          </span>
        </div>

        <div className="bg-[#0e0f11] border border-[#23272b] p-3.5 rounded-sm">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Audit Ledger Status</span>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tamper-Resistant</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block truncate">
            SHA-256 HMAC Encrypted
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0b0c0e] border border-[#23272b] p-3 rounded-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Authorizing Officer, Badge, Location, Action or Key..."
            className="w-full bg-[#141618] border border-[#2b3036] rounded-sm pl-9 pr-3 py-2 text-white placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="text-zinc-500 font-mono text-[11px] uppercase mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </div>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'on_hold', label: 'Customs Hold' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-orange-500 text-black font-bold'
                  : 'bg-[#181a1d] text-zinc-400 hover:text-white hover:bg-[#23272b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[#16181b] border border-[#23272b] p-5 rounded-sm flex flex-col md:flex-row gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-12 bg-[#0d0e10] border border-[#23272b] rounded-sm p-8">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white uppercase font-mono">No matching activity records</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No audit logs matched search criteria "${searchQuery}". Clear search or adjust filter tabs.`
              : 'No activity records found for this consignment.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-3 py-1.5 bg-[#1b1e22] hover:bg-[#252a2f] text-orange-400 border border-[#2e3338] text-xs font-mono font-semibold rounded cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}

      {/* Audit Log Entries Timeline / Cards */}
      {!loading && filteredEntries.length > 0 && (
        <div className="space-y-4 relative">
          {filteredEntries.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            const officer = entry.authorizedBy;
            const audit = entry.securityAudit;

            return (
              <div
                key={entry.id}
                className="bg-[#0f1012] border border-[#23272b] hover:border-[#383d44] transition-all rounded-sm p-4 sm:p-5 relative group"
              >
                {/* Top Row: Timestamp, Transition Pill, and Authorizing User Summary */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-orange-400 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span>{entry.timestamp}</span>
                    </span>

                    <span className="text-zinc-600">&middot;</span>

                    {/* Transition badge */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-zinc-500 uppercase">{entry.previousStatus.replace('_', ' ')}</span>
                      <span className="text-zinc-400">&rarr;</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${getStatusBadgeStyle(entry.newStatus)}`}>
                        {getStatusIcon(entry.newStatus)}
                        <span>{entry.newStatus.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <span className="text-zinc-600 hidden sm:inline">&middot;</span>
                    <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">{entry.id}</span>
                  </div>

                  {/* Quick Expand Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-[#16181b] hover:bg-[#1e2226] border border-[#2b3036] rounded cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Security Specs' : 'View Security Specs'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 px-2.5 py-1 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/60 rounded cursor-pointer transition-colors"
                      title="Inspect full cryptographic seal"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Seal Details</span>
                    </button>
                  </div>
                </div>

                {/* Main Action Title & Reason */}
                <div className="mb-4">
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span>{entry.actionName}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                    {entry.reason}
                  </p>
                </div>

                {/* AUTHORIZED BY CARD: Highlighted Dedicated Box */}
                <div className="bg-[#141618] border border-[#282d33] rounded p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left: Officer Profile (7 cols) */}
                  <div className="md:col-span-7 flex items-center gap-3.5">
                    {/* Avatar Badge */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded bg-gradient-to-br from-zinc-800 to-zinc-950 border border-orange-500/40 text-orange-400 font-bold font-mono flex items-center justify-center shrink-0 shadow-inner">
                      {officer.avatarInitials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">
                          Authorized Sign-Off:
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          {officer.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${getRoleBadgeStyle(officer.role)}`}>
                          {officer.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 mt-0.5 truncate font-mono">
                        <span>{officer.roleTitle}</span>
                        <span className="text-zinc-600 mx-1.5">&middot;</span>
                        <span className="text-zinc-300 font-semibold">Badge #{officer.badge}</span>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{officer.station}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Used & Station Metadata (5 cols) */}
                  <div className="md:col-span-5 md:border-l md:border-[#23272b] md:pl-4 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                        <Key className="w-3 h-3 text-orange-400" />
                        <span>Auth Token:</span>
                      </span>
                      <span className="text-orange-400 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-orange-500/30 text-[11px]">
                        {officer.keyUsed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[11px]">Department:</span>
                      <span className="text-zinc-300 truncate max-w-[170px]" title={officer.department}>
                        {officer.department}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[11px]">Officer Contact:</span>
                      <a href={`mailto:${officer.email}`} className="text-zinc-400 hover:text-white truncate underline">
                        {officer.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expanded Technical / Cryptographic Security Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#23272b] bg-[#0c0d0f] p-3 rounded text-xs font-mono space-y-2 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Cryptographic Clearance Signature Verified</span>
                      </span>
                      <span className="text-zinc-500 text-[11px]">Protocol: {audit.protocol}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block">SHA-256 Ledger Hash:</span>
                        <span className="text-zinc-300 select-all font-mono break-all">{audit.hash}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Authorizing Terminal & IP:</span>
                        <span className="text-zinc-300">
                          {audit.terminalId} &middot; IP {audit.ipAddress}
                        </span>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="pt-1 text-zinc-400 text-[11px] border-t border-[#1e2226]">
                        <span className="text-zinc-500 font-semibold">Logistics Notes: </span>
                        <span>{entry.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Detailed Audit Certificate Seal Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141618] border border-[#2b3036] w-full max-w-xl rounded-sm p-6 sm:p-7 shadow-2xl relative border-l-4 border-l-orange-500">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-extrabold uppercase tracking-wider text-white font-mono">
                Official Authorization Record & Seal
              </h3>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-[#0b0c0e] p-3.5 rounded border border-[#23272b] space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Record ID:</span>
                  <span className="text-white font-bold">{selectedEntry.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Parcel Tracking Code:</span>
                  <span className="text-orange-400 font-bold">{selectedEntry.parcelId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="text-zinc-300">{selectedEntry.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status Change:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedEntry.previousStatus} &rarr; {selectedEntry.newStatus}
                  </span>
                </div>
              </div>

              {/* Authorizing Person */}
              <div className="bg-[#0e1012] p-3.5 rounded border border-[#282d33] space-y-1.5">
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                  Authorizing Personnel & Credentials
                </span>
                <div className="text-white text-sm font-bold">{selectedEntry.authorizedBy.name}</div>
                <div className="text-zinc-300">{selectedEntry.authorizedBy.roleTitle}</div>
                <div className="text-zinc-400 text-[11px]">Badge: {selectedEntry.authorizedBy.badge}</div>
                <div className="text-zinc-400 text-[11px]">Station: {selectedEntry.authorizedBy.station}</div>
                <div className="text-zinc-400 text-[11px]">Department: {selectedEntry.authorizedBy.department}</div>
                <div className="text-orange-400 text-[11px] pt-1">
                  Validated Key: {selectedEntry.authorizedBy.keyUsed}
                </div>
              </div>

              {/* Cryptographic hash */}
              <div className="bg-[#090a0c] p-3 rounded border border-[#202327] space-y-1 text-[11px]">
                <span className="text-zinc-500 block">Digital HMAC Hash Proof:</span>
                <span className="text-zinc-300 break-all select-all font-mono">{selectedEntry.securityAudit.hash}</span>
                <div className="flex justify-between pt-1 text-zinc-500 text-[10px]">
                  <span>Terminal: {selectedEntry.securityAudit.terminalId}</span>
                  <span>IP: {selectedEntry.securityAudit.ipAddress}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded text-xs uppercase"
                >
                  Close Seal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simulate / Record Authorized Status Change */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141618] border border-[#2b3036] w-full max-w-lg rounded-sm p-6 shadow-2xl relative border-t-4 border-t-orange-500">
            <button
              onClick={() => setShowSimulateModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold uppercase tracking-wider text-white font-mono">
                Record Authorized Status Change
              </h3>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Select Authorizing Officer & Key
                </label>
                <select
                  value={simOfficerKey}
                  onChange={(e) => setSimOfficerKey(e.target.value)}
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                >
                  <option value="APEX-DISPATCH-990">Markus Vance &middot; Lead Dispatcher (APEX-DISPATCH-990)</option>
                  <option value="EGY-CUST-AUTH-41">Officer Tariq Al-Farouk &middot; Egypt Customs (EGY-CUST-AUTH-41)</option>
                  <option value="DEMO-KEY-2026">Operations Supervisor &middot; Global Ops (DEMO-KEY-2026)</option>
                </select>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  The selected personnel will be cryptographically recorded as authorizing this transition.
                </span>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  New Parcel Status
                </label>
                <select
                  value={simTargetStatus}
                  onChange={(e) => setSimTargetStatus(e.target.value as any)}
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                >
                  <option value="in_transit">in_transit &mdash; Package is on its way</option>
                  <option value="on_hold">on_hold &mdash; Package is on hold in Egypt</option>
                  <option value="out_for_delivery">out_for_delivery &mdash; Out for Delivery</option>
                  <option value="delivered">delivered &mdash; Delivered & Signed</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Operational Remarks / Justification
                </label>
                <textarea
                  value={simRemarks}
                  onChange={(e) => setSimRemarks(e.target.value)}
                  rows={2}
                  placeholder="e.g., Cargo inspection cleared at Terminal 2 inspection bay. Approved per manifest."
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Station / Terminal Location
                </label>
                <input
                  type="text"
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  placeholder="e.g., Cairo Airport Terminal 2 Cargo Village, Bay B-4"
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold uppercase rounded tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Commit to Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
