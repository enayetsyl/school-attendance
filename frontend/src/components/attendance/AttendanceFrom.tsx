// components/AttendanceForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

type Student = {
  _id: string;
  name: string;
  currentClass: number;
  currentSection?: string;
};
type Entry = {
  student: string;
  present: boolean;
  absent: boolean;
  lateEntry?: string;
  earlyLeave?: string;
  comment?: string;
};

export default function AttendanceForm() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const qc = useQueryClient();

  // 1) Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => api.get("/students?limit=1000").then((r) => r.data.data),
  });

  // 2) Fetch existing attendance
  const dateStr = selectedDate.toISOString().split("T")[0];
  const { data: existing, isLoading: loadingAttendance } = useQuery<Entry[]>({
    queryKey: ["attendance", dateStr],
    queryFn: () =>
      api
        .get("/attendance", { params: { date: dateStr } })
        .then((r) => r.data.data),
    enabled: !!students,
  });

  // 3) Initialize entries once both are in
  useEffect(() => {
    if (!students) return;
    // only run when we actually have students data
    const init = students.map((s) => {
      const ex = existing?.find((e) => e.student === s._id);
      return {
        student: s._id,
        present: ex?.present ?? false,
        absent: ex?.absent ?? false,
        lateEntry: ex?.lateEntry,
        earlyLeave: ex?.earlyLeave,
        comment: ex?.comment ?? "",
      };
    });
    setEntries(init);
  }, [students, existing]);

  const mutation = useMutation({
    mutationFn: (payload: { date: string; entries: Entry[] }) =>
      api.post("/attendance", payload),
    onSuccess: () => {
      toast.success("Saved!");
      qc.invalidateQueries({ queryKey: ["attendance", dateStr] });
    },
    onError: (e) => {
      console.error(e);
      toast.error(`Save failed: ${e.message}`);
    },
  });

  // 4) Don't render form until everything is ready
  if (loadingStudents || loadingAttendance) {
    return <div>Loading attendance data…</div>;
  }
  // wait for entries to be initialized
  if (students && entries.length < students.length) {
    return <div>Preparing form…</div>;
  }

  // 5) mutation

  // group by class/section
  const grouped = students!.reduce<Record<string, Student[]>>((acc, s) => {
    const key = `Class ${s.currentClass}${
      s.currentSection ? `-${s.currentSection}` : ""
    }`;
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  const onCheck =
    (i: number, field: "present" | "absent") => (checked: boolean) => {
      setEntries((e) => {
        const copy = [...e];
        if (field === "present") {
          copy[i].present = checked;
          if (checked) {
            copy[i].absent = false;
            copy[i].lateEntry = undefined;
          }
        } else {
          copy[i].absent = checked;
          if (checked) {
            copy[i].present = false;
            copy[i].lateEntry = undefined;
            copy[i].earlyLeave = undefined;
          }
        }
        return copy;
      });
    };

  const onChange =
    (i: number, field: keyof Omit<Entry, "student">) =>
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const val = ev.target.value;
      setEntries((prev) => {
        const copy = [...prev];
        // @ts-expect-error: we know field is valid on Entry
        copy[i][field] = val;
        return copy;
      });
    };

  return (
    <div>
      {/* Date picker */}
      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{selectedDate.toDateString()}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d!);
                toast(`Date: ${d!.toDateString()}`);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form */}
      {Object.entries(grouped).map(([cls, studs]) => (
        <div key={cls} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">{cls}</h2>
          <div className="space-y-4">
            {studs.map((s) => {
              const i = entries.findIndex((e) => e.student === s._id);
              // just in case, skip if missing
              if (i < 0) return null;
              const ent = entries[i];

              return (
                <div
                  key={s._id}
                  className="grid grid-cols-6 gap-3 items-center"
                >
                  <span className="col-span-2">{s.name}</span>

                  <div className="flex items-center">
                    <Checkbox
                      checked={ent.present}
                      onCheckedChange={onCheck(i, "present")}
                    />
                    <Label className="ml-2">Present</Label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      checked={ent.absent}
                      onCheckedChange={onCheck(i, "absent")}
                      disabled={ent.present}
                    />
                    <Label className="ml-2">Absent</Label>
                  </div>

                  <Input
                    type="time"
                    placeholder="Late time"
                    value={ent.lateEntry ?? ""}
                    onChange={onChange(i, "lateEntry")}
                    disabled={ent.absent}
                  />

                  <Input
                    type="time"
                    placeholder="Early leave time"
                    value={ent.earlyLeave ?? ""}
                    onChange={onChange(i, "earlyLeave")}
                    disabled={ent.absent}
                  />

                  <Input
                    placeholder="Comment"
                    value={ent.comment}
                    onChange={onChange(i, "comment")}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={() => {
          console.log("Submitting", { date: dateStr, entries });
          mutation.mutate({ date: dateStr, entries });
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving…" : "Save Attendance"}
      </Button>
    </div>
  );
}
