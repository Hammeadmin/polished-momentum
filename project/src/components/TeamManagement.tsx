import React, { useState, useEffect, useRef } from 'react';
import {
  Users2,
  Eye,
  Plus,
  Search,
  Filter,
  Crown,
  User,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Target,
  Phone,
  Mail,
  UserPlus,
  UserMinus,
  ChevronDown,
  FileText,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2
} from 'lucide-react';
import { Button } from './ui';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
  getUnassignedUsers,
  addTeamMember,
  removeTeamMember,
  type TeamWithRelations,
  type TeamFilters,
  getAttendance,
  updateAttendance
} from '../lib/teams';
import { getTeamMembers, formatCurrency, formatDate, createUser, updateUserProfile } from '../lib/database';
import {
  TEAM_SPECIALTY_LABELS,
  TEAM_ROLE_LABELS,
  getTeamSpecialtyColor,
  getTeamRoleColor,
  UserRole, EmploymentType,
  type TeamSpecialty,
  type TeamRole,
  type UserProfile,
  type AttendanceRecord,
  type AttendanceStatus,
  type TimeLog,
  type PayrollAdjustment
} from '../types/database';
import {
  getTimeLogsForPayroll,
  updateTimeLogApproval,
  getPayrollAdjustments,
  addPayrollAdjustment,
  deletePayrollAdjustment,
  getPayrollStatus,
  updatePayrollStatus,
  getPayrollDataForPeriod
} from '../lib/teams';
import EmptyState from './EmptyState';
import { Loader2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const ATTENDANCE_OPTIONS: { value: AttendanceStatus | null; label: string; color: string; bgColor: string }[] = [
  { value: 'present', label: 'Närvarande', color: 'text-green-800', bgColor: 'bg-green-100' },
  { value: 'sick', label: 'Sjuk', color: 'text-red-800', bgColor: 'bg-red-100' },
  { value: 'vacation', label: 'Semester', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  { value: 'leave', label: 'Tjänstledig', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  { value: 'absent', label: 'Frånvarande', color: 'text-gray-800', bgColor: 'bg-gray-200' },
  { value: null, label: 'Rensa', color: 'text-gray-500', bgColor: 'bg-white' }
];

const CreateUserModal = ({ isOpen, onClose, onCreate, isLoading, organisationId }: { isOpen: boolean; onClose: () => void; onCreate: (userData: any) => void; isLoading: boolean; organisationId: string | null }) => {
  const [employmentType, setEmploymentType] = useState<EmploymentType>('hourly');
  const [hasCommission, setHasCommission] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      organisation_id: organisationId,
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      phone_number: formData.get('phone_number') as string,
      address: formData.get('address') as string,
      postal_code: formData.get('postal_code') as string,
      city: formData.get('city') as string,
      personnummer: formData.get('personnummer') as string,
      bank_account_number: formData.get('bank_account_number') as string,
      employment_type: employmentType,
      base_hourly_rate: employmentType === 'hourly' ? Number(formData.get('base_hourly_rate')) : null,
      base_monthly_salary: employmentType === 'salary' ? Number(formData.get('base_monthly_salary')) : null,
      has_commission: hasCommission,
      commission_rate: hasCommission ? Number(formData.get('commission_rate')) : null,
    };
    onCreate(userData);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Skapa ny användare</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Fullständigt namn*</label><input type="text" name="full_name" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">E-postadress*</label><input type="email" name="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Telefonnummer</label><input type="tel" name="phone_number" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Roll*</label><select name="role" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"><option value="worker">Arbetare</option><option value="sales">Säljare</option><option value="admin">Administratör</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Adress</label><input type="text" name="address" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Stad</label><input type="text" name="city" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Postnummer</label><input type="text" name="postal_code" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Personnummer</label><input type="text" name="personnummer" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Bankkontonummer</label><input type="text" name="bank_account_number" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <div className="border-t pt-4 space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">Anställningstyp*</label><select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"><option value="hourly">Timlön</option><option value="salary">Månadslön</option></select></div>
            {employmentType === 'hourly' && <div><label className="block text-sm font-medium text-gray-700">Timlön (SEK)</label><input type="number" step="0.01" name="base_hourly_rate" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
            {employmentType === 'salary' && <div><label className="block text-sm font-medium text-gray-700">Månadslön (SEK)</label><input type="number" step="0.01" name="base_monthly_salary" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
            <div className="flex items-center"><input type="checkbox" id="has_commission" checked={hasCommission} onChange={(e) => setHasCommission(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="has_commission" className="ml-2 block text-sm text-gray-900">Har provision</label></div>
            {hasCommission && <div><label className="block text-sm font-medium text-gray-700">Provisionssats (%)</label><input type="number" step="0.01" name="commission_rate" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
          </div>
          <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium">Avbryt</button><button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{isLoading ? 'Skapar...' : 'Skapa Användare'}</button></div>
        </form>
      </div>
    </div>
  );
};

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Välj städer..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelection = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelection);
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) && !selected.includes(option)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tilldelade städer</label>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full min-h-[42px] p-2 flex flex-wrap gap-2 items-center border border-gray-300 rounded-md bg-white cursor-pointer relative">
        {selected.length > 0 ? (
          selected.map(item => (
            <span key={item} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Sök..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <ul>
            {filteredOptions.map(option => (
              <li
                key={option}
                onClick={() => toggleOption(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </li>
            ))}
            {filteredOptions.length === 0 && <li className="px-4 py-2 text-sm text-gray-500">Inga alternativ hittades.</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

function TeamManagement() {
  const { user, organisationId } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'teams' | 'members' | 'attendance' | 'payroll'>('teams');
  const [teams, setTeams] = useState<TeamWithRelations[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<any>(null);

  const handleCreateUser = async (userData: any) => {
    setFormLoading(true);
    const { error } = await createUser(userData); // createUser will invoke the Edge Function
    if (error) {
      showError('Fel vid skapande av användare', error.message);
    } else {
      success('Användare skapad!', 'Ett e-postmeddelande har skickats till användaren.');
      setShowCreateUserModal(false);
      await loadData(); // Reload all data to see the new user
    }
    setFormLoading(false);
  };


  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<TeamWithRelations | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialty: 'allmänt' as TeamSpecialty,
    team_leader_id: '',
    hourly_rate: '',
    cities: [] as string[]
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, TeamRole>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<TeamFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userEditData, setUserEditData] = useState<Partial<UserProfile>>({});

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    userId: string;
    date: Date;
  } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const [showQuickAssignModal, setShowQuickAssignModal] = useState(false);
  const [userToAssign, setUserToAssign] = useState<UserProfile | null>(null);
  const [newMemberId, setNewMemberId] = useState(''); // For the dropdown in the edit modal

  // Attendance state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  });
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Payroll state (Task 10)
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [payrollData, setPayrollData] = useState<any[] | null>(null);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedPayrollUser, setSelectedPayrollUser] = useState<UserProfile | null>(null);
  const [payrollTimeLogs, setPayrollTimeLogs] = useState<TimeLog[]>([]);
  const [payrollAdjustments, setPayrollAdjustments] = useState<PayrollAdjustment[]>([]);
  const [newAdjustment, setNewAdjustment] = useState<Partial<PayrollAdjustment>>({ type: 'bonus', amount: 0, description: '' });
  const [selectedPayrollStatus, setSelectedPayrollStatus] = useState<'pending' | 'paid'>('pending');

  useEffect(() => {
    if (activeTab === 'payroll') {
      loadPayroll();
    }
  }, [activeTab, selectedPayrollMonth]);

  const loadPayroll = async () => {
    setLoadingPayroll(true);
    try {
      const startOfMonth = `${selectedPayrollMonth}-01`;
      const endOfMonth = new Date(new Date(startOfMonth).getFullYear(), new Date(startOfMonth).getMonth() + 1, 0).toISOString().substring(0, 10);
      const userIds = allUsers.map((u: UserProfile) => u.id);

      const { data } = await getPayrollDataForPeriod(organisationId!, startOfMonth, endOfMonth, userIds);

      if (data) {
        const payrollList = allUsers.map((user: UserProfile) => {
          const timeLogs = data.timeLogs[user.id] || [];
          const adjustments = data.adjustments[user.id] || [];
          const status = data.statuses[user.id] || 'pending';

          const totalHours = timeLogs.reduce((sum, log) => {
            const start = new Date(log.start_time).getTime();
            const end = new Date(log.end_time).getTime();
            const dur = (end - start) / (1000 * 60 * 60);
            const net = Math.max(0, dur - (log.break_duration / 60));
            return sum + net;
          }, 0);

          // Use user's base hourly rate if log doesn't have one (fallback)
          const hourlyPay = timeLogs.reduce((sum, log) => sum + (log.total_amount || 0), 0);

          const adjustmentTotal = adjustments.reduce((sum, adj) => {
            return adj.type === 'deduction' ? sum - adj.amount : sum + adj.amount;
          }, 0);

          const grossSalary = (user.base_monthly_salary || 0) + hourlyPay + adjustmentTotal; // Simplified

          return {
            user,
            totalHours,
            hourlyPay,
            adjustmentTotal,
            grossSalary,
            status,
            adjustments // Included for tooltip display
          };
        });

        setPayrollData(payrollList);
      }
    } catch (err) {
      console.error(err);
      showError('Fel vid laddning av löner', 'Kunde inte hämta löneunderlag.');
    } finally {
      setLoadingPayroll(false);
    }
  };

  const openPayrollDetails = async (user: UserProfile) => {
    setSelectedPayrollUser(user);
    setShowPayrollModal(true);
    // Fetch details
    const startOfMonth = `${selectedPayrollMonth}-01`;
    const endOfMonth = new Date(new Date(startOfMonth).getFullYear(), new Date(startOfMonth).getMonth() + 1, 0).toISOString().substring(0, 10);

    const { data: logs } = await getTimeLogsForPayroll(user.id, startOfMonth, endOfMonth);
    const { data: adjs } = await getPayrollAdjustments(user.id, startOfMonth, endOfMonth);
    const { status } = await getPayrollStatus(user.id, selectedPayrollMonth);

    setPayrollTimeLogs(logs || []);
    setPayrollAdjustments(adjs || []);
    setSelectedPayrollStatus(status);
  };

  const handleTogglePaidStatus = async () => {
    if (!selectedPayrollUser) return;
    try {
      const newStatus = selectedPayrollStatus === 'pending' ? 'paid' : 'pending';
      const { error } = await updatePayrollStatus(selectedPayrollUser.id, selectedPayrollMonth, newStatus, organisationId!);

      if (error) {
        showError('Fel vid uppdatering', 'Kunde inte ändra status.');
        return;
      }

      setSelectedPayrollStatus(newStatus);
      await loadPayroll(); // Refresh list view
      success('Status uppdaterad', `Månaden markerad som ${newStatus === 'paid' ? 'utbetald' : 'ej utbetald'}.`);
    } catch (err) {
      showError('Ett fel inträffade', 'Kunde inte uppdatera status.');
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayrollUser) return;

    if (!newAdjustment.amount || Number(newAdjustment.amount) <= 0) {
      showError('Ogiltigt belopp', 'Vänligen ange ett belopp större än 0.');
      return;
    }
    if (!newAdjustment.description || newAdjustment.description.trim().length < 2) {
      showError('Beskrivning saknas', 'Vänligen ange en beskrivning för justeringen.');
      return;
    }

    try {
      const { data, error } = await addPayrollAdjustment({
        organisation_id: organisationId,
        user_id: selectedPayrollUser.id,
        amount: Number(newAdjustment.amount),
        description: newAdjustment.description,
        type: newAdjustment.type as any,
        date: new Date().toISOString().substring(0, 10)
      });

      if (error || !data) {
        showError('Fel', 'Kunde inte lägga till justering');
      } else {
        success('Sparat', 'Justering tillagd');
        setPayrollAdjustments([...payrollAdjustments, data]);
        setNewAdjustment({ type: 'bonus', amount: 0, description: '' });
        loadPayroll(); // Refresh totals
      }
    } catch (err) {
      showError('Ett fel inträffade', 'Kunde inte spara justeringen.');
    }
  };

  const handleDeleteAdjustment = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna justering?')) return;

    const { error } = await deletePayrollAdjustment(id);
    if (error) {
      showError('Fel', 'Kunde inte ta bort justeringen.');
    } else {
      success('Borttagen', 'Justeringen har tagits bort.');
      setPayrollAdjustments(payrollAdjustments.filter(a => a.id !== id));
      loadPayroll();
    }
  };


  const handleTimeLogUpdate = async (logId: string, updates: any) => {
    const { error } = await updateTimeLogApproval(logId, updates);
    if (error) {
      showError('Fel', 'Kunde inte uppdatera tidrapport');
    } else {
      success('Uppdaterad', 'Tidrapport uppdaterad');
      if (selectedPayrollUser) {
        // refresh details
        openPayrollDetails(selectedPayrollUser);
        loadPayroll();
      }
    }
  };

  const handleAddMemberToTeam = async (teamId: string, userId: string) => {
    if (!userId) {
      showError('Fel', 'Välj en medlem att lägga till.');
      return;
    }
    const result = await addTeamMember({
      team_id: teamId,
      user_id: userId,
      role_in_team: 'medarbetare', // Default role
      organisation_id: organisationId
    });

    if (result.error) {
      showError('Fel', result.error.message);
    } else {
      success('Framgång', 'Medlem tillagd i teamet!');
      await loadData(); // Refresh all data
    }
    setNewMemberId(''); // Reset dropdown
  };

  const handleRemoveMemberFromTeam = async (memberId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna medlem från teamet?')) return;

    const result = await removeTeamMember(memberId);
    if (result.error) {
      showError('Fel', result.error.message);
    } else {
      success('Framgång', 'Medlem borttagen från teamet!');
      await loadData();
      setShowDetailsModal(false); // Close details modal if open to see changes
      setShowEditModal(false);   // Close edit modal
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserEditData({ ...user }); // Pre-fill form with user data
    setShowUserEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    // updateUserProfile should be in your lib/database.ts
    const { error } = await updateUserProfile(selectedUser.id, userEditData);

    if (error) {
      showError('Fel', error.message);
    } else {
      success('Framgång', 'Användare uppdaterad!');
      setShowUserEditModal(false);
      setSelectedUser(null);
      await loadData(); // Reload all data
    }
    setFormLoading(false);
  };

  const swedishCities = [
    "Alingsås", "Arboga", "Arvika", "Askersund", "Avesta",
    "Boden", "Bollnäs", "Borgholm", "Borlänge", "Borås", "Båstad",
    "Eksjö", "Enköping", "Eskilstuna", "Eslöv",
    "Fagersta", "Falkenberg", "Falköping", "Falsterbo", "Falun", "Filipstad", "Flen",
    "Gränna", "Gävle", "Göteborg",
    "Hagfors", "Halmstad", "Haparanda", "Hedemora", "Helsingborg", "Hjo", "Hudiksvall", "Huskvarna", "Härnösand", "Hässleholm", "Höganäs",
    "Jönköping",
    "Kalmar", "Karlshamn", "Karlskoga", "Karlskrona", "Karlstad", "Katrineholm", "Kiruna", "Kramfors", "Kristianstad", "Kristinehamn", "Kumla", "Kungsbacka", "Kungälv", "Köping",
    "Laholm", "Landskrona", "Lidköping", "Lindesberg", "Linköping", "Ljungby", "Ludvika", "Luleå", "Lund", "Lycksele", "Lysekil",
    "Malmö", "Mariefred", "Mariestad", "Marstrand", "Mjölby", "Motala", "Mölndal",
    "Nora", "Norrköping", "Norrtälje", "Nybro", "Nyköping", "Nynäshamn", "Nässjö",
    "Oskarshamn", "Oxelösund",
    "Piteå",
    "Ronneby",
    "Sala", "Sandviken", "Sigtuna", "Simrishamn", "Skara", "Skellefteå", "Skänninge", "Skövde", "Sollefteå", "Stockholm", "Strängnäs", "Strömstad", "Sundsvall", "Säffle", "Säter", "Sävsjö", "Söderhamn", "Söderköping", "Södertälje", "Sölvesborg",
    "Tidaholm", "Torshälla", "Tranås", "Trelleborg", "Trollhättan", "Trosa",
    "Uddevalla", "Ulricehamn", "Umeå", "Uppsala",
    "Vadstena", "Varberg", "Vetlanda", "Vimmerby", "Visby", "Vänersborg", "Värnamo", "Västervik", "Västerås", "Växjö",
    "Ystad",
    "Åhus", "Åmål",
    "Ängelholm",
    "Örebro", "Öregrund", "Örnsköldsvik", "Östersund", "Östhammar"
  ];

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendance();
    } else {
      loadData();
    }
  }, [filters, activeTab, currentWeekStart]);

  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const startStr = toISODate(currentWeekStart);
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      const endStr = toISODate(end);

      const { data, error } = await getAttendance(organisationId, startStr, endStr);

      if (error) {
        showError('Kunde inte ladda närvaro', error.message);
        return;
      }

      const map: Record<string, AttendanceRecord> = {};
      (data || []).forEach(record => {
        map[`${record.user_id}_${record.date}`] = record;
      });
      setAttendanceData(map);
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleAttendanceUpdate = async (userId: string, date: Date, status: AttendanceStatus | null) => {
    const dateStr = toISODate(date);
    const key = `${userId}_${dateStr}`;

    const record: AttendanceRecord = {
      id: key,
      organisation_id: organisationId,
      user_id: userId,
      date: dateStr,
      status: status as AttendanceStatus
    };

    if (status === null) {
      const newAttendanceData = { ...attendanceData };
      delete newAttendanceData[key];
      setAttendanceData(newAttendanceData);
      // await deleteAttendance(key); // If exists
    } else {
      setAttendanceData(prev => ({ ...prev, [key]: record }));
      const { error } = await updateAttendance(record);
      if (error) {
        showError('Något gick fel', error.message);
      }
    }
  };

  const handleAttendanceToggle = async (userId: string, date: Date) => {
    const dateStr = toISODate(date);
    const key = `${userId}_${dateStr}`;
    // Treat undefined as null (no status)
    const currentStatus = attendanceData[key]?.status || null;

    // Find current index to determine next status
    const currentIndex = ATTENDANCE_OPTIONS.findIndex(opt => opt.value === currentStatus);
    // If not found (shouldn't happen with correct data), default to -1. 
    // If -1, next index will be 0 ('present').
    // Cycle: Present -> Sick -> Vacation -> Leave -> Absent -> Clear (null) -> Present
    const nextIndex = (currentIndex + 1) % ATTENDANCE_OPTIONS.length;
    const nextOption = ATTENDANCE_OPTIONS[nextIndex];

    await handleAttendanceUpdate(userId, date, nextOption.value);
  };


  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const changeWeek = (offset: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (offset * 7));
    setCurrentWeekStart(newStart);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsResult, usersResult, unassignedResult, statsResult] = await Promise.all([
        getTeams(organisationId, filters),
        getTeamMembers(organisationId),
        getUnassignedUsers(organisationId),
        getTeamStats(organisationId)
      ]);

      if (teamsResult.error) {
        setError(teamsResult.error.message);
        return;
      }

      if (usersResult.error) {
        setError(usersResult.error.message);
        return;
      }

      setTeams(teamsResult.data || []);
      setAllUsers(usersResult.data || []);
      setUnassignedUsers(unassignedResult.data || []);
      setTeamStats(statsResult.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Ett oväntat fel inträffade vid laddning av data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.team_leader_id) {
      showError('Fel', 'Teamnamn och teamledare är obligatoriska fält.');
      return;
    }

    try {
      setFormLoading(true);

      const teamData = {
        organisation_id: organisationId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        specialty: formData.specialty,
        team_leader_id: formData.team_leader_id,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        cities: formData.cities
      };

      const result = await createTeam(teamData, selectedMembers, memberRoles);

      if (result.error) {
        showError('Fel', result.error.message);
        return;
      }

      success('Framgång', 'Team skapat framgångsrikt!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error creating team:', err);
      showError('Fel', 'Ett oväntat fel inträffade vid skapande av team.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam || !formData.name.trim()) {
      showError('Fel', 'Teamnamn är obligatoriskt.');
      return;
    }

    try {
      setFormLoading(true);

      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        specialty: formData.specialty,
        team_leader_id: formData.team_leader_id || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        cities: formData.cities
      };

      const result = await updateTeam(selectedTeam.id, updates);

      if (result.error) {
        showError('Fel', result.error.message);
        return;
      }

      success('Framgång', 'Team uppdaterat framgångsrikt!');
      setShowEditModal(false);
      setSelectedTeam(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error updating team:', err);
      showError('Fel', 'Ett oväntat fel inträffade vid uppdatering av team.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const result = await deleteTeam(teamToDelete.id);

      if (result.error) {
        showError('Fel', result.error.message);
        return;
      }

      success('Framgång', 'Team borttaget framgångsrikt!');
      setShowDeleteDialog(false);
      setTeamToDelete(null);
      loadData();
    } catch (err) {
      console.error('Error deleting team:', err);
      showError('Fel', 'Ett oväntat fel inträffade vid borttagning av team.');
    }
  };

  const handleEditTeam = (team: TeamWithRelations) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      specialty: team.specialty,
      team_leader_id: team.team_leader_id || '',
      hourly_rate: team.hourly_rate?.toString() || '',
      cities: team.cities || []
    });
    setShowEditModal(true);
  };

  const handleMemberRoleChange = (userId: string, role: TeamRole) => {
    setMemberRoles(prev => ({ ...prev, [userId]: role }));
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );

    // Set default role if not set
    if (!memberRoles[userId]) {
      setMemberRoles(prev => ({ ...prev, [userId]: 'medarbetare' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      specialty: 'allmänt',
      team_leader_id: '',
      hourly_rate: '',
      cities: []
    });
    setSelectedMembers([]);
    setMemberRoles({});
  };

  const getSpecialtyIcon = (specialty: TeamSpecialty) => {
    switch (specialty) {
      case 'fönsterputsning': return '🪟';
      case 'taktvätt': return '🏠';
      case 'fasadtvätt': return '🏢';
      case 'allmänt': return '🔧';
      case 'övrigt': return '⚡';
      default: return '🔧';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-500">Laddar...</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Laddar team och medlemmar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-10 h-10 text-red-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Kunde inte ladda team-data</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="ml-auto inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
            <Users2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-500">
              {teams.length} team • {allUsers.length} medarbetare
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={() => setShowCreateUserModal(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Skapa Användare
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Skapa Nytt Team
          </Button>
        </div>
      </div>

      {/* Team Statistics */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Totalt Team</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalTeams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktiva Team</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.activeTeams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Totalt Medlemmar</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Genomsnittlig Storlek</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.averageTeamSize}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'teams', label: 'Alla Team', icon: Users2 },
            { id: 'members', label: 'Teammedlemmar', icon: User },
            { id: 'attendance', label: 'Närvaro & Rapport', icon: CalendarDays }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sök</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sök team..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialitet</label>
              <select
                value={filters.specialty || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Alla specialiteter</option>
                {Object.entries(TEAM_SPECIALTY_LABELS).map(([specialty, label]) => (
                  <option key={specialty} value={specialty}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Rensa filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-4">
              <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vecka {Math.ceil((currentWeekStart.getDate() - 1) / 7) /* Rough week num */}
                  <span className="text-sm font-normal text-gray-500 block">
                    {formatDate(currentWeekStart)} - {formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
                  </span>
                </h3>
              </div>
              <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm mr-4">
                <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></span><span>Närvarande</span>
                <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></span><span>Sjuk</span>
                <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></span><span>Semester</span>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FileText className="w-4 h-4 mr-2" />
                Generera Rapport
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] sticky left-0 bg-gray-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Medarbetare
                  </th>
                  {getWeekDays().map(day => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <th key={day.toISOString()} scope="col" className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${isToday ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-500' : ''}`}>
                        <div>{['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'][day.getDay()]}</div>
                        <div className={isToday ? 'text-blue-600' : 'text-gray-400'}>{day.getDate()}</div>
                      </th>
                    )
                  })}
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Summering
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => {
                  // Calculate summary stats
                  const presenceCount = getWeekDays().reduce((acc, day) => {
                    const key = `${user.id}_${formatDate(day)}`;
                    return acc + (attendanceData[key]?.status === 'present' ? 1 : 0);
                  }, 0);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-xs text-gray-500">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      {getWeekDays().map(day => {
                        const dateStr = formatDate(day);
                        const key = `${user.id}_${dateStr}`;
                        const status = attendanceData[key]?.status || null;
                        const statusConfig = ATTENDANCE_OPTIONS.find(opt => opt.value === status) || ATTENDANCE_OPTIONS[ATTENDANCE_OPTIONS.length - 1];

                        let bgColor = statusConfig?.bgColor || 'bg-gray-50';
                        let textColor = statusConfig?.color || 'text-gray-400';
                        let text = statusConfig?.label || '-';
                        const isToday = day.toDateString() === new Date().toDateString();

                        if (status === 'present') {
                          bgColor = 'bg-green-100 hover:bg-green-200';
                        } else if (status === 'sick') {
                          bgColor = 'bg-red-100 hover:bg-red-200';
                        } else if (status === 'vacation') {
                          bgColor = 'bg-yellow-100 hover:bg-yellow-200';
                        } else if (status === 'leave') {
                          bgColor = 'bg-blue-100 hover:bg-blue-200';
                        } else if (status === 'absent') {
                          bgColor = 'bg-gray-200 hover:bg-gray-300';
                        } else {
                          bgColor = 'bg-gray-50 hover:bg-gray-100';
                        }

                        // Add today highlight to cell background if no status
                        if (isToday && !status) {
                          bgColor = 'bg-blue-50/50 hover:bg-blue-100/50';
                        }


                        return (
                          <td key={dateStr} className={`px-1 py-1 text-center p-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <button
                              onClick={() => handleAttendanceToggle(user.id, day)}
                              onContextMenu={(e: React.MouseEvent) => {
                                e.preventDefault();
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  userId: user.id,
                                  date: day
                                });
                              }}
                              className={`w-full h-12 m-1 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${bgColor} ${textColor} ${isToday ? 'ring-1 ring-blue-200' : ''}`}
                              title={text}
                            >
                              {status && statusConfig ? statusConfig.label.charAt(0) : '-'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {presenceCount} dagar
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>


          {/* Context Menu */}
          {
            contextMenu && (
              <div
                ref={contextMenuRef}
                className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden w-48"
                style={{ top: contextMenu.y, left: contextMenu.x }}
              >
                <div className="py-1">
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        handleAttendanceUpdate(contextMenu.userId, contextMenu.date, option.value);
                        setContextMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${option.bgColor.replace('bg-', 'bg-').replace('100', '400').replace('white', 'gray-200')} border border-gray-300`}></div>
                      <span className={`text-sm ${option.color}`}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      )}

      {/* Teams Tab */}
      {
        activeTab === 'teams' && (
          <div className="space-y-6">
            {teams.length === 0 ? (
              <EmptyState
                type="general"
                title="Inga team ännu"
                description="Skapa ditt första team för att organisera medarbetare efter specialitet och projekt."
                actionText="Skapa Nytt Team"
                onAction={() => setShowCreateModal(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team: TeamWithRelations) => (
                  <div key={team.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Team Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getSpecialtyIcon(team.specialty)}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTeamSpecialtyColor(team.specialty)}`}>
                              {TEAM_SPECIALTY_LABELS[team.specialty]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTeamToDelete(team);
                              setShowDeleteDialog(true);
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Team Description */}
                      {team.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>
                      )}

                      {/* Team Leader */}
                      {team.team_leader && (
                        <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
                          <Crown className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{team.team_leader.full_name}</p>
                            <p className="text-xs text-gray-500">Teamledare</p>
                          </div>
                        </div>
                      )}

                      {/* Team Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{team.member_count || 0}</p>
                          <p className="text-xs text-gray-500">Medlemmar</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{team.active_jobs_count || 0}</p>
                          <p className="text-xs text-gray-500">Aktiva Jobb</p>
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      {team.hourly_rate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Timtaxa:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(team.hourly_rate)}/tim</span>
                        </div>
                      )}

                      {/* Team Members Preview */}
                      {team.members && team.members.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Medlemmar</span>
                            <button
                              onClick={() => {
                                setSelectedTeam(team);
                                setShowDetailsModal(true);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Visa alla
                            </button>
                          </div>
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 4).map((member) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                title={member.user?.full_name}
                              >
                                {member.user?.full_name?.charAt(0) || 'U'}
                              </div>
                            ))}
                            {team.members.length > 4 && (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                                +{team.members.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      {/* Team Members Tab */}
      {
        activeTab === 'members' && (
          <div className="space-y-6">
            {/* Unassigned Users */}
            {unassignedUsers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Ej tilldelade användare ({unassignedUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unassignedUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg p-4 border border-yellow-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setUserToAssign(user);
                            setShowQuickAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Tilldela till team"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Team Members */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Alla teammedlemmar</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medlem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll i Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gick med
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Åtgärder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams.flatMap(team =>
                      (team.members || []).map(member => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                                {member.user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.user?.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{getSpecialtyIcon(team.specialty)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTeamSpecialtyColor(team.specialty)
                                  }`}>
                                  {TEAM_SPECIALTY_LABELS[team.specialty] || team.specialty}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTeamRoleColor(member.role_in_team)}`}>
                              {TEAM_ROLE_LABELS[member.role_in_team]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(member.joined_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {member.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewUser(member.user)}
                                className="text-gray-400 hover:text-indigo-600"
                                title="Visa detaljer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditUser(member.user)}
                                className="text-gray-400 hover:text-blue-600"
                                title="Redigera användare"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // Remove from team functionality
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Ta bort från team"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Löner & Tidrapporter</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="month"
                  value={selectedPayrollMonth}
                  onChange={(e) => setSelectedPayrollMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <button onClick={loadPayroll} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Uppdatera">
                  <Activity className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loadingPayroll ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anställd</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timmar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lön (Tid)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justeringar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Totalt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payrollData && payrollData.map((row) => (
                        <tr key={row.user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{row.user.full_name}</div>
                            <div className="text-gray-500 text-sm">{row.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{row.user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.totalHours?.toFixed(1)} h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.hourlyPay)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm cursor-help ${row.adjustmentTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            title={row.adjustments && row.adjustments.length > 0
                              ? row.adjustments.map((a: any) => `${a.description}: ${a.type === 'deduction' ? '-' : '+'}${a.amount}kr`).join('\n')
                              : 'Inga justeringar'}
                          >
                            <div className="flex items-center">
                              {row.adjustmentTotal > 0 ? '+' : ''}{formatCurrency(row.adjustmentTotal)}
                              {row.adjustments && row.adjustments.length > 0 && (
                                <FileText className="w-3 h-3 ml-1.5 opacity-50" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(row.grossSalary)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {row.status === 'paid' ? 'Utbetald' : 'Ej utbetald'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openPayrollDetails(row.user)}
                              className="text-blue-600 hover:text-blue-900 font-medium flex items-center justify-end"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Hantera
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!payrollData || payrollData.length === 0) && (
                        <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">Ingen löneinformation hittades för denna period</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )
              }
            </div>
          </div>
        )}

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreate={handleCreateUser}
        isLoading={formLoading}
        organisationId={organisationId}
      />

      {/* User Details Modal */}
      {
        showUserDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.full_name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                <button onClick={() => setShowUserDetailsModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Kontakt & Information</h4>
                    <div className="text-sm space-y-2 border-l-2 border-gray-200 pl-4">
                      <p><strong className="text-gray-600 w-24 inline-block">Roll:</strong> {selectedUser.role}</p>
                      <p><strong className="text-gray-600 w-24 inline-block">Telefon:</strong> {selectedUser.phone_number || 'Ej angivet'}</p>
                      <p><strong className="text-gray-600 w-24 inline-block">Personnr:</strong> {selectedUser.personnummer || 'Ej angivet'}</p>
                      <p><strong className="text-gray-600 w-24 inline-block">Status:</strong>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedUser.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Adress</h4>
                    <div className="text-sm space-y-2 border-l-2 border-gray-200 pl-4">
                      <p>{selectedUser.address || 'Ingen adress angiven'}</p>
                      <p>{selectedUser.postal_code} {selectedUser.city}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Anställning & Lön</h4>
                    <div className="text-sm space-y-2 border-l-2 border-gray-200 pl-4">
                      <p><strong className="text-gray-600 w-28 inline-block">Anst. typ:</strong> {selectedUser.employment_type === 'hourly' ? 'Timlön' : 'Månadslön'}</p>
                      {selectedUser.employment_type === 'hourly' && <p><strong className="text-gray-600 w-28 inline-block">Timlön:</strong> {formatCurrency(selectedUser.base_hourly_rate || 0)}</p>}
                      {selectedUser.employment_type === 'salary' && <p><strong className="text-gray-600 w-28 inline-block">Månadslön:</strong> {formatCurrency(selectedUser.base_monthly_salary || 0)}</p>}
                      <p><strong className="text-gray-600 w-28 inline-block">Provision:</strong> {selectedUser.has_commission ? `Ja (${selectedUser.commission_rate || 0}%)` : 'Nej'}</p>
                      <p><strong className="text-gray-600 w-28 inline-block">Bankkonto:</strong> {selectedUser.bank_account_number || 'Ej angivet'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button onClick={() => setShowUserDetailsModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">Stäng</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Quick Assign Modal */}
      {
        showQuickAssignModal && userToAssign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Tilldela {userToAssign.full_name}</h3>
                <button onClick={() => setShowQuickAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700">Välj ett team att tilldela till:</label>
                <select
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Välj team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t">
                <button type="button" onClick={() => setShowQuickAssignModal(false)} className="px-4 py-2 border rounded-md text-sm">Avbryt</button>
                <button
                  onClick={() => {
                    handleAddMemberToTeam(newMemberId, userToAssign.id);
                    setShowQuickAssignModal(false);
                  }}
                  disabled={!newMemberId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
                >
                  Tilldela
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* User Edit Modal */}
      {
        showUserEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Redigera {selectedUser.full_name}</h3>
                <button onClick={() => setShowUserEditModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Fullständigt namn*</label><input type="text" value={userEditData.full_name || ''} onChange={e => setUserEditData(p => ({ ...p, full_name: e.target.value }))} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">E-post (kan ej ändras)</label><input type="email" value={userEditData.email || ''} disabled className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Telefonnummer</label><input type="tel" value={userEditData.phone_number || ''} onChange={e => setUserEditData(p => ({ ...p, phone_number: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Personnummer</label><input type="text" value={userEditData.personnummer || ''} onChange={e => setUserEditData(p => ({ ...p, personnummer: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Adress</label><input type="text" value={userEditData.address || ''} onChange={e => setUserEditData(p => ({ ...p, address: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Stad</label><input type="text" value={userEditData.city || ''} onChange={e => setUserEditData(p => ({ ...p, city: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Postnummer</label><input type="text" value={userEditData.postal_code || ''} onChange={e => setUserEditData(p => ({ ...p, postal_code: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                  </div>
                  {/* City Assignment */}
                  <div className="border-t border-gray-200 pt-6">
                    <MultiSelectDropdown
                      options={swedishCities}
                      selected={userEditData.cities || []}
                      onChange={(cities) => setUserEditData(p => ({ ...p, cities }))}
                      placeholder="Välj arbetstäder..."
                    />
                  </div>

                  {/* Employment & Role */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700">Roll*</label><select value={userEditData.role || ''} onChange={e => setUserEditData(p => ({ ...p, role: e.target.value as UserRole }))} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"><option value="worker">Arbetare</option><option value="sales">Säljare</option><option value="admin">Administratör</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700">Anställningstyp*</label><select value={userEditData.employment_type || ''} onChange={e => setUserEditData(p => ({ ...p, employment_type: e.target.value as EmploymentType }))} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"><option value="hourly">Timlön</option><option value="salary">Månadslön</option></select></div>
                      {userEditData.employment_type === 'hourly' && <div><label className="block text-sm font-medium text-gray-700">Timlön (SEK)</label><input type="number" step="0.01" value={userEditData.base_hourly_rate || ''} onChange={e => setUserEditData(p => ({ ...p, base_hourly_rate: Number(e.target.value) }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
                      {userEditData.employment_type === 'salary' && <div><label className="block text-sm font-medium text-gray-700">Månadslön (SEK)</label><input type="number" step="0.01" value={userEditData.base_monthly_salary || ''} onChange={e => setUserEditData(p => ({ ...p, base_monthly_salary: Number(e.target.value) }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
                    </div>
                    <div className="flex items-center"><input type="checkbox" id="is_active_edit" checked={userEditData.is_active || false} onChange={e => setUserEditData(p => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-900">Användarkonto är aktivt</label></div>
                  </div>

                  {/* Commission & Bank */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700">Bankkontonummer</label><input type="text" value={userEditData.bank_account_number || ''} onChange={e => setUserEditData(p => ({ ...p, bank_account_number: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    </div>
                    <div className="flex items-center"><input type="checkbox" id="has_commission_edit" checked={userEditData.has_commission || false} onChange={e => setUserEditData(p => ({ ...p, has_commission: e.target.checked }))} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="has_commission_edit" className="ml-2 block text-sm text-gray-900">Har provision</label></div>
                    {userEditData.has_commission && <div><label className="block text-sm font-medium text-gray-700">Provisionssats (%)</label><input type="number" step="0.01" value={userEditData.commission_rate || ''} onChange={e => setUserEditData(p => ({ ...p, commission_rate: Number(e.target.value) }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>}
                  </div>

                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                  <button type="button" onClick={() => setShowUserEditModal(false)} className="px-4 py-2 border rounded-md text-sm">Avbryt</button>
                  <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50 flex items-center">
                    {formLoading ? <><Loader2 className="w-4 h-4 animate-spin text-white" /><span className="ml-2">Sparar...</span></> : 'Spara ändringar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Create Team Modal */}
      {
        showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Skapa nytt team</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Teaminformation</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teamnamn *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="T.ex. Fönsterputsningsexperten"
                      />
                    </div>

                    <MultiSelectDropdown
                      options={swedishCities}
                      selected={formData.cities}
                      onChange={(cities) => setFormData(prev => ({ ...prev, cities }))}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beskrivning
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Specialiserat team för komplexa fönsterputsningsjobb"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialitet *
                        </label>
                        <select
                          required
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value as TeamSpecialty }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(TEAM_SPECIALTY_LABELS).map(([specialty, label]) => (
                            <option key={specialty} value={specialty}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timtaxa (SEK)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="500.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teamledare *
                      </label>
                      <select
                        required
                        value={formData.team_leader_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, team_leader_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Välj teamledare...</option>
                        {allUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Member Selection */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Välj teammedlemmar</h4>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      {allUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Inga användare tillgängliga</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {allUsers.map((user) => (
                            <div key={user.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(user.id)}
                                    onChange={() => toggleMemberSelection(user.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {user.full_name?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </div>

                                {selectedMembers.includes(user.id) && (
                                  <select
                                    value={memberRoles[user.id] || 'medarbetare'}
                                    onChange={(e) => handleMemberRoleChange(user.id, e.target.value as TeamRole)}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {Object.entries(TEAM_ROLE_LABELS).map(([role, label]) => (
                                      <option key={role} value={role}>{label}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Members Preview */}
                    {selectedMembers.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-2">
                          Valda medlemmar ({selectedMembers.length})
                        </h5>
                        <div className="space-y-2">
                          {selectedMembers.map(userId => {
                            const user = allUsers.find(u => u.id === userId);
                            const role = memberRoles[userId] || 'medarbetare';
                            return (
                              <div key={userId} className="flex items-center justify-between text-sm">
                                <span className="text-blue-900">{user?.full_name}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTeamRoleColor(role)}`}>
                                  {TEAM_ROLE_LABELS[role]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="ml-2">Skapar...</span>
                      </div>
                    ) : (
                      'Skapa Team'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Edit Team Modal */}
      {
        showEditModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Redigera team</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teamnamn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Hantera Medlemmar</h4>

                  {/* List of current members */}
                  <div className="space-y-2 mb-4">
                    {(selectedTeam?.members || []).map(member => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium">{member.user?.full_name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromTeam(member.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Ta bort från team"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new member */}
                  {unassignedUsers.length > 0 && (
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700">Lägg till medlem</label>
                        <select
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Välj...</option>
                          {unassignedUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddMemberToTeam(selectedTeam.id, newMemberId)}
                        disabled={!newMemberId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm h-10 disabled:opacity-50"
                      >
                        Lägg till
                      </button>
                    </div>
                  )}
                </div>

                <MultiSelectDropdown
                  options={swedishCities}
                  selected={formData.cities}
                  onChange={(cities) => setFormData(prev => ({ ...prev, cities }))}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialitet *
                    </label>
                    <select
                      required
                      value={formData.specialty}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value as TeamSpecialty }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(TEAM_SPECIALTY_LABELS).map(([specialty, label]) => (
                        <option key={specialty} value={specialty}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timtaxa (SEK)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teamledare
                  </label>
                  <select
                    value={formData.team_leader_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_leader_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Ingen teamledare</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTeam(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="ml-2">Sparar...</span>
                      </div>
                    ) : (
                      'Spara Ändringar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Team Details Modal */}
      {
        showDetailsModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-2xl mr-3">{getSpecialtyIcon(selectedTeam.specialty)}</span>
                    {selectedTeam.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTeamSpecialtyColor(selectedTeam.specialty)}`}>
                    {TEAM_SPECIALTY_LABELS[selectedTeam.specialty]}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Teaminformation</h4>
                    <div className="space-y-3">
                      {selectedTeam.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Beskrivning:</span>
                          <p className="text-sm text-gray-900">{selectedTeam.description}</p>
                        </div>
                      )}

                      {selectedTeam.cities && selectedTeam.cities.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 flex items-center mb-2">
                            <MapPin size={14} className="mr-2" />
                            Aktiva städer:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeam.cities.map(city => (
                              <span key={city} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                {city}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTeam.hourly_rate && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Timtaxa:</span>
                          <p className="text-sm text-gray-900">{formatCurrency(selectedTeam.hourly_rate)}/tim</p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm font-medium text-gray-500">Skapat:</span>
                        <p className="text-sm text-gray-900">{formatDate(selectedTeam.created_at)}</p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">Aktiva jobb:</span>
                        <p className="text-sm text-gray-900">{selectedTeam.active_jobs_count || 0}</p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">Slutförda jobb:</span>
                        <p className="text-sm text-gray-900">{selectedTeam.completed_jobs_count || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Teammedlemmar</h4>
                    {selectedTeam.members && selectedTeam.members.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTeam.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                                {member.user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {member.user?.full_name}
                                  {member.user_id === selectedTeam.team_leader_id && (
                                    <Crown className="w-4 h-4 inline ml-2 text-yellow-600" />
                                  )}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTeamRoleColor(member.role_in_team)}`}>
                                    {TEAM_ROLE_LABELS[member.role_in_team]}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Sedan {formatDate(member.joined_date)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {member.user?.phone_number && (
                                <a
                                  href={`tel:${member.user.phone_number}`}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Ring"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                              {member.user?.email && (
                                <a
                                  href={`mailto:${member.user.email}`}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="E-post"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Inga medlemmar i detta team</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Payroll Modal */}
      {
        showPayrollModal && selectedPayrollUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lönespecifikation: {selectedPayrollUser.full_name}</h3>
                  <p className="text-sm text-gray-500">Period: {selectedPayrollMonth}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleTogglePaidStatus}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${selectedPayrollStatus === 'paid'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                  >
                    {selectedPayrollStatus === 'paid' ? 'Utbetald ✅' : 'Markera som utbetald'}
                  </button>
                  <button onClick={() => setShowPayrollModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center"><Clock className="w-4 h-4 mr-2" /> Tidrapporter</h4>
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Datum</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Start</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Slut</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rast (min)</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Summa</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Åtgärd</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payrollTimeLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{log.start_time.split('T')[0]}</td>
                            <td className="px-4 py-2 text-sm">
                              <input
                                type="time"
                                defaultValue={log.start_time.split('T')[1].substring(0, 5)}
                                onBlur={(e) => {
                                  const date = log.start_time.split('T')[0];
                                  handleTimeLogUpdate(log.id, { start_time: `${date}T${e.target.value}:00` });
                                }}
                                className="w-24 border-gray-300 rounded-md text-sm p-1"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <input
                                type="time"
                                defaultValue={log.end_time ? log.end_time.split('T')[1].substring(0, 5) : ''}
                                onBlur={(e) => {
                                  const date = log.start_time.split('T')[0];
                                  handleTimeLogUpdate(log.id, { end_time: `${date}T${e.target.value}:00` });
                                }}
                                className="w-24 border-gray-300 rounded-md text-sm p-1"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <input
                                type="number"
                                defaultValue={log.break_duration}
                                onBlur={(e) => handleTimeLogUpdate(log.id, { break_duration: Number(e.target.value) })}
                                className="w-16 border-gray-300 rounded-md text-sm p-1"
                              />
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900 font-medium">
                              {formatCurrency(log.total_amount || 0)}
                            </td>
                            <td className="px-4 py-2 text-right text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 inline" title="Sparad" />
                            </td>
                          </tr>
                        ))}
                        {payrollTimeLogs.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500 italic">Inga tidrapporter för denna period</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Justeringar & Utlägg</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      {payrollAdjustments.map(adj => (
                        <div key={adj.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300">
                          <div>
                            <div className="font-medium text-gray-900">{adj.description}</div>
                            <div className="text-xs text-gray-500 capitalize">{adj.type} - {adj.date}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`font-bold ${adj.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                              {adj.type === 'deduction' ? '-' : '+'}{formatCurrency(adj.amount)}
                            </span>
                            <button onClick={() => handleDeleteAdjustment(adj.id)} className="text-gray-400 hover:text-red-600 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {payrollAdjustments.length === 0 && <p className="text-gray-500 text-sm italic py-4">Inga justeringar registrerade.</p>}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-fit">
                      <h5 className="font-medium text-sm text-gray-900 mb-3">Lägg till justering</h5>
                      <form onSubmit={handleAdjustmentSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Typ</label>
                          <select
                            value={newAdjustment.type}
                            onChange={e => setNewAdjustment({ ...newAdjustment, type: e.target.value as any })}
                            className="mt-1 w-full text-sm border-gray-300 rounded-md"
                          >
                            <option value="bonus">Bonus</option>
                            <option value="deduction">Avdrag</option>
                            <option value="expense">Utlägg</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Belopp</label>
                          <input
                            type="number"
                            value={newAdjustment.amount}
                            onChange={e => setNewAdjustment({ ...newAdjustment, amount: Number(e.target.value) })}
                            className="mt-1 w-full text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Beskrivning</label>
                          <input
                            type="text"
                            value={newAdjustment.description}
                            onChange={e => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
                            className="mt-1 w-full text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                          Lägg till
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setTeamToDelete(null);
        }}
        onConfirm={handleDeleteTeam}
        title="Ta bort team"
        message={`Är du säker på att du vill ta bort teamet "${teamToDelete?.name}"? Alla medlemmar kommer att bli ej tilldelade.`}
        confirmText="Ta bort"
        cancelText="Avbryt"
        type="danger"
      />
    </div>
  );
}

export default TeamManagement;