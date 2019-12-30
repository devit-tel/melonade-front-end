import moment from "moment";
import React, { useState } from "react";

interface IProps {
  children: React.ReactNode;
}

export type DateRange = [moment.Moment, moment.Moment];

export const DateRangeContext = React.createContext<[DateRange, Function]>([
  [moment().startOf("week"), moment().endOf("week")],
  () => {}
]);

export const DateRangeProvider = (props: IProps) => {
  const [dateRange, setDateRange] = useState<DateRange>([
    moment().startOf("week"),
    moment().endOf("week")
  ]);
  return (
    <DateRangeContext.Provider
      value={[dateRange, setDateRange]}
      children={props.children}
    />
  );
};
