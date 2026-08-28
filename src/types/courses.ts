/**
 * Concordia Open Data course rows.
 *
 * Every field the API returns is a string, including the numeric ones — the
 * shapes below mirror that rather than pretending otherwise, and parsing
 * happens at the edge where the value is used.
 *
 * @see docs/CONCORDIA_OPEN_DATA_DATA_SHAPES.md
 */

/** `GET course/catalog/filter/{subject}/{catalog}/{career}` */
export type CourseCatalogRow = {
  /** 6-digit course id — the key every other course endpoint wants. */
  ID: string;
  title: string;
  subject: string;
  catalog: string;
  /** UGRD | GRAD | CCCE | PDEV */
  career: string;
  /** Credits, as a decimal string: "3.00". */
  classUnit: string;
  prerequisites: string;
  crosslisted: string | null;
};

/** `GET course/description/filter/{courseID}` */
export type CourseDescriptionRow = {
  ID: string;
  /** Long calendar text; newlines are meaningful. */
  description: string;
};

/** `GET course/section/filter/{subject}/{catalog}` */
export type CourseSectionRow = {
  term: string;
  session: string;
  overallEnrollCapacity: string;
  overallEnrollments: string;
  overallWaitlistCapacity: string;
  /** API spelling — not a typo on our side. */
  overallWaitlisTotal: string;
  subject: string;
  catalog: string;
  section: string;
  /** LEC, TUT, LAB */
  components: string;
  classNumber: string;
  classEnrollCapacity: string;
  classEnrollments: string;
  classWaitlistCapacity: string;
  classWaitlistTotal: string;
};

/** What the detail screen actually needs, resolved and parsed. */
export type CourseDetail = {
  courseId: string;
  title: string;
  subject: string;
  catalog: string;
  description: string | null;
  /** Parsed from `classUnit`; null when the API gives something unparseable. */
  credits: number | null;
  /** Null when the course lists none — the API returns "" in that case. */
  prerequisites: string | null;
  crosslisted: string | null;
  enrolment: CourseEnrolment | null;
};

export type CourseEnrolment = {
  enrolled: number;
  capacity: number;
  waitlisted: number;
};
