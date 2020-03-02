import { useContext } from "react";
import { DateRangeContext } from "../contexts/DateRangeContext";
import moment from "moment";

export type DateType = string | number | moment.Moment | Date | undefined;

export default () => {
  const [dateRange, setDateRange] = useContext(DateRangeContext);

  const resetDate = () => {
    setDateRange([
      moment()
        .startOf("hour")
        .subtract(7, "day"),
      moment()
        .startOf("hour")
        .add(1, "hour")
    ]);
  };

  const setDates = (start?: DateType, end?: DateType) => {
    setDateRange([moment(start).startOf("day"), moment(end).endOf("day")]);
  };

  const nextDay = () => {
    setDateRange([dateRange[0].add(1, "day"), dateRange[1].add(1, "day")]);
  };

  const nextWeek = () => {
    setDateRange([dateRange[0].add(1, "week"), dateRange[1].add(1, "week")]);
  };

  const prevDay = () => {
    setDateRange([
      dateRange[0].subtract(1, "day"),
      dateRange[1].subtract(1, "day")
    ]);
  };

  const prevWeek = () => {
    setDateRange([
      dateRange[0].subtract(1, "week"),
      dateRange[1].subtract(1, "week")
    ]);
  };

  return {
    resetDate,
    setDates,
    dateRange,
    nextDay,
    nextWeek,
    prevDay,
    prevWeek
  };
};
