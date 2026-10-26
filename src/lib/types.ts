export type CarRecord = {
  id: string;
  filename: string;
  createdAt: string;
  displayName?: string;
  demo?: boolean;
};

export type CarsIndex = {
  cars: CarRecord[];
};
