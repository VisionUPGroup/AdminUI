import React, { useState, useEffect } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  subYears,
  addYears,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  endOfQuarter,
  startOfQuarter,
  differenceInDays,
  addDays,
  addMonths,
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
  ChevronDown,
} from "lucide-react";
import "./OrderStatisticStyle.scss";

const formatVND = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
interface DateRangeState {
  startDate: Date;
  endDate: Date;
}

interface DateSelectorProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
  dateRange: DateRangeState;
  onDateRangeChange: (range: DateRangeState) => void;
}

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
  cancelledAmount: number;
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
            <span className="value revenue">
              {formatVND(payload[2]?.value || 0)}
            </span>
          </div>
          <div className="tooltip-item">
            <span className="label">Cancelled Revenue:</span>
            <span className="value cancelled">
              {formatVND(payload[3]?.value || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const YearSelector: React.FC<{
  selectedDate: Date;
  onChange: (date: Date) => void;
}> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrevYear = () => {
    onChange(subYears(selectedDate, 1));
  };

  const handleNextYear = () => {
    const nextYear = addYears(selectedDate, 1);
    if (nextYear <= new Date()) {
      onChange(nextYear);
    }
  };

  const last3Years = Array(3)
    .fill(null)
    .map((_, index) => {
      return subYears(new Date(), index);
    })
    .reverse();

  return (
    <div className="month-selector">
      <div className="date-navigation">
        <button
          className="nav-btn prev"
          onClick={handlePrevYear}
          disabled={selectedDate <= last3Years[0]}
        >
          <ChevronLeft size={20} />
        </button>

        <button className="current-month" onClick={() => setIsOpen(!isOpen)}>
          <Calendar size={20} />
          <span>{format(selectedDate, "yyyy")}</span>
        </button>

        <button
          className="nav-btn next"
          onClick={handleNextYear}
          disabled={selectedDate >= new Date()}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="month-dropdown">
          {last3Years.map((date) => (
            <button
              key={date.toISOString()}
              className={`month-option ${
                date.getFullYear() === selectedDate.getFullYear() ? "active" : ""
              }`}
              onClick={() => {
                onChange(date);
                setIsOpen(false);
              }}
            >
              {format(date, "yyyy")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
type ViewMode = 'year' | 'quarter' | 'month'|'range';
const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  viewMode,
  onChange,
  onViewModeChange,
  dateRange,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrev = () => {
    if (viewMode === 'range') return;
    
    switch(viewMode) {
      case 'year':
        onChange(subYears(selectedDate, 1));
        break;
      case 'quarter':
        const prevQuarter = new Date(selectedDate);
        prevQuarter.setMonth(selectedDate.getMonth() - 3);
        onChange(prevQuarter);
        break;
      case 'month':
        const prevMonth = new Date(selectedDate);
        prevMonth.setMonth(selectedDate.getMonth() - 1);
        onChange(prevMonth);
        break;
    }
  };

  const handleNext = () => {
    if (viewMode === 'range') return;

    const now = new Date();
    switch(viewMode) {
      case 'year':
        const nextYear = addYears(selectedDate, 1);
        if (nextYear <= now) onChange(nextYear);
        break;
      case 'quarter':
        const nextQuarter = new Date(selectedDate);
        nextQuarter.setMonth(selectedDate.getMonth() + 3);
        if (nextQuarter <= now) onChange(nextQuarter);
        break;
      case 'month':
        const nextMonth = new Date(selectedDate);
        nextMonth.setMonth(selectedDate.getMonth() + 1);
        if (nextMonth <= now) onChange(nextMonth);
        break;
    }
  };

  const getDateDisplay = () => {
    switch(viewMode) {
      case 'range':
        return `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`;
      case 'year':
        return format(selectedDate, "yyyy");
      case 'quarter':
        const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
        return `Q${quarter} ${format(selectedDate, "yyyy")}`;
      case 'month':
        return format(selectedDate, "MM/yyyy");
    }
  };

  const getDropdownOptions = () => {
    if (viewMode === 'range') return [];

    switch(viewMode) {
      case 'year':
        return Array(3)
          .fill(null)
          .map((_, index) => {
            const year = subYears(new Date(), index);
            return {
              date: year,
              label: format(year, "yyyy"),
              isActive: year.getFullYear() === selectedDate.getFullYear()
            };
          })
          .reverse();
      
      case 'quarter':
        return Array(4)
          .fill(null)
          .map((_, index) => {
            const date = new Date(selectedDate.getFullYear(), index * 3);
            return {
              date,
              label: `Q${index + 1} ${format(date, "yyyy")}`,
              isActive: Math.floor(date.getMonth() / 3) === Math.floor(selectedDate.getMonth() / 3)
            };
          });
      
      case 'month':
        return Array(12)
          .fill(null)
          .map((_, index) => {
            const date = new Date(selectedDate.getFullYear(), index);
            return {
              date,
              label: format(date, "MMMM yyyy"),
              isActive: date.getMonth() === selectedDate.getMonth()
            };
          });
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    if (!start || !end) return;
    
    // Validate date range
    if (start > end) return;
    if (start > new Date() || end > new Date()) return;
    
    // Maximum range of 1 year
    const daysDiff = differenceInDays(end, start);
    if (daysDiff > 365) {
      end = addDays(start, 365);
    }

    onDateRangeChange({ startDate: start, endDate: end });
  };

  return (
    <div className="month-selector">
      <div className="date-navigation">
        {viewMode === 'range' ? (
          <div className="date-range-picker">
            <input
              type="date"
              value={format(dateRange.startDate, 'yyyy-MM-dd')}
              max={format(dateRange.endDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange(new Date(e.target.value), dateRange.endDate)}
            />
            <span>-</span>
            <input
              type="date"
              value={format(dateRange.endDate, 'yyyy-MM-dd')}
              min={format(dateRange.startDate, 'yyyy-MM-dd')}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange(dateRange.startDate, new Date(e.target.value))}
            />
          </div>
        ) : (
          <>
            <button
              className="nav-btn prev"
              onClick={handlePrev}
              disabled={viewMode === 'year' && selectedDate <= subYears(new Date(), 2)}
            >
              <ChevronLeft size={20} />
            </button>

            <button className="current-month" onClick={() => setIsOpen(!isOpen)}>
              <Calendar size={20} />
              <span>{getDateDisplay()}</span>
              <ChevronDown size={16} />
            </button>

            <button
              className="nav-btn next"
              onClick={handleNext}
              disabled={
                viewMode === 'year' 
                  ? selectedDate >= new Date()
                  : viewMode === 'quarter'
                  ? startOfQuarter(addYears(selectedDate, 1/4)) > new Date()
                  : startOfMonth(addMonths(selectedDate, 1)) > new Date()
              }
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="view-mode-toggle">
          <button 
            className={`mode-btn ${viewMode === 'year' ? 'active' : ''}`}
            onClick={() => onViewModeChange('year')}
          >
            Year
          </button>
          <button 
            className={`mode-btn ${viewMode === 'quarter' ? 'active' : ''}`}
            onClick={() => onViewModeChange('quarter')}
          >
            Quarter
          </button>
          <button 
            className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => onViewModeChange('month')}
          >
            Month
          </button>
          <button 
            className={`mode-btn ${viewMode === 'range' ? 'active' : ''}`}
            onClick={() => onViewModeChange('range')}
          >
            Custom
          </button>
        </div>
      </div>

      {isOpen && viewMode !== 'range' && (
        <div className="month-dropdown">
          {getDropdownOptions().map((option) => (
            <button
              key={option.date.toISOString()}
              className={`month-option ${option.isActive ? "active" : ""}`}
              onClick={() => {
                onChange(option.date);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
const OrderStatisticsChart: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [yearlyData, setYearlyData] = useState<ProcessedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchStatisticOrderDateToDate } = useOrderService();
  const [viewMode, setViewMode] = useState<ViewMode>('year');
  const [chartData, setChartData] = useState<ProcessedData[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: new Date(new Date().setDate(1)), // First day of current month
    endDate: new Date() // Today
  });
  const getViewModeTitle = (mode: ViewMode): string => {
    switch(mode) {
      case 'year':
        return 'Yearly';
      case 'quarter':
        return 'Quarterly';
      case 'month':
        return 'Monthly';
      default:
        return 'Yearly'; // fallback
    }
  };

  const calculateAxisDomain = (data: ProcessedData[]) => {
    const maxOrders = Math.max(
      ...data.map((d) => Math.max(d.process4Count, d.process5Count))
    );
    const orderDomain = Math.ceil(maxOrders / 5) * 5;

    const maxRevenue = Math.max(
      ...data.map((d) => Math.max(d.totalAmount, d.cancelledAmount))
    );
    const revenueDomain = Math.ceil(maxRevenue / 500) * 500;

    return {
      orderDomain: [0, orderDomain],
      revenueDomain: [0, revenueDomain],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let interval;
        if (viewMode === 'year') {
          const firstDay = startOfYear(selectedDate);
          const lastDay = endOfYear(selectedDate);
          interval = eachMonthOfInterval({ start: firstDay, end: lastDay });
        } else if (viewMode === 'quarter') {
          const firstDay = startOfQuarter(selectedDate);
          const lastDay = endOfQuarter(selectedDate);
          interval = eachMonthOfInterval({ start: firstDay, end: lastDay });
        } else {
          const firstDay = startOfMonth(selectedDate);
          const lastDay = endOfMonth(selectedDate);
          interval = eachDayOfInterval({ start: firstDay, end: lastDay });
        }

        const dataPromises = interval.map(async (date) => {
          const startDate = format(date, 'yyyy-MM-dd');
          const endDate = viewMode === 'month'
            ? startDate
            : format(endOfMonth(date), 'yyyy-MM-dd');
          return fetchStatisticOrderDateToDate(startDate, endDate);
        });

        const results = await Promise.all(dataPromises);

        const processedData: ProcessedData[] = interval.map((date, index) => {
          const data = results[index];
          const process4Data = data.find((d: { process: number }) => d.process === 4) || {
            totalCount: 0,
            totalAmount: 0,
          };
          const process5Data = data.find((d: { process: number }) => d.process === 5) || {
            totalCount: 0,
            totalAmount: 0,
          };

          return {
            date: format(date, 
              viewMode === 'year' ? 'MM/yyyy' : 
              viewMode === 'quarter' ? 'MM/yyyy' : 
              'dd/MM'
            ),
            process4Count: Math.round(process4Data.totalCount),
            process5Count: Math.round(process5Data.totalCount),
            totalAmount: process4Data.totalAmount,
            cancelledAmount: process5Data.totalAmount,
            dateObj: date,
          };
        });

        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError("Failed to load statistics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, viewMode]);

  const calculateTotals = () => {
    return yearlyData.reduce(
      (acc, curr) => ({
        totalCompleted: acc.totalCompleted + curr.process4Count,
        totalCancelled: acc.totalCancelled + curr.process5Count,
        totalRevenue: acc.totalRevenue + curr.totalAmount,
        totalCancelledRevenue: acc.totalCancelledRevenue + curr.cancelledAmount,
        completionRate:
          (acc.totalCompleted / (acc.totalCompleted + acc.totalCancelled)) * 100,
      }),
      {
        totalCompleted: 0,
        totalCancelled: 0,
        totalRevenue: 0,
        totalCancelledRevenue: 0,
        completionRate: 0,
      }
    );
  };

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
  const { orderDomain, revenueDomain } = calculateAxisDomain(chartData);

  return (
    <div className="dashboard-panel">
    <div className="dashboard-header">
      <div className="header-content">
        <div className="title-wrapper">
          <h1>
            Revenue Management
            <p>
            {getViewModeTitle(viewMode)} revenue statistics from orders
            </p>
          </h1>
        </div>
      </div>
      <DateSelector 
          selectedDate={selectedDate} 
          viewMode={viewMode}
          onChange={setSelectedDate}
          onViewModeChange={setViewMode}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
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
                {`Monthly avg: ${formatVND(
                  totals.totalRevenue / yearlyData.length
                )}`}
              </span>
            </div>
          </div>
        </div>

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
                {`Monthly avg: ${formatVND(
                  totals.totalCancelledRevenue / yearlyData.length
                )}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 60,
              left: 30,
              bottom: 20,
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
              padding={{ left: 30, right: 30 }}
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
              }}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={orderDomain}
              tickCount={6}
              allowDecimals={false}
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

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={revenueDomain}
              tickCount={6}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            >
              <Label
                value="Revenue (Million VND)"
                angle={90}
                position="insideRight"
                offset={5}
                style={{ textAnchor: "middle", fill: "var(--text-secondary)" }}
              />
            </YAxis>

            <Bar
              yAxisId="left"
              dataKey="process4Count"
              name="Completed Orders"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
              barSize={20}
              stackId="orders"
            />
            <Bar
              yAxisId="left"
              dataKey="process5Count"
              name="Cancelled Orders"
              fill="var(--color-cancelled)"
              radius={[4, 4, 0, 0]}
              barSize={20}
              stackId="orders"
            />

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