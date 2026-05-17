export type CampusCode = 'sgw' | 'loy';

export type ServiceSearchResult = {
  id: string;
  label: string;
  buildingName: string;
  kind: 'service' | 'department';
};

export type FeaturedEvent = {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
  backgroundColor?: string;
  textColor?: string;
  imageUrl?: string;
};

export type ShuttleCampus = 'loy' | 'sgw';

export type ShuttleDepartureStatus = {
  loyMessage: string;
  sgwMessage: string;
  isHoliday: boolean;
  isWeekend: boolean;
};
