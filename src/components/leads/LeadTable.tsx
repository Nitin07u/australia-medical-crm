import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  MapPin, 
  UserCheck, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Columns, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  Mail,
  Phone,
  Check,
  Edit3
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getLeadScoreBadge, getWebsiteStatusBadge, getPipelineStatusBadge } from '../../services/auditCalculator';
import { SortField, LeadFull } from '../../types';
import { EditHospitalModal } from '../modals/EditHospitalModal';

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

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    score: true,
    business: true,
    category: true,
    location: true,
    website: true,
    websiteStatus: true,
    contact: true,
    pipeline: true,
    actions: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<LeadFull | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.business.id));

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sort.order === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-[#2563EB]" />
      : <ArrowDown className="w-3 h-3 text-[#2563EB]" />;
  };

  return (
    <div className="space-y-3">
      
      {/* Top Search & Table Options Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Search */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within current results..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] shadow-xs focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 relative">
          
          {/* Columns Visibility Toggle */}
          <button
            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] text-xs font-medium transition-colors shadow-xs"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Columns</span>
          </button>

          {isColumnDropdownOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl border border-[#E2E8F0] shadow-card z-30 p-2 text-xs font-medium space-y-1 animate-fadeIn">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase px-2 py-1 block">Toggle Columns</span>
              {Object.keys(visibleColumns).map(colKey => (
                <label key={colKey} className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8FAFC] rounded-md cursor-pointer">
                  <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns[colKey]}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, [colKey]: e.target.checked })}
                    className="rounded text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5"
                  />
                </label>
              ))}
            </div>
          )}

          {/* Results count indicator */}
          <div className="text-xs text-[#64748B] font-medium px-2">
            Showing <strong className="text-[#0F172A]">{filteredLeads.length}</strong> leads
          </div>
        </div>

      </div>

      {/* Main SaaS Data Table Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                
                {/* Select Checkbox */}
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => {
                      if (e.target.checked) selectAllFiltered();
                      else clearSelection();
                    }}
                    className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 cursor-pointer"
                  />
                </th>

                {/* Score */}
                {visibleColumns.score && (
                  <th 
                    onClick={() => handleSort('lead_score')}
                    className="py-3 px-3 cursor-pointer group hover:text-[#0F172A] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Lead Score</span>
                      {renderSortIcon('lead_score')}
                    </div>
                  </th>
                )}

                {/* Business Name */}
                {visibleColumns.business && (
                  <th 
                    onClick={() => handleSort('business_name')}
                    className="py-3 px-4 cursor-pointer group hover:text-[#0F172A] min-w-[200px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Medical Facility</span>
                      {renderSortIcon('business_name')}
                    </div>
                  </th>
                )}

                {/* Category */}
                {visibleColumns.category && (
                  <th 
                    onClick={() => handleSort('business_type')}
                    className="py-3 px-3 cursor-pointer group hover:text-[#0F172A] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {renderSortIcon('business_type')}
                    </div>
                  </th>
                )}

                {/* State / Location */}
                {visibleColumns.location && (
                  <th 
                    onClick={() => handleSort('state')}
                    className="py-3 px-3 cursor-pointer group hover:text-[#0F172A] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>State</span>
                      {renderSortIcon('state')}
                    </div>
                  </th>
                )}

                {/* Website */}
                {visibleColumns.website && (
                  <th className="py-3 px-4 whitespace-nowrap">
                    <span>Website Domain</span>
                  </th>
                )}

                {/* Website Status */}
                {visibleColumns.websiteStatus && (
                  <th 
                    onClick={() => handleSort('website_status')}
                    className="py-3 px-3 cursor-pointer group hover:text-[#0F172A] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Website Status</span>
                      {renderSortIcon('website_status')}
                    </div>
                  </th>
                )}

                {/* Primary Contact */}
                {visibleColumns.contact && (
                  <th className="py-3 px-4 whitespace-nowrap min-w-[160px]">
                    <span>Primary Contact</span>
                  </th>
                )}

                {/* Pipeline Status */}
                {visibleColumns.pipeline && (
                  <th 
                    onClick={() => handleSort('lead_status')}
                    className="py-3 px-3 cursor-pointer group hover:text-[#0F172A] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Pipeline Stage</span>
                      {renderSortIcon('lead_status')}
                    </div>
                  </th>
                )}

                {/* Actions */}
                {visibleColumns.actions && (
                  <th className="py-3 px-4 text-right whitespace-nowrap w-24">
                    <span>Actions</span>
                  </th>
                )}

              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F1F5F9]">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => {
                  const b = lead.business;
                  const dp = lead.digital_presence;
                  const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                  const isSelected = selectedLeadIds.includes(b.id);
                  const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                  const webBadge = getWebsiteStatusBadge(dp.website_status);
                  const pipeBadge = getPipelineStatusBadge(lead.lead.lead_status);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => openLeadDetail(b.id)}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#EFF6FF]/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(b.id)}
                          className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Lead Score Indicator */}
                      {visibleColumns.score && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-xs ${scoreBadge.textColor}`}>
                              {lead.lead.lead_score}/10
                            </span>
                            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${lead.lead.lead_score * 10}%` }}
                                className={`h-full ${scoreBadge.barColor} rounded-full`}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Facility Business Name */}
                      {visibleColumns.business && (
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate max-w-[220px]">
                            {b.business_name}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate max-w-[220px]">
                            {b.address}, {b.city}
                          </p>
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#475569] font-medium">
                          {b.business_type}
                        </td>
                      )}

                      {/* State */}
                      {visibleColumns.location && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[10px] font-bold border border-[#E2E8F0]">
                            {b.state}
                          </span>
                        </td>
                      )}

                      {/* Website Domain */}
                      {visibleColumns.website && (
                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {dp.website_url ? (
                            <a
                              href={dp.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-mono text-[11px] flex items-center gap-1 truncate max-w-[150px]"
                            >
                              <span className="truncate">{dp.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[#B91C1C] font-semibold text-[11px]">No Website</span>
                          )}
                        </td>
                      )}

                      {/* Website Status Badge */}
                      {visibleColumns.websiteStatus && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${webBadge.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${webBadge.dotColor}`} />
                            <span>{dp.website_status}</span>
                          </span>
                        </td>
                      )}

                      {/* Decision Maker */}
                      {visibleColumns.contact && (
                        <td className="py-3.5 px-4">
                          {dm ? (
                            <div>
                              <p className="font-semibold text-[#0F172A] truncate max-w-[150px]">{dm.full_name}</p>
                              <p className="text-[10px] text-[#64748B] truncate max-w-[150px]">{dm.position}</p>
                            </div>
                          ) : (
                            <span className="text-[#94A3B8] italic text-[11px]">No contact</span>
                          )}
                        </td>
                      )}

                      {/* Pipeline Stage */}
                      {visibleColumns.pipeline && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${pipeBadge.badgeClass}`}>
                            {lead.lead.lead_status}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingHospital(lead)}
                              className="p-1 rounded-md hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] transition-colors"
                              title="Edit facility profile & mail address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openLeadDetail(b.id)}
                              className="p-1 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#2563EB] transition-colors"
                              title="View dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${b.business_name} from CRM?`)) {
                                  deleteLead(b.id);
                                }
                              }}
                              className="p-1 rounded-md hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#B91C1C] transition-colors"
                              title="Delete lead"
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
                  <td colSpan={10} className="py-16 text-center text-[#94A3B8]">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="font-semibold text-sm text-[#475569]">No medical leads found</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Try clearing filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-4 flex-wrap text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-[#E2E8F0] rounded-md px-2 py-1 font-medium text-[#0F172A]"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed text-[#475569]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed text-[#475569]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Hospital / Lead Modal */}
      <EditHospitalModal
        isOpen={Boolean(editingHospital)}
        onClose={() => setEditingHospital(null)}
        lead={editingHospital}
      />

    </div>
  );
}
