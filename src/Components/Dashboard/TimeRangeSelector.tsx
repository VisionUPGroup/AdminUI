import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachQuarterOfInterval,
} from "date-fns";

// Enum for view modes
enum ViewMode {
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  CUSTOM = "custom",
}

interface TimeRangeSelectorProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCustomRangeChange?: (startDate: Date, endDate: Date) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedDate,
  viewMode,
  onDateChange,
  onViewModeChange,
  onCustomRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(
    selectedDate.getFullYear()
  );
  const [selectedQuarter, setSelectedQuarter] = useState<number>(
    Math.floor(selectedDate.getMonth() / 3) + 1
  );

  const handleQuarterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuarter = parseInt(event.target.value);
    setSelectedQuarter(newQuarter);
    onDateChange(new Date(selectedYear, (newQuarter - 1) * 3, 1)); // Chuyển sang ngày đầu tiên của quý mới
  };
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value);
    setSelectedYear(newYear);
    onDateChange(new Date(newYear, 0, 1)); // Chuyển sang ngày đầu tiên của năm mới
  };

  const handlePrevious = () => {
    switch (viewMode) {
      case ViewMode.MONTH:
        onDateChange(subMonths(selectedDate, 1));
        break;
      case ViewMode.QUARTER:
        onDateChange(subMonths(selectedDate, 3));
        break;
      case ViewMode.YEAR:
        onDateChange(subYears(selectedDate, 1));
        break;
    }
  };

  const handleNext = () => {
    const now = new Date();
    switch (viewMode) {
      case ViewMode.MONTH:
        if (selectedDate < now) {
          onDateChange(addMonths(selectedDate, 1));
        }
        break;
      case ViewMode.QUARTER:
        if (startOfQuarter(selectedDate) < startOfQuarter(now)) {
          onDateChange(addMonths(selectedDate, 3));
        }
        break;
      case ViewMode.YEAR:
        if (startOfYear(selectedDate) < startOfYear(now)) {
          onDateChange(addYears(selectedDate, 1));
        }
        break;
    }
  };

  const getCurrentRangeText = () => {
    switch (viewMode) {
      case ViewMode.MONTH:
        return format(selectedDate, "MMMM yyyy");
      case ViewMode.QUARTER:
        return `Q${Math.floor(selectedDate.getMonth() / 3) + 1} ${format(
          selectedDate,
          "yyyy"
        )}`;
      case ViewMode.YEAR:
        return format(selectedDate, "yyyy");
      case ViewMode.CUSTOM:
        return `${format(customStartDate, "dd/MM/yyyy")} - ${format(
          customEndDate,
          "dd/MM/yyyy"
        )}`;
      default:
        return "";
    }
  };

  const handleApplyCustomRange = () => {
    if (onCustomRangeChange) {
      onCustomRangeChange(customStartDate, customEndDate);
    }
    setIsOpen(false);
  };

  return (
    <div className="time-range-selector">
      <div className="view-mode-tabs">
        {Object.values(ViewMode).map((mode) => (
          <button
            key={mode}
            className={`tab-button ${viewMode === mode ? "active" : ""}`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="date-navigation">
        {viewMode !== ViewMode.CUSTOM && (
          <button
            className="nav-btn prev"
            onClick={handlePrevious}
            title="Previous"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <button className="current-range" onClick={() => setIsOpen(!isOpen)}>
          <Calendar size={20} />
          <span>{getCurrentRangeText()}</span>
        </button>

        {viewMode !== ViewMode.CUSTOM && (
          <button
            className="nav-btn next"
            onClick={handleNext}
            disabled={viewMode === ViewMode.MONTH && selectedDate >= new Date()}
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {viewMode === ViewMode.YEAR && (
          <div className="year-selector">
            <select value={selectedYear} onChange={handleYearChange}>
              {/* Tạo tùy chọn từ năm hiện tại trừ đi 5 năm đến năm hiện tại cộng thêm 5 năm */}
              {Array.from(
                { length: 11 },
                (_, i) => new Date().getFullYear() - 5 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
        {viewMode === ViewMode.QUARTER && (
          <div className="quarter-selector">
            <select value={selectedQuarter} onChange={handleQuarterChange}>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
        )}
      </div>

      {isOpen && viewMode === ViewMode.CUSTOM && (
        <div className="custom-range-picker">
          <div className="date-inputs">
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={format(customStartDate, "yyyy-MM-dd")}
                onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                max={format(customEndDate, "yyyy-MM-dd")}
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                value={format(customEndDate, "yyyy-MM-dd")}
                onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                min={format(customStartDate, "yyyy-MM-dd")}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>
          <button className="apply-button" onClick={handleApplyCustomRange}>
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
