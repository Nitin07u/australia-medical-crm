import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  MapPin, 
  UserCheck, 
  ExternalLink, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Columns, 
  CheckSquare, 
  Square, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Mail,
  Phone
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getLeadScoreBadge, getOpportunityLevel } from '../../services/auditCalculator';
import { SortField, LeadStatus } from '../../types';

export function LeadTable() {
  const { 
    filteredLeads, 
    sort, 
    setSort, 
    selectedLeadIds, 
    toggleSelectLead, 
    selectAllFiltered, 
    clearSelection,
    openLeadDetail,
    deleteLead,
    filters,
    setFilters
  } = useLeads();

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    score: true,
    business: true,
    type: true,
    location: true,
    website: true,
    websiteStatus: true,
    googleMaps: true,
    decisionMaker: true,
    email: true,
    leadStatus: true,
    createdDate: true,
    actions: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.business.id));
  const isSomeSelected = selectedLeadIds.length > 0 && !isAllSelected;

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sort.order === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      : <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Table Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Search input in table */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within current list..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-subtle font-medium"
          />
        </div>

        {/* Right side options: Column toggle + Page Size */}
        <div className="flex items-center gap-3">
          {/* Column Visibility */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-subtle transition-colors"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-30 space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
                  Toggle Columns
                </div>
                {Object.entries({
                  score: 'Lead Score',
                  business: 'Business Name',
                  type: 'Business Type',
                  location: 'City / State',
                  website: 'Website URL',
                  websiteStatus: 'Website Status',
                  googleMaps: 'Google Maps',
                  decisionMaker: 'Decision Maker',
                  email: 'General Email',
                  leadStatus: 'Lead Status',
                  createdDate: 'Created Date'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={visibleColumns[key] ?? true}
                      onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-blue-500 shadow-subtle"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main CRM Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                
                {/* Checkbox Column */}
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={() => isAllSelected ? clearSelection() : selectAllFiltered()}
                    className="flex items-center text-slate-500 hover:text-blue-600"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isSomeSelected ? (
                      <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                        -
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* Score */}
                {visibleColumns.score && (
                  <th 
                    onClick={() => handleSort('lead_score')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      {renderSortIcon('lead_score')}
                    </div>
                  </th>
                )}

                {/* Business Name */}
                {visibleColumns.business && (
                  <th 
                    onClick={() => handleSort('business_name')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group min-w-[200px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Business Name</span>
                      {renderSortIcon('business_name')}
                    </div>
                  </th>
                )}

                {/* Business Type */}
                {visibleColumns.type && (
                  <th 
                    onClick={() => handleSort('business_type')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Type</span>
                      {renderSortIcon('business_type')}
                    </div>
                  </th>
                )}

                {/* City / State */}
                {visibleColumns.location && (
                  <th 
                    onClick={() => handleSort('state')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      {renderSortIcon('state')}
                    </div>
                  </th>
                )}

                {/* Website */}
                {visibleColumns.website && (
                  <th className="py-3 px-3">
                    <span>Website</span>
                  </th>
                )}

                {/* Website Status */}
                {visibleColumns.websiteStatus && (
                  <th 
                    onClick={() => handleSort('website_status')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {renderSortIcon('website_status')}
                    </div>
                  </th>
                )}

                {/* Google Maps */}
                {visibleColumns.googleMaps && (
                  <th className="py-3 px-3">
                    <span>Google Maps</span>
                  </th>
                )}

                {/* Decision Maker */}
                {visibleColumns.decisionMaker && (
                  <th className="py-3 px-4 min-w-[180px]">
                    <span>Decision Maker</span>
                  </th>
                )}

                {/* General Email */}
                {visibleColumns.email && (
                  <th className="py-3 px-3">
                    <span>Email</span>
                  </th>
                )}

                {/* Lead Pipeline Status */}
                {visibleColumns.leadStatus && (
                  <th className="py-3 px-3">
                    <span>Pipeline</span>
                  </th>
                )}

                {/* Created Date */}
                {visibleColumns.createdDate && (
                  <th 
                    onClick={() => handleSort('created_at')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      {renderSortIcon('created_at')}
                    </div>
                  </th>
                )}

                {/* Actions */}
                {visibleColumns.actions && (
                  <th className="py-3 px-3 text-right">
                    <span>Actions</span>
                  </th>
                )}

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-normal">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => {
                  const b = lead.business;
                  const dp = lead.digital_presence;
                  const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                  const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                  const opp = getOpportunityLevel(lead.website_audit?.opportunity_score ?? 50);
                  const isSelected = selectedLeadIds.includes(b.id);

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleSelectLead(b.id)}
                          className="flex items-center text-slate-400 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Lead Score */}
                      {visibleColumns.score && (
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold text-[11px] ${scoreBadge.badgeClass}`}>
                            ★ {lead.lead.lead_score}
                          </span>
                        </td>
                      )}

                      {/* Business Name */}
                      {visibleColumns.business && (
                        <td className="py-3.5 px-4">
                          <div 
                            onClick={() => openLeadDetail(b.id)}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {b.business_name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-2 mt-0.5">
                            {b.abn && <span>ABN: {b.abn}</span>}
                            {b.subcategory && <span>• {b.subcategory}</span>}
                          </div>
                          {lead.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {lead.tags.map(t => (
                                <span key={t.id} className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  #{t.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Type */}
                      {visibleColumns.type && (
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {b.business_type}
                          </span>
                        </td>
                      )}

                      {/* City / State */}
                      {visibleColumns.location && (
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{b.city}</span>,{' '}
                          <span className="font-bold text-blue-600 dark:text-blue-400">{b.state}</span>
                        </td>
                      )}

                      {/* Website */}
                      {visibleColumns.website && (
                        <td className="py-3.5 px-3">
                          {dp.website_url ? (
                            <a
                              href={dp.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline max-w-[140px] truncate"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate">{dp.website_url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No URL</span>
                          )}
                        </td>
                      )}

                      {/* Website Status */}
                      {visibleColumns.websiteStatus && (
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${opp.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${opp.bgClass}`} />
                            {dp.website_status}
                          </span>
                        </td>
                      )}

                      {/* Google Maps */}
                      {visibleColumns.googleMaps && (
                        <td className="py-3.5 px-3">
                          {dp.google_maps_verified === 'Verified' ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>{dp.google_rating ? `★ ${dp.google_rating}` : 'Verified'}</span>
                              {dp.google_review_count ? <span className="text-[10px] text-slate-400">({dp.google_review_count})</span> : null}
                            </div>
                          ) : (
                            <span className="text-slate-400">{dp.google_maps_verified}</span>
                          )}
                        </td>
                      )}

                      {/* Decision Maker */}
                      {visibleColumns.decisionMaker && (
                        <td className="py-3.5 px-4">
                          {dm ? (
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                {dm.full_name}
                              </p>
                              <p className="text-[11px] text-slate-400">{dm.position}</p>
                              {dm.email && (
                                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-2.5 h-2.5" /> {dm.email}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No contact found</span>
                          )}
                        </td>
                      )}

                      {/* General Email */}
                      {visibleColumns.email && (
                        <td className="py-3.5 px-3">
                          {b.general_email ? (
                            <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate block max-w-[130px]" title={b.general_email}>
                              {b.general_email}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Pipeline Status */}
                      {visibleColumns.leadStatus && (
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {lead.lead.lead_status}
                          </span>
                        </td>
                      )}

                      {/* Created Date */}
                      {visibleColumns.createdDate && (
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {b.created_at.split('T')[0]}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openLeadDetail(b.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                              title="View Lead Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${b.business_name}?`)) {
                                  deleteLead(b.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No medical leads matched your criteria</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or importing new Australian medical businesses.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="text-slate-500">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">
              {filteredLeads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, filteredLeads.length)}
            </span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredLeads.length}</span> leads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
