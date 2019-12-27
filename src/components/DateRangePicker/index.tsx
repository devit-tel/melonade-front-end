import { DatePicker } from "antd";
import moment from "moment";
import React from "react";
import styled from "styled-components";
import useDateRange from "../../hooks/useDateRange";

const DateRange = styled(DatePicker.RangePicker)`
  width: 270px;
`;

interface IProps {}

export default (props: IProps) => {
  const { dateRange, setDates } = useDateRange();
  return (
    <DateRange
      size="default"
      // Antd fucking add null | undefined to date type LOL, but moment don't
      onChange={(dates: (moment.Moment | any)[]) => {
        setDates(dates[0], dates[1]);
      }}
      value={dateRange}
    />
  );
};
