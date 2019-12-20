import { State } from "@melonade/melonade-declaration";
import { Typography } from "antd";
import { Axis, Chart, Geom, Tooltip } from "bizcharts";
import moment from "moment";
import React from "react";
import styled from "styled-components";
import { getWeeklyTransactionsByStatus } from "../../services/eventLogger/http";

const { Title } = Typography;

const Container = styled.div``;

const Section = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;

  & + & {
    margin-top: 12px;
  }
`;

const fillUpWeeklyTransaction = new Array(7 * 24)
  .fill(null)
  .map((_value: any, index: number) => ({
    count: 0,
    weekday: index % 7,
    hour: Math.floor(index / 7)
  }));

const weekdayString = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

interface IWeeklyTransactionChartData {
  count: number;
  weekday: number;
  hour: number;
}

interface IProps {}

interface IState {
  weeklyTransactionData: IWeeklyTransactionChartData[];
  isLoading: boolean;
}

export default class Dashboard extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      weeklyTransactionData: [],
      isLoading: false
    };
  }

  getWeeklyTransactionsByStatus = async () => {
    this.setState({ isLoading: true });
    try {
      const startedTransaction = await getWeeklyTransactionsByStatus(
        State.TransactionStates.Running,
        new Date()
      );

      const weeklyTransactionData = startedTransaction.map(
        (data: any): IWeeklyTransactionChartData => {
          const date = moment(data.date);
          return {
            count: data.count,
            hour: date.hour(),
            weekday: date.weekday()
          };
        }
      );
      this.setState({
        isLoading: false,
        weeklyTransactionData: [
          ...fillUpWeeklyTransaction,
          ...weeklyTransactionData
        ]
      });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  componentDidMount = async () => {
    this.getWeeklyTransactionsByStatus();
  };

  render() {
    const { weeklyTransactionData } = this.state;
    return (
      <Container>
        <Section>
          <Title level={4}>Transaction started</Title>
          <Chart
            height={400}
            data={weeklyTransactionData}
            forceFit
            padding={[20, 60, 40, 100]}
            scale={{
              hour: {
                min: 0,
                max: 23,
                tickInterval: 1,
                tickCount: 24
              },
              weekday: {
                min: 0,
                max: 6,
                tickInterval: 1,
                tickCount: 7
              }
            }}
          >
            <Axis
              name="weekday"
              label={{
                formatter: (weekday: any): string =>
                  weekdayString[weekday] || "-"
              }}
            />
            <Axis name="hour" />
            <Tooltip showTitle={false} />
            <Geom
              type="point"
              position="hour*weekday"
              size={["count", [2, (window.innerWidth - 120) / 48]]}
              shape="circle"
              color={"#49BEAA"}
            />
          </Chart>
        </Section>
      </Container>
    );
  }
}
