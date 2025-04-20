"use client"

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// types for our filters
type ReportType   = "school" | "class" | "section" | "student";
type Period       = "day" | "week" | "month" | "year";
type ChartType    = "bar" | "line";

type ReportItem = {
  period: string | { year: number; week: number };
  presentCount:  number;
  absentCount:   number;
  lateWithin5:   number;
  lateAfter5:    number;
  totalCount:    number;
  attendancePct: number;
};

     interface ReportParams {
         period: Period;
         startDate: string;
         endDate: string;
          class?: string;
          section?: string;
        }

        interface StudentRaw {
          _id: string;
          name: string;
          currentClass: number;
          currentSection?: string;
        }

type StudentOption = { id: string; label: string };

export default function ReportsPage() {
  // filter states
  const [type,     setType]          = useState<ReportType>("school");
  const [cls,      setClass]         = useState<string>("");
  const [section,  setSection]       = useState<string>("");
  const [student,  setStudent]       = useState<string>("");
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [period,   setPeriod]        = useState<Period>("day");
  const today                        = new Date().toISOString().slice(0, 10);
  const [start,    setStart]         = useState<string>(today);
  const [end,      setEnd]           = useState<string>(today);
  const [view,     setView]          = useState<"chart" | "table">("chart");
  // **new** chart type toggle
  const [chartType, setChartType]    = useState<ChartType>("bar");

  // load student list when student report selected
  useEffect(() => {
    if (type === "student") {
      api.get<{ data: StudentRaw[] }>("/students", { params: { limit: 1000 } })
         .then(res => {
           const opts = res.data.data.map((s) => ({
             id:    s._id,
             label: `${s.name} (Class ${s.currentClass}${s.currentSection ? ' ' + s.currentSection : ''})`,
           }));
           setStudentOptions(opts);
         })
         .catch(console.error);
    } else {
      setStudentOptions([]);
      setStudent("");
    }
  }, [type]);

  // react-query hook (v5 signature)
  const { data = [], isLoading, error, refetch } = useQuery<ReportItem[], Error>({
    queryKey: ["report", { type, cls, section, student, period, start, end }],
    queryFn: async () => {
      let url = "/reports/school";
      if (type === "class")   url = "/reports/class";
      else if (type === "section") url = "/reports/section";
      else if (type === "student") url = `/reports/student/${student}`;

      const params: ReportParams = { period, startDate: start, endDate: end };
      if (type === "class"  || type === "section") params.class = cls;
      if (type === "section")                     params.section = section;

      const res = await api.get(url, { params });
      return res.data.data as ReportItem[];
    },
    enabled: false,
  });

  return (
    <div className="space-y-6 p-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Report Type */}
        <Select value={type} onValueChange={v => setType(v as ReportType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="school">School‑wide</SelectItem>
            <SelectItem value="class">Class‑wise</SelectItem>
            <SelectItem value="section">Section‑wise</SelectItem>
            <SelectItem value="student">Student‑specific</SelectItem>
          </SelectContent>
        </Select>

        {/* Class dropdown */}
        {(type === "class" || type === "section") && (
          <Select value={cls} onValueChange={setClass}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Nursery</SelectItem>
              <SelectItem value="0">KG</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={`${i+1}`}>{i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Section dropdown */}
        {type === "section" && (
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Boys">Boys</SelectItem>
              <SelectItem value="Girls">Girls</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Student dropdown */}
        {type === "student" && (
          <Select value={student} onValueChange={setStudent}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {studentOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Period Radio */}
        <RadioGroup
          value={period}
          onValueChange={v => setPeriod(v as Period)}
          className="flex gap-2"
        >
          {(['day','week','month','year'] as Period[]).map(p => (
            <div key={p} className="flex items-center space-x-1">
              <RadioGroupItem value={p} id={p} />
              <label htmlFor={p} className="capitalize">{p}</label>
            </div>
          ))}
        </RadioGroup>

        {/* Date pickers */}
        <div className="flex gap-2">
          <Input type="date" value={start} onChange={e => setStart(e.target.value)} />
          <Input type="date" value={end}   onChange={e => setEnd(e.target.value)}   />
        </div>

        {/* View toggle */}
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={v => setView(v as "chart"|"table")}
          className="border rounded"
        >
          <ToggleGroupItem value="chart">Chart</ToggleGroupItem>
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
        </ToggleGroup>

        <Button onClick={() => refetch()}>Show Report</Button>
      </div>

      {/* Content */}
      {isLoading && <div>Loading...</div>}
      {error     && <div className="text-red-600">Error loading report</div>}

      {!isLoading && !error && data.length > 0 && (
        view === "chart" ? (
          <>
            {/* Chart‐type toggle */}
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={v => setChartType(v as ChartType)}
              className="mb-2"
            >
              <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
              <ToggleGroupItem value="line">Line</ToggleGroupItem>
            </ToggleGroup>

            <ChartContainer
              config={{
                presentCount: { label: 'Present',    color: 'hsl(var(--chart-1))' },
                absentCount:  { label: 'Absent',     color: 'hsl(var(--chart-2))' },
                lateWithin5:  { label: 'Late ≤ 5m',  color: 'hsl(var(--chart-3))' },
                lateAfter5:   { label: 'Late > 5m',  color: 'hsl(var(--chart-4))' },
              }}
              className="h-[300px] w-full"
            >
              {chartType === "bar" ? (
                <BarChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="presentCount" fill="var(--chart-1)" radius={4} />
                  <Bar dataKey="absentCount"  fill="var(--chart-2)" radius={4} />
                  <Bar dataKey="lateWithin5"  fill="var(--chart-3)" radius={4} />
                  <Bar dataKey="lateAfter5"   fill="var(--chart-4)" radius={4} />
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line  dataKey="presentCount" stroke="var(--chart-1)" dot={false} />
                  <Line  dataKey="absentCount"  stroke="var(--chart-2)" dot={false} />
                  <Line  dataKey="lateWithin5"  stroke="var(--chart-3)" dot={false} />
                  <Line  dataKey="lateAfter5"   stroke="var(--chart-4)" dot={false} />
                </LineChart>
              )}
            </ChartContainer>
          </>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late ≤ 5m</TableHead>
                <TableHead>Late &gt; 5m</TableHead>
                {/* new column */}
                <TableHead>Total Late</TableHead>
                <TableHead>Late %</TableHead> 
                <TableHead>Total</TableHead>
                <TableHead>Present %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => {
                const totalLate = row.lateWithin5 + row.lateAfter5;
                const latePct   = row.totalCount 
                ? (totalLate / row.totalCount) * 100
                : 0;
                return (
                  <TableRow key={i}>
                    <TableCell>{
                      typeof row.period === 'string'
                        ? row.period
                        : `W${row.period.week}, ${row.period.year}`
                    }</TableCell>
                    <TableCell>{row.presentCount}</TableCell>
                    <TableCell>{row.absentCount}</TableCell>
                    <TableCell>{row.lateWithin5}</TableCell>
                    <TableCell>{row.lateAfter5}</TableCell>
                    <TableCell>{totalLate}</TableCell>
                    <TableCell>{latePct.toFixed(1)}%</TableCell>
                    <TableCell>{row.totalCount}</TableCell>
                    <TableCell>{row.attendancePct.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )
      )}
    </div>
  );
}
