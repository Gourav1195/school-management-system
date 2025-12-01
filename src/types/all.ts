// Enums
export enum Plan {
  Free = "Free",
  Premium = "Premium",
}
 
export enum Role {
  Admin = "Admin",
  Moderator = "Moderator",
  Editor = "Editor",
  Viewer = "Viewer",
  Finance = "Finance",
}

// Models
export interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  users: User[];
  createdAt: Date;
  groups: Group[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
  tenantId: string;
  groupId?: string | null;
  tenant?: Tenant;
  group?: Group | null;
  attendance?: Attendance[];
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Group {
  id: string;
  name: string;
  tenantId: string;
  tenant: Tenant;
  criteria?: string | null;
  members: Member[];
  users: User[];
  attendance: Attendance[];
  type: 'FEE' |  'SALARY' | 'BOTH'
  groupSalary?: number      
  groupFee?: number     
}

export interface Member {
  id: string;
  memberNo:number;
  tenantId: string;
  balance?: number;
  customFee?: number | null;
  customSalary?: number | null;
  feeStructures?: string[] | null;
  salaryStructures?: string[] | null;
  tenant?: Tenant;
  name: string;
  email: string;
  joiningDate: string;
  phoneNo?: string | null;
  gender?: string | null;
  special?: string | null;
  criteriaVal?: boolean | null;
  groupId?: string | null;
  group?: Group | null;
  attendance: Attendance[];
  attendanceRecords: AttendanceRecord[];
}

export interface Attendance {
  id: string;
  groupId: string;
  group: Group;
  date: Date;
  records: AttendanceRecord[];
  tenantId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User | null;
  userId?: string | null;
  member?: Member | null;
  memberId?: string | null;
}

export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  attendance: Attendance;
  memberId: string;
  member: Member;
  present: boolean;
}

export interface DeleteModalProps {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    title?: string;
    message?: string;
    btntxt?: string;
    icon?: DynamicIconProps;
    color?: string;
  }
  
  export interface DynamicIconProps {
    type: 'delete' | 'success' | 'error' | 'cancel' | 'warning';
    // Optional
    sx?: object;
  }

  export type DropDownKey = 'daily' | 'weekly' | 'monthly' | 'yearly'

  export interface GroupFormData {
    name: string,
    criteria?: string,
    groupSalary?: number,
    groupFee?: number,
    feeMode: 'Group' | 'Member',
    salaryMode: 'Group' | 'Member',
    type: 'FEE' | 'SALARY',
    subjectId: string[]
  }

export type Subject = { id?: string; name: string, code: string };

type features = {
  whatsapp: number;
  ai: number;
  bills: string;
  groups: string;
}

export type PaidPlan = {
  label: string;
  code: '6M' | '12M' | '24M';
  actualPrice: number;
  monthlyPrice: number;
  popular: boolean;
  features: features
}
