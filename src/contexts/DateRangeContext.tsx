import moment from "moment";
import React, { useState } from "react";

interface IProps {
  children: React.ReactNode;
}

export type DateRange = [moment.Moment, moment.Moment];

export const DateRangeContext = React.createContext<[DateRange, Function]>([
  [
    moment()
      .startOf("hour")
      .subtract(7, "day"),
    moment()
      .startOf("hour")
      .add(1, "hour")
  ],
  () => {}
]);

export const DateRangeProvider = (props: IProps) => {
  const [dateRange, setDateRange] = useState<DateRange>([
    moment()
      .startOf("hour")
      .subtract(7, "day"),
    moment()
      .startOf("hour")
      .add(1, "hour")
  ]);
  return (
    <DateRangeContext.Provider
      value={[dateRange, setDateRange]}
      children={props.children}
    />
  );
};
