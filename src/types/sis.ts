export type SisScheduleClass = {
  INSTRUCTION_MODE: 'E' | 'O' | 'W' | string;
  SUBJECT: string;
  CATALOG_NBR: string;
  CLASS_SECTION: string;
  SSR_COMPONENT: string;
  DAY_OF_WEEK: string;
  START_HOURS: string;
  START_MINUTES: string;
  END_HOURS: string;
  END_MINUTES: string;
  EXPR20_20?: string;
  ROOM: string;
  ACAD_CAREER: string;
  XLATLONGNAME: string;
  INSTR_NAME: string;
  CU_BLDG?: string;
  CU_BUILDING?: string;
  START_DT?: string;
  END_DT?: string;
};

export type ScheduleResponse = {
  scheduleList?: SisScheduleClass[];
  errorMessage?: string;
};

export type GradeRow = {
  DESCR: string;
  CLASS: string;
  GRADE: string;
};

export type GradeListResponse = {
  gradeList?: GradeRow[];
  errorMessage?: string;
};

export type GpaRow = {
  ACAD_CAREER: string;
  DIPLOMA_DESCR: string;
  PROG_STATUS: string;
  GPA_TYPE_SHOWN: string;
  GPA: string;
};

export type GpaListResponse = {
  gpaList?: GpaRow[];
  errorMessage?: string;
};

export type TutAccountRow = {
  TERM_DESCR: string;
  EXPR1_1: string;
  AMOUNT: number;
};

export type TutAccountResponse = {
  tutAccountList?: TutAccountRow[];
  errorMessage?: string;
};

export type GradesEndpointType = 'StudCurrentGradeList' | 'StudGradeList' | 'StudGPA';
