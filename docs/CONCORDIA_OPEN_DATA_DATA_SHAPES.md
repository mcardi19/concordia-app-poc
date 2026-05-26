# Concordia Open Data — data shapes for design & implementation

Use this file as context for **Claude Design**, Figma specs, or UI copy so screens match **real API fields**.  
Source of truth: [opendataConcordiaU/documentation](https://github.com/opendataConcordiaU/documentation/tree/master).  
**Base URL:** `https://opendata.concordia.ca/API/v1/` (append paths below).  
**Auth:** HTTP Basic (portal User + Key).

### Conventions (important for mock data)

- Responses are **JSON**. Many fields are documented as numbers/booleans but arrive as **strings** (`"72"`, `"Y"`/`"N"`). Design labels and tables should allow **string display** and optional formatting in code.
- Wildcard `*` is allowed in many **course** filter path segments unless noted.
- Field names below follow the **API** (including historical typos like `deparmentCode` on faculty, `modays` in some schedule examples).

---

## Courses (SIS, daily)

### `GET course/catalog/filter/{subject}/{catalog}/{career}`

| Path param   | Description |
| ------------ | ----------- |
| `subject`    | 4-letter code (e.g. `BIOL`) or `*` |
| `catalog`    | 3–4 char catalog # or `*` |
| `career`     | `UGRD`, `GRAD`, etc., or `*` |

**Array item shape:**

```ts
type CourseCatalogRow = {
  ID: string; // 6-digit course id
  title: string;
  subject: string;
  catalog: string;
  career: string; // UGRD | GRAD | CCCE | PDEV
  classUnit: string; // decimal as string e.g. "3.00"
  prerequisites: string;
  crosslisted: string | null;
};
```

---

### `GET course/description/filter/{courseID}`

| Path param | Description        |
| ---------- | ------------------ |
| `courseID` | 6-digit id or `*` |

**Array item:**

```ts
type CourseDescriptionRow = {
  ID: string;
  description: string; // long text, newlines allowed
};
```

---

### `GET course/section/filter/{subject}/{catalog}`

**Array item:**

```ts
type CourseSectionRow = {
  term: string;
  session: string;
  overallEnrollCapacity: string;
  overallEnrollments: string;
  overallWaitlistCapacity: string;
  overallWaitlisTotal: string; // API spelling in examples
  subject: string;
  catalog: string;
  section: string;
  components: string; // LEC, TUT, LAB
  classNumber: string;
  classEnrollCapacity: string;
  classEnrollments: string;
  classWaitlistCapacity: string;
  classWaitlistTotal: string;
};
```

---

### `GET course/schedule/filter/{courseId}/{subject}/{catalog}`

Same **field set** as **Course schedule term** (below). Use for drill-down by course id + subject + catalog.

**Array item (representative; many fields are strings in practice):**

```ts
type CourseScheduleRow = {
  courseID: string;
  termCode: string;
  session: string;
  subject: string;
  catalog: string;
  section: string;
  componentCode: string;
  componentDescription: string;
  classNumber: string;
  classAssociation: string;
  courseTitle: string;
  topicID: string;
  topicDescription: string;
  classStatus: string; // e.g. "Active"
  locationCode: string; // SGW | LOY | ONL | PI
  instructionModeCode: string; // B | OL | P
  instructionModeDescription: string;
  meetingPatternNumber: string;
  roomCode: string;
  buildingCode: string;
  room: string;
  classStartTime: string; // e.g. "18.30.00"
  classEndTime: string;
  mondays: string; // examples sometimes show key "modays" — verify live API
  tuesdays: string;
  wednesdays: string;
  thursdays: string;
  fridays: string;
  saturdays: string;
  sundays: string;
  classStartDate: string; // e.g. "DD/MM/YYYY"
  classEndDate: string;
  career: string;
  departmentCode: string;
  departmentDescription: string;
  facultyCode: string;
  facultyDescription: string;
  enrollmentCapacity: string;
  currentEnrollment: string;
  waitlistCapacity: string;
  currentWaitlistTotal: string;
  hasSeatReserved: string;
};
```

**Design notes:** `locationCode` drives campus badge; `roomCode` / `buildingCode` / `room` for map links; day columns are one row per meeting pattern.

---

### `GET course/session/filter/{career}/{termcode}/{sessioncode}`

**Array item:**

```ts
type CourseSessionRow = {
  career: string;
  termCode: string;
  termDescription: string;
  sessionCode: string;
  sessionDescription: string;
  sessionBeginDate: string;
  sessionEndDate: string;
};
```

---

### `GET course/faculty/filter/{facultyCode}/{departmentCode}`

**Array item (API field names):**

```ts
type CourseFacultyRow = {
  facultyCode: string;
  facultyDescription: string;
  deparmentCode: string; // spelling as in API
  deparmentDescription: string;
};
```

---

### `GET course/exle/filter/{ids|}/{faculty}/{department}/{program}/{degree}/{type}/{orderby}/{offset}/{count}`

Long filter path; all segments may be `*`. `id(s)` can be pipe-separated e.g. `GCS_12|GCS_522`.

**Array item:**

```ts
type ExperientialLearningRow = {
  KeyID: string;
  Faculty: string;
  Department: string;
  Program: string;
  Level: string;
  Degree: string;
  Course_code: string | null;
  Course_number: string | null;
  Title: string;
  Description: string;
  Metadata: string;
  Type: string;
  Website: string | null;
};
```

---

### `GET course/scheduleTerm/filter/{subject}/{termcode}`

**Same row shape as `CourseScheduleRow`** (identical to schedule endpoint per official docs).

---

## Facilities

### `GET facilities/pointlist/`

No parameters.

**Array item:**

```ts
type FacilitiesPointRow = {
  Point_Identifier: string;
  System_Name: string;
  Description: string;
  Building: string;
  Floor: string;
  Room_Location: string | null;
  Type_of_Measurement: string;
  Units: string;
  Sensor_Type: string;
};
```

---

### `GET facilities/buildinglist/`

**Array item:**

```ts
type FacilitiesBuildingRow = {
  Campus: string; // LOY | SGW
  Building: string; // short code
  Building_Name: string;
  Building_Long_Name: string;
  Address: string;
  Latitude: string;
  Longitude: string;
};
```

---

### `GET facilities/consumption/filter/{starttime}/{endtime}`

Path times: `YYYY-MM-DD HH:MM:SS` (URL-encode spaces as needed).

**Array item.** `Point_*` columns are documented as numeric but may show `"No Data"` strings.

```ts
type FacilitiesConsumptionRow = {
  Date: string;
  Point_6: string; // kW aggregated
  Point_7: string;
  Point_8: string;
  Point_9: string;
  Point_10: string;
  Point_12: string;
};
```

*(Join to `pointlist` by `Point_Identifier` for human labels.)*

---

### `GET facilities/environmental/filter/{starttime}/{endtime}`

**Array item:**

```ts
type FacilitiesEnvironmentalRow = {
  Date: string;
  Point_1: string;
  Point_2: string;
  Point_3: string;
  Point_4: string;
  Point_5: string;
  Point_11: string;
};
```

---

### `GET facilities/waste/waste_types`

**Array item:**

```ts
type WasteTypeRow = {
  Waste_Type: string;
  Description: string;
};
```

*(Official markdown once showed a duplicate `facilities` segment in the path; use `facilities/waste/waste_types` per repo README.)*

---

### `GET facilities/waste/bin_types`

**Array item:**

```ts
type BinTypeRow = {
  Bin_Type: string;
  Description: string;
};
```

---

### `GET facilities/waste/invoices/filter/{building}/{startdate}/{enddate}`

Dates: `YYYY-MM-DD`; `building` may be `*`.

**Array item:**

```ts
type WasteInvoiceRow = {
  Source_Type: string; // Invoice | Credit Notice
  Building: string;
  Bin_Type: string;
  Waste_Type: string;
  Qty: string;
  Mass: string;
  Total_Cost: string; // may include `$`
  Date: string;
};
```

---

## Library (live)

### `GET library/hours/{date}`

`date`: `YYYY-MM-DD`.

**Array item:**

```ts
type LibraryHoursRow = {
  service: string;
  text: string;
};
```

---

### `GET library/events/`

Official example snippet is truncated; treat response as an object containing an **`event`** array:

```ts
type LibraryEventsResponse = {
  event: Array<{
    when: string;
    title: string;
    description: string | object | null;
    link: string | object | null;
  }>;
};
```

Design for **0–4** upcoming items per docs.

---

### `GET library/computers/`

**Single object** (not an array):

```ts
type LibraryComputersResponse = {
  Webster: {
    Desktops: Record<string, string>; // room code → available count string
    Laptops: string;
    Tablets: string;
  };
  Vanier: {
    Desktops: Record<string, string>;
    Laptops: string;
    Tablets: string;
  };
};
```

Room keys vary (e.g. `LB-245`, `VL-Entrance`).

---

### `GET library/occupancy/`

**Single object:**

```ts
type LibraryOccupancyResponse = {
  Webster: {
    Occupancy: string;
    LastRecordTime: string;
  };
  Vanier: {
    Occupancy: string;
    LastRecordTime: string;
  };
  GreyNuns: {
    Occupancy: string; // may be negative around midnight reset
    LastRecordTime: string;
  };
};
```

Use `LastRecordTime` for “as of” subcopy.

---

### `GET library/rooms/getRoomsList`

**Array item:**

```ts
type LibraryBookableResourceRow = {
  resourceID: string;
  name: string;
  scheduleID: string;
};
```

---

### `GET library/rooms/getRoomReservations/{resourceID}/{scheduleID}`

Use **`resourceID`** and **`scheduleID`** from `getRoomsList`.  
*(Official parameter text for `scheduleID` conflicts with the numeric example `.../53/1` — treat both as opaque ids from the room list.)*

**Array item:**

```ts
type LibraryReservationRow = {
  referenceNumber: number | string; // 0 = admin block
  startDate: string;
  endDate: string;
};
```

---

## Term code quick reference (courses)

Four-digit `termCode`: digits 1,3,4 of academic year + suffix:

| Suffix | Meaning |
| ------ | ------- |
| 1 | Summer |
| 2 | Fall |
| 3 | Fall/Winter |
| 4 | Winter |
| 5 | Spring (CCCE) |
| 6 | Summer (CCCE) |

Example: Fall 2018 → `2182`.

---

## License

Data use: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode).
