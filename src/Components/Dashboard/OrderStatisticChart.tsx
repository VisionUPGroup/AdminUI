import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Label,
} from "recharts";
import { useOrderService } from "../../../Api/orderService";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import "./OrderStatisticStyle.scss";

// Format number to VND currency
const formatVND = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};



interface OrderStatistic {
  process: number;
  totalCount: number;
  totalAmount: number;
}

interface ProcessedData {
  date: string;
  process4Count: number;
  process5Count: number;
  totalAmount: number;
  cancelledAmount: number; // Thêm trường này
  dateObj: Date;
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-header">{label}</div>
        <div className="tooltip-content">
          <div className="tooltip-item">
            <span className="label">Completed Orders:</span>
            <span className="value completed">
              {Math.round(payload[0]?.value || 0)}
            </span>
          </div>
          <div className="tooltip-item">
            <span className="label">Cancelled Orders:</span>
            <span className="value cancelled">
              {Math.round(payload[1]?.value || 0)}
            </span>
          </div>
          <div className="tooltip-item">
            <span className="label">Completed Revenue:</span>
            {/* Định dạng lại hiển thị revenue */}
            <span className="value revenue">
              {`${((payload[2]?.value || 0) / 100).toFixed(0)}00 VND`}
            </span>
          </div>
          <div className="tooltip-item">
            <span className="label">Cancelled Revenue:</span>
            <span className="value cancelled">
              {`${((payload[3]?.value || 0) / 100).toFixed(0)}00 VND`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
//   const calculateAxisTicks = (data: ProcessedData[]) => {
//     // Tính toán cho trục Orders (left)
//     const maxOrders = Math.max(
//       ...data.map(d => Math.max(d.process4Count, d.process5Count))
//     );
//     const orderStep = Math.ceil(maxOrders / 5); // Chia thành 5 khoảng
//     const maxOrderTick = Math.ceil(maxOrders / orderStep) * orderStep;
//     const orderTicks = Array.from(
//       { length: 6 },
//       (_, i) => Math.round(i * maxOrderTick / 5)
//     );

//     // Tính toán cho trục Revenue (right)
//     const maxRevenue = Math.max(
//       ...data.map(d => Math.max(d.totalAmount, d.cancelledAmount))
//     );
//     const revenueStep = Math.ceil(maxRevenue / 1000000 / 5) * 1000000;
//     const maxRevenueTick = Math.ceil(maxRevenue / revenueStep) * revenueStep;
//     const revenueTicks = Array.from(
//       { length: 6 },
//       (_, i) => Math.round(i * maxRevenueTick / 5)
//     );

//     return { orderTicks, revenueTicks };
//   };

const calculateAxisDomain = (data: ProcessedData[]) => {
  // Tính toán cho trục Orders (left)
  const maxOrders = Math.max(
    ...data.map((d) => d.process4Count + d.process5Count)
  );
  const orderDomain = Math.ceil(maxOrders / 5) * 5;

  // Tính toán cho trục Revenue (right) - điều chỉnh theo hàng trăm
  const maxRevenue = Math.max(
    ...data.map((d) => Math.max(d.totalAmount, d.cancelledAmount))
  );
  // Làm tròn maxRevenue lên đến số trăm gần nhất chia hết cho 5
  const revenueDomain = Math.ceil(maxRevenue / 500) * 500;

  return {
    orderDomain: [0, orderDomain],
    revenueDomain: [0, revenueDomain],
  };
};
const MonthSelector: React.FC<{
  selectedDate: Date;
  onChange: (date: Date) => void;
}> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrevMonth = () => {
    onChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    if (nextMonth <= new Date()) {
      onChange(nextMonth);
    }
  };

  const last6Months = Array(6)
    .fill(null)
    .map((_, index) => {
      return subMonths(new Date(), index);
    })
    .reverse();

  return (
    <div className="month-selector">
      <div className="date-navigation">
        <button
          className="nav-btn prev"
          onClick={handlePrevMonth}
          disabled={selectedDate <= last6Months[0]}
          title="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <button className="current-month" onClick={() => setIsOpen(!isOpen)}>
          <Calendar size={20} />
          <span>{format(selectedDate, "MMMM yyyy")}</span>
        </button>

        <button
          className="nav-btn next"
          onClick={handleNextMonth}
          disabled={selectedDate >= new Date()}
          title="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="month-dropdown">
          {last6Months.map((date) => (
            <button
              key={date.toISOString()}
              className={`month-option ${
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                onChange(date);
                setIsOpen(false);
              }}
            >
              {format(date, "MMMM yyyy")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const OrderStatisticsChart: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlyData, setMonthlyData] = useState<ProcessedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchStatisticOrder } = useOrderService();
  const [mode, setMode] = useState<"Month" | "Quarter">("Month");
  //   const { orderTicks, revenueTicks } = calculateAxisTicks(monthlyData);
  const { orderDomain, revenueDomain } = calculateAxisDomain(monthlyData);
  const calculateTotals = () => {
    return monthlyData.reduce(
      (acc, curr) => ({
        totalCompleted: acc.totalCompleted + Math.round(curr.process4Count),
        totalCancelled: acc.totalCancelled + Math.round(curr.process5Count),
        totalRevenue: acc.totalRevenue + curr.totalAmount,
        totalCancelledRevenue: acc.totalCancelledRevenue + curr.cancelledAmount, // Thêm dòng này
        completionRate:
          (acc.totalCompleted / (acc.totalCompleted + acc.totalCancelled)) *
          100,
      }),
      {
        totalCompleted: 0,
        totalCancelled: 0,
        totalRevenue: 0,
        totalCancelledRevenue: 0, // Thêm dòng này
        completionRate: 0,
      }
    );
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const firstDay = startOfMonth(selectedDate);
        const lastDay = endOfMonth(selectedDate);

        // Lấy tất cả các ngày trong tháng
        const daysInMonth = eachDayOfInterval({
          start: firstDay,
          end: lastDay,
        });

        const dailyDataPromises = daysInMonth.map((date) =>
          fetchStatisticOrder(format(date, "yyyy-MM-dd"))
        );

        const dailyResults = await Promise.all(dailyDataPromises);

        // Đảm bảo mỗi ngày đều có dữ liệu
        const processedData: ProcessedData[] = daysInMonth.map(
          (date, index) => {
            const dayData: OrderStatistic[] = dailyResults[index];
            const process4Data = dayData.find((d) => d.process === 4) || {
              totalCount: 0,
              totalAmount: 0,
            };
            const process5Data = dayData.find((d) => d.process === 5) || {
              totalCount: 0,
              totalAmount: 0,
            };

            return {
              date: format(date, "dd/MM"),
              process4Count: Math.round(process4Data.totalCount),
              process5Count: Math.round(process5Data.totalCount),
              totalAmount: process4Data.totalAmount,
              cancelledAmount: process5Data.totalAmount,
              dateObj: date,
            };
          }
        );

        setMonthlyData(processedData);
      } catch (error) {
        console.error("Error fetching monthly statistics:", error);
        setError("Failed to load statistics data");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="dashboard-panel">
        <div className="loading-overlay">
          <div className="loader"></div>
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel">
        <div className="error-state">
          <div className="error-icon">!</div>
          <h3>Data Loading Error</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="dashboard-panel">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-wrapper">
            <h1>
              Revenue Management
              <p>Statistic revenue from orders</p>
            </h1>
          </div>
        </div>
        <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="statistics-grid">
        <div className="stat-card completed">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-title">Completed Orders</span>
              <div className="stat-icon">✓</div>
            </div>
            <div className="stat-value">{totals.totalCompleted}</div>
            <div className="stat-footer">
              <TrendingUp size={16} />
              <span className="completion-rate">
                {`${totals.completionRate.toFixed(1)}% completion rate`}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card cancelled">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-title">Cancelled Orders</span>
              <div className="stat-icon">✕</div>
            </div>
            <div className="stat-value">{totals.totalCancelled}</div>
            <div className="stat-footer">
              <TrendingDown size={16} />
              <span className="cancellation-rate">
                {`${(100 - totals.completionRate).toFixed(
                  1
                )}% cancellation rate`}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-title">Completed Revenue</span>
              <div className="stat-icon">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="stat-value">{formatVND(totals.totalRevenue)}</div>
            <div className="stat-footer">
              <span className="daily-average">
                {`Daily avg: ${formatVND(
                  totals.totalRevenue / monthlyData.length
                )}`}
              </span>
            </div>
          </div>
        </div>

        {/* Thêm card mới cho Cancelled Revenue */}
        <div className="stat-card cancelled-revenue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-title">Cancelled Revenue</span>
              <div className="stat-icon">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="stat-value">
              {formatVND(totals.totalCancelledRevenue)}
            </div>
            <div className="stat-footer">
              <span className="daily-average">
                {`Daily avg: ${formatVND(
                  totals.totalCancelledRevenue / monthlyData.length
                )}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={monthlyData}
            margin={{
              top: 20,
              right: 60,
              left: 30,
              bottom: 1, // Tăng margin bottom để có đủ chỗ cho labels
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="date"
              scale="point"
              interval={0} // Force hiển thị tất cả các điểm
              padding={{ left: 10, right: 10 }}
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,

                textAnchor: "end",
                dy: 8,
                dx: -8,
              }}
              height={60} // Tăng chiều cao của trục X
            />

            {/* Cập nhật YAxis bên trái (Orders) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={orderDomain}
              tickCount={6} // Số lượng ticks cố định
              allowDecimals={false} // Không cho phép số thập phân
              tickFormatter={(value) => Math.round(value).toString()}
            >
              <Label
                value="Number of Orders"
                angle={-90}
                position="insideLeft"
                offset={-5}
                style={{ textAnchor: "middle", fill: "var(--text-secondary)" }}
              />
            </YAxis>

            {/* Cập nhật YAxis bên phải (Revenue) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={revenueDomain}
              tickCount={6}
              // Đổi định dạng tickFormatter để hiển thị theo hàng trăm
              tickFormatter={(value) => `${(value / 100).toFixed(0)}00`}
            >
              <Label
                value="Revenue (Hundred VND)" // Cập nhật label
                angle={90}
                position="insideRight"
                offset={5}
                style={{ textAnchor: "middle", fill: "var(--text-secondary)" }}
              />
            </YAxis>

            {/* Cập nhật Bar components để sử dụng stackId */}
            <Bar
              yAxisId="left"
              dataKey="process4Count"
              name="Completed Orders"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
              barSize={8}
              stackId="orders"
            />
            <Bar
              yAxisId="left"
              dataKey="process5Count"
              name="Cancelled Orders"
              fill="var(--color-cancelled)"
              radius={[4, 4, 0, 0]}
              barSize={8}
              stackId="orders"
            />

            {/* Cập nhật Line components */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              name="Completed Revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={{ fill: "var(--color-revenue)", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cancelledAmount"
              name="Cancelled Revenue"
              stroke="var(--color-cancelled)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-cancelled)", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderStatisticsChart;
