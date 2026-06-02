import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

function ProgressPage({ user, setUser }) {
  const [sessions, setSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const chartColors = [
    "#c084fc",
    "#f6d365",
    "#60a5fa",
    "#f472b6",
    "#34d399",
    "#fb923c",
    "#a78bfa",
  ];

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/${user.user_id}`);

        const newestFirstSessions = [...res.data];
        setSessions(newestFirstSessions);

        const groupedByWeek = {};

        newestFirstSessions.forEach((session) => {
          const sessionDate = new Date(session.session_date);
          const normalizedDate = new Date(
            sessionDate.getFullYear(),
            sessionDate.getMonth(),
            sessionDate.getDate()
          );

          const dayOfWeek = normalizedDate.getDay();
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

          const weekStart = new Date(normalizedDate);
          weekStart.setDate(normalizedDate.getDate() + mondayOffset);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const weekKey = `${weekStart.toISOString().split("T")[0]}_${weekEnd
            .toISOString()
            .split("T")[0]}`;

          if (!groupedByWeek[weekKey]) {
            groupedByWeek[weekKey] = {
              weekLabel: `Week (${formatDate(weekStart)} - ${formatDate(weekEnd)})`,
              weekStart,
              weekEnd,
              sessions: [],
              totalSessions: 0,
              successfulSessions: 0,
            };
          }

          groupedByWeek[weekKey].sessions.push(session);
          groupedByWeek[weekKey].totalSessions += 1;

          if (session.user_answer) {
            groupedByWeek[weekKey].successfulSessions += 1;
          }
        });

        const finalWeeklyData = Object.values(groupedByWeek)
          .sort((a, b) => b.weekStart - a.weekStart)
          .map((week) => {
            const groupedByDay = {};

            week.sessions.forEach((session) => {
              const dayKey = formatDate(session.session_date);

              if (!groupedByDay[dayKey]) {
                groupedByDay[dayKey] = [];
              }

              groupedByDay[dayKey].push(session);
            });

            const sortedDayKeysNewestFirst = Object.keys(groupedByDay).sort(
              (a, b) => new Date(b) - new Date(a)
            );

            const sortedDayKeysOldestFirstForChart = [...sortedDayKeysNewestFirst].reverse();

            const chartData = sortedDayKeysOldestFirstForChart.map((dayKey, index) => {
              const daySessions = groupedByDay[dayKey];

              return {
                dayLabel: dayKey,
                dayShort: dayKey.split(" ")[1] + " " + dayKey.split(" ")[0].replace(",", ""),
                score: daySessions.reduce((sum, s) => sum + s.progress_score, 0) / daySessions.length,
                color: chartColors[index % chartColors.length],
                sessionsCount: daySessions.length,
              };
            });

            return {
              ...week,
              groupedByDay,
              sortedDayKeysNewestFirst,
              chartData,
            };
          });

        setWeeklyData(finalWeeklyData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [user.user_id]);

  return (
    <div>
      <Navbar setUser={setUser} />

      <div className="page-container page-with-footer">
        <div className="progress-card">
          <h1>Your Progress</h1>

          {sessions.length === 0 ? (
            <p>No sessions yet.</p>
          ) : (
            <div className="weekly-charts-container">
              {weeklyData.map((week, weekIndex) => (
                <div key={weekIndex} className="week-chart-section">
                  <h2 className="week-title">{week.weekLabel}</h2>

                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={week.chartData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                        barCategoryGap="25%"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="dayShort"
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={60}
                          padding={{ left: 20, right: 10 }}
                        />
                        <YAxis domain={[0, 1]} />
                        <Tooltip
                          formatter={(value) => [Number(value).toFixed(2), "Average Score"]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              return `${payload[0].payload.dayLabel}`;
                            }
                            return label;
                          }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {week.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="week-summary">
                    <p>
                      <strong>Number of sessions done in this week:</strong> {week.totalSessions}
                    </p>
                    <p>
                      <strong>Number of successful sessions in this week:</strong>{" "}
                      {week.successfulSessions}
                    </p>
                  </div>

                  <div className="day-tables-container weekly-day-tables">
                    {week.sortedDayKeysNewestFirst.map((date) => (
                      <div key={date} className="day-section">
                        <h2 className="day-title">{date}</h2>

                        <table className="progress-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Feeling Better</th>
                              <th>Message</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {week.groupedByDay[date].map((session) => (
                              <tr key={session.session_id}>
                                <td>{session.session_time}</td>
                                <td>{session.user_answer ? "Yes" : "No"}</td>
                                <td>{session.ai_message}</td>
                                <td>{session.progress_score}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;