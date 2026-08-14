import { useEffect, useMemo, useState } from "react";
import "./dashboard.css";
import {
    getRequisitionUserDashboardCount,
    getRequisitionUserYearlyTrend,
} from "../../service/dashboard.service";

/*
 * How many financial years the trend chart covers.
 * Keep this between 5 and 7 per the design ask.
 */
const TREND_YEARS = 8;

const TREND_SERIES = [
    { key: "requisitions", label: "Total Requisitions", className: "trend-bar-total" },
    { key: "attended", label: "Attended", className: "trend-bar-attended" },
    { key: "notAttended", label: "Not Attended", className: "trend-bar-notattended" },
];

export const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

export const generateFinancialYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
        const start = currentYear - i;
        years.push(`${start}-${start + 1}`);
    }

    return years;
};

const getFinancialYearDates = (financialYear) => {
    if (!financialYear) return {};

    const [start, end] = financialYear.split("-");

    return {
        startDate: `${start}-04-01`,
        endDate: `${end}-03-31`,
    };
};

const mapDashboardResponse = (raw) => {
    if (!raw) return null;

    return {
        organisers: raw.organisers || 0,
        courses: raw.courses || 0,
        requisitions: raw.requisitions || 0,
        attended: raw.attended || 0,
    };
};

/*
 * Backend returns [{ financialYear, requisitions, attended, notAttended }, ...]
 * for the trailing N financial years, oldest first. Just guard against
 * nulls so the chart never crashes on a bad payload.
 */
const mapYearlyTrend = (raw) => {
    if (!Array.isArray(raw)) return [];

    return raw.map((entry) => ({
        financialYear: entry?.financialYear || "—",
        requisitions: entry?.requisitions || 0,
        attended: entry?.attended || 0,
        notAttended:
            entry?.notAttended ??
            Math.max((entry?.requisitions || 0) - (entry?.attended || 0), 0),
    }));
};

const UserDashboard = () => {

    const empId = localStorage.getItem("empId");

    const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [yearlyTrend, setYearlyTrend] = useState([]);
    const [trendLoading, setTrendLoading] = useState(false);
    const [trendError, setTrendError] = useState(null);

    const financialYears = generateFinancialYears();

    const fetchDashboardData = async (year) => {

        setLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getFinancialYearDates(year);
            const response = await getRequisitionUserDashboardCount(
                empId,
                startDate,
                endDate
            );
            setDashboardData(mapDashboardResponse(response));
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(
                "Couldn't load the dashboard right now. Please try again."
            );
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchYearlyTrend = async () => {

        setTrendLoading(true);
        setTrendError(null);

        try {
            const response = await getRequisitionUserYearlyTrend(
                empId,
                TREND_YEARS
            );
            setYearlyTrend(mapYearlyTrend(response));
        } catch (err) {
            console.error("Yearly Trend Error:", err);
            setTrendError(
                "Couldn't load the yearly trend right now."
            );
            setYearlyTrend([]);
        } finally {
            setTrendLoading(false);
        }
    };

    useEffect(() => {
        if (!financialYear) return;
        fetchDashboardData(financialYear);
    }, [financialYear]);


    useEffect(() => {
        fetchYearlyTrend();
    }, []);

    const maxTrendValue = useMemo(() => {

        if (!yearlyTrend.length) return 1;

        const values = yearlyTrend.flatMap((row) => [
            row.requisitions,
            row.attended,
            row.notAttended,
        ]);

        return Math.max(...values, 1);

    }, [yearlyTrend]);

    const hasTrendData =
        yearlyTrend.length > 0 &&
        yearlyTrend.some((row) => row.requisitions > 0);

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="dashboard-heading">
                    <div className="dashboard-title-row">
                        <h2 className="dashboard-title">
                            Requisition Dashboard
                        </h2>
                    </div>
                </div>


                <div className="fy-selector">
                    <label htmlFor="financialYear">
                        Financial Year
                    </label>

                    <select
                        id="financialYear"
                        className="form-select dashboard-select"
                        value={financialYear}
                        disabled={loading}
                        onChange={(event) =>
                            setFinancialYear(event.target.value)
                        }
                    >
                        {financialYears.map((year) => (

                            <option key={year} value={year}>
                                {year}
                            </option>

                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    <span className="dashboard-error-icon">
                        !
                    </span>
                    <span className="dashboard-error-text">
                        {error}
                    </span>
                    <button
                        type="button"
                        className="dashboard-error-retry"
                        onClick={() => fetchDashboardData(financialYear)}
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading && !dashboardData && !error && (
                <div className="dashboard-skeleton">
                    <div className="row g-4 mb-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div className="col-12 col-sm-6 col-xl-3" key={i}>
                                <div className="skeleton-block skeleton-card" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dashboardData && (
                <div className="row g-4 mb-4">
                    <SummaryCard
                        colorClass="card-blue"
                        icon="👥"
                        label="Organisers"
                        value={dashboardData.organisers}
                    />

                    <SummaryCard
                        colorClass="card-purple"
                        icon="🎓"
                        label="Courses"
                        value={dashboardData.courses}
                    />

                    <SummaryCard
                        colorClass="card-orange"
                        icon="📋"
                        label="Requisitions"
                        value={dashboardData.requisitions}
                    />

                    <SummaryCard
                        colorClass="card-green"
                        icon="✓"
                        label="Attended"
                        value={dashboardData.attended}
                    />
                </div>
            )}


            {/* ============================================
                YEARLY TREND
            ============================================ */}

            <div className="row g-4">
                <div className="col-12">
                    <div className="dashboard-card trend-card">

                        <div className="chart-header">
                            <div>
                                <h5>
                                    Requisitions Over the Years
                                </h5>
                                <span>
                                    Last {TREND_YEARS} financial years —
                                    total, attended and not attended
                                </span>
                            </div>
                        </div>

                        {trendError && (
                            <div className="dashboard-error">
                                <span className="dashboard-error-icon">
                                    !
                                </span>
                                <span className="dashboard-error-text">
                                    {trendError}
                                </span>
                                <button
                                    type="button"
                                    className="dashboard-error-retry"
                                    onClick={fetchYearlyTrend}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {trendLoading && !yearlyTrend.length && !trendError && (
                            <div className="skeleton-block skeleton-panel" />
                        )}

                        {!trendLoading && !trendError && (

                            hasTrendData ? (

                                <YearlyTrendChart
                                    data={yearlyTrend}
                                    maxValue={maxTrendValue}
                                    currentYear={financialYear}
                                />

                            ) : (

                                <div className="course-empty-state">
                                    <span className="course-empty-icon">
                                        📭
                                    </span>
                                    <p className="course-empty-title">
                                        No historical data yet
                                    </p>
                                    <p className="course-empty-subtitle">
                                        Nothing has been recorded in the
                                        last {TREND_YEARS} financial years.
                                    </p>
                                </div>

                            )

                        )}

                    </div>
                </div>
            </div>

        </div>
    );
}

export default UserDashboard;


const SummaryCard = ({ colorClass, icon, label, value }) => (

    <div className="col-12 col-sm-6 col-xl-3">
        <div className={`summary-card ${colorClass}`}>
            <div className="summary-icon">
                <span>{icon}</span>
            </div>

            <div className="summary-content">

                <div className="summary-label">
                    {label}
                </div>

                <div className="summary-value">
                    {value}
                </div>

            </div>

        </div>

    </div>

);


/* =============================================================
   YEARLY TREND — vertical grouped bar chart
============================================================= */

const YearlyTrendChart = ({ data, maxValue, currentYear }) => (

    <>

        {/* Legend */}

        <div className="course-legend trend-legend">

            {TREND_SERIES.map((series) => (

                <div className="course-legend-item" key={series.key}>

                    <span
                        className={`course-legend-dot trend-legend-dot ${series.className}`}
                    />

                    <span>
                        {series.label}
                    </span>

                </div>

            ))}

        </div>


        {/* Chart */}

        <div className="trend-chart-wrapper">

            <div className="trend-chart">

                {data.map((row) => (

                    <div
                        className={
                            "trend-year-group" +
                            (row.financialYear === currentYear
                                ? " is-current"
                                : "")
                        }
                        key={row.financialYear}
                    >

                        <div className="trend-bars">

                            {TREND_SERIES.map((series) => {

                                const value = row[series.key] || 0;

                                const heightPercentage =
                                    (value / maxValue) * 100;

                                return (

                                    <div
                                        className="trend-bar-track"
                                        key={series.key}
                                    >

                                        <span className="trend-bar-value">
                                            {value > 0 ? value : ""}
                                        </span>

                                        <div
                                            className={`trend-bar ${series.className}`}
                                            style={{
                                                height:
                                                    value > 0
                                                        ? `${Math.max(heightPercentage, 3)}%`
                                                        : "0%",
                                            }}
                                            title={`${series.label}: ${value}`}
                                        />

                                    </div>

                                );

                            })}

                        </div>

                        <div className="trend-year-label">
                            {row.financialYear}
                        </div>

                    </div>

                ))}

            </div>

        </div>

    </>

);